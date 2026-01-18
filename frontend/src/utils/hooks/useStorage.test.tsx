import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useStorage } from "./useStorage";

/**
 * NOTE (important):
 * Your hook depends on `defaultValue` (via `readValue` useCallback deps) and runs:
 *   useEffect(() => setStoredValue(readValue()), [readValue])
 *
 * If the test passes an inline object literal as defaultValue inside renderHook,
 * React will create a NEW object on every re-render, causing an infinite re-render loop.
 *
 * So in tests we ALWAYS keep default objects in a stable const, and pass that const.
 */

class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  get length() {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

describe("useStorage", () => {
  let storage: MemoryStorage;

  beforeEach(() => {
    storage = new MemoryStorage();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    storage.clear();
  });

  it("returns defaultValue when key is missing", () => {
    const defaultObj = { a: 1 };
    const { result } = renderHook(() => useStorage("k", defaultObj, storage));
    expect(result.current[0]).toEqual({ a: 1 });
  });

  it("reads JSON if stored value is JSON", () => {
    storage.setItem("k", JSON.stringify({ a: 2 }));
    const defaultObj = { a: 1 };
    const { result } = renderHook(() => useStorage("k", defaultObj, storage));
    expect(result.current[0]).toEqual({ a: 2 });
  });

  it("falls back to raw string if JSON.parse fails", () => {
    storage.setItem("k", "plain-text");
    const { result } = renderHook(() => useStorage("k", "default", storage));
    expect(result.current[0]).toBe("plain-text");
  });

  it("setValue stores JSON for objects, and updates state", () => {
    const defaultObj = { a: 1 };
    const { result } = renderHook(() => useStorage("k", defaultObj, storage));

    act(() => result.current[1]({ a: 9 }));

    expect(result.current[0]).toEqual({ a: 9 });
    expect(storage.getItem("k")).toBe(JSON.stringify({ a: 9 }));
  });

  it("setValue stores plain string/number without JSON.stringify", () => {
    const { result: r1 } = renderHook(() => useStorage("s", "x", storage));
    act(() => r1.current[1]("hello"));
    expect(storage.getItem("s")).toBe("hello");

    const { result: r2 } = renderHook(() => useStorage("n", 1, storage));
    act(() => r2.current[1](42));
    expect(storage.getItem("n")).toBe("42");
  });

  it("setValue supports updater function", () => {
    const { result } = renderHook(() => useStorage("k", 1, storage));
    act(() => result.current[1]((prev) => prev + 1));
    expect(result.current[0]).toBe(2);
    expect(storage.getItem("k")).toBe("2");
  });

  it("removeValue removes from storage and resets to defaultValue", () => {
    storage.setItem("k", "999");
    const { result } = renderHook(() => useStorage("k", "default", storage));

    expect(result.current[0]).toBe(999);

    act(() => result.current[2]()); // removeValue

    expect(result.current[0]).toBe("default");
    expect(storage.getItem("k")).toBeNull();
  });

  it("responds to 'storage' event for same key", () => {
    const { result } = renderHook(() => useStorage("k", "default", storage));
    expect(result.current[0]).toBe("default");

    act(() => {
      storage.setItem("k", "new");
      window.dispatchEvent(new StorageEvent("storage", { key: "k" }));
    });

    expect(result.current[0]).toBe("new");
  });

  it("ignores 'storage' event for different key", () => {
    const { result } = renderHook(() => useStorage("k", "default", storage));

    act(() => {
      storage.setItem("other", "zzz");
      window.dispatchEvent(new StorageEvent("storage", { key: "other" }));
    });

    expect(result.current[0]).toBe("default");
  });

  it("warns and returns defaultValue if storage.getItem throws", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const badStorage: Storage = {
      ...storage,
      getItem: () => {
        throw new Error("boom");
      },
    } as any;

    const { result } = renderHook(() => useStorage("k", "default", badStorage));
    expect(result.current[0]).toBe("default");
    expect(warn).toHaveBeenCalled();
  });

  it("warns if storage.setItem throws (but still updates state)", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const badStorage: Storage = {
      ...storage,
      setItem: () => {
        throw new Error("boom");
      },
    } as any;

    const { result } = renderHook(() => useStorage("k", "default", badStorage));
    act(() => result.current[1]("x"));
    expect(result.current[0]).toBe("x");
    expect(warn).toHaveBeenCalled();
  });
});
