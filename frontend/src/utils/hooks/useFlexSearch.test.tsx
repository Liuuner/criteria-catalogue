import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { Criterion } from "../../types";

// Mock flexsearch with a tiny in-memory index that behaves predictably.
vi.mock("flexsearch", () => {
  class Index {
    private docs = new Map<string, string>();

    add(id: string, text: string) {
      this.docs.set(String(id), String(text));
    }

    // Very small "search": returns ids where text includes query (case-insensitive)
    search(query: string) {
      const q = String(query).toLowerCase();
      const out: string[] = [];
      for (const [id, text] of this.docs.entries()) {
        if (text.toLowerCase().includes(q)) out.push(id);
      }
      return out;
    }
  }

  return { default: { Index }, Index };
});

import useFlexSearch from "./useFlexSearch";

function c(id: string, overrides: Partial<Criterion> = {}): Criterion {
  return {
    id,
    title: `Title ${id}`,
    question: `Question ${id}`,
    requirements: ["req one", "req two"],
    checked: [],
    notes: "",
    qualityLevels: {
      "0": { description: "0", minRequirements: 0, requiredIndexes: [] },
      "1": { description: "1", minRequirements: 1, requiredIndexes: [0] },
      "2": { description: "2", minRequirements: 2, requiredIndexes: [0, 1] },
      "3": { description: "3", minRequirements: 2, requiredIndexes: [] },
    },
    ...overrides,
  } as unknown as Criterion;
}

describe("useFlexSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty list before indexing (empty map)", () => {
    const { result } = renderHook(() => useFlexSearch());
    expect(result.current.search("")).toEqual([]);
  });

  it("index() stores criteria and search('') returns all criteria", () => {
    const { result } = renderHook(() => useFlexSearch());
    const crit = [c("A1"), c("DOC1"), c("B2")];

    act(() => {
      result.current.index(crit);
    });

    const all = result.current.search("");
    expect(all.map((x) => x.id).sort()).toEqual(["A1", "B2", "DOC1"]);
  });

  it("search(query) matches across id/title/question/notes/requirements", () => {
    const { result } = renderHook(() => useFlexSearch());
    const crit = [
      c("A1", { title: "Alpha" }),
      c("B2", { notes: "special-note" }),
      c("DOC1", { requirements: ["install docker", "write docs"] }),
    ];

    act(() => result.current.index(crit));

    expect(result.current.search("alpha").map((x) => x.id)).toEqual(["A1"]);
    expect(result.current.search("special").map((x) => x.id)).toEqual(["B2"]);
    expect(result.current.search("docker").map((x) => x.id)).toEqual(["DOC1"]);
    expect(result.current.search("DOC1").map((x) => x.id)).toEqual(["DOC1"]);
  });

  it("re-indexing replaces the map with new criteria", () => {
    const { result } = renderHook(() => useFlexSearch());

    act(() => result.current.index([c("A1"), c("B2")]));
    expect(result.current.search("").map((x) => x.id).sort()).toEqual(["A1", "B2"]);

    act(() => result.current.index([c("DOC1")]));
    expect(result.current.search("").map((x) => x.id)).toEqual(["DOC1"]);
  });

  it("search ignores whitespace-only queries and returns all", () => {
    const { result } = renderHook(() => useFlexSearch());
    act(() => result.current.index([c("A1"), c("B2")]));

    expect(result.current.search("   ").map((x) => x.id).sort()).toEqual(["A1", "B2"]);
  });
});
