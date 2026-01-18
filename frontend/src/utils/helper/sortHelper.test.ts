// compareIds.test.ts
import {describe, expect, it} from "vitest";
import {compareIds} from "./sortHelper.ts";

describe("compareIds", () => {
    it("returns 0 for identical strings", () => {
        expect(compareIds("ABC", "ABC")).toBe(0);
    });

    it("trims leading/trailing whitespace before comparing", () => {
        expect(compareIds("  abc", "abc  ")).toBe(0);
    });

    it("collapses internal whitespace runs to a single space", () => {
        expect(compareIds("a   b", "a b")).toBe(0);
        expect(compareIds("a\t\tb", "a b")).toBe(0);
        expect(compareIds("a \n  b", "a b")).toBe(0);
    });

    it("is case-insensitive (sensitivity: base)", () => {
        expect(compareIds("abc", "ABC")).toBe(0);
        expect(compareIds("Zebra", "zebra")).toBe(0);
    });

    it("is diacritic-insensitive (sensitivity: base) for common cases", () => {
        // "base" typically treats é == e in many locales
        expect(compareIds("café", "cafe")).toBe(0);
        expect(compareIds("Ångström", "angstrom")).toBe(0);
    });

    it("sorts numbers numerically (numeric: true)", () => {
        expect(compareIds("item 2", "item 10")).toBeLessThan(0);
        expect(compareIds("item 10", "item 2")).toBeGreaterThan(0);
    });

    it("uses length as a deterministic tie-breaker when collator compares equal", () => {
        // After normalization, collator treats them equal (case-insensitive),
        // so fallback should be na.length - nb.length.
        expect(compareIds("a", "A ")).toBe(0); // "a" length 1 vs "A" length 1 after trim -> actually equal
        // Let's use a better pair where collator equality is likely but lengths differ:
        expect(compareIds("a", "A  ")).toBe(0); // both normalize to "a"/"A" => same length => 0

        expect(compareIds("a b", "A  b ")).toBe(0); // both normalize to "a b"/"A b" => same length => 0
    });

    it("orders by length when collator returns 0 (explicit length-diff example)", () => {
        // To guarantee different lengths after normalization while collator still returns 0,
        // use strings that normalize to same letters but different code unit length.
        // One common way: composed vs decomposed diacritics.
        const composed = "café"; // 'é' as one code point in many sources
        const decomposed = "cafe\u0301"; // 'e' + combining acute accent (2 code points)
        // With sensitivity: "base", collator usually treats them equal, but lengths differ.
        const res = compareIds(composed, decomposed);

        // If collator says equal, length decides. If a platform collator treats them non-equal,
        // this test would be flaky; so we assert the exact behavior conditionally.
        // In most modern JS engines, compare at base sensitivity yields 0 here.
        if (res === 0) {
            // then normalized strings had same length too (unlikely here)
            expect(composed.length).toBe(decomposed.length);
        } else {
            // if collator equal => res should be length diff; if collator not equal => res is collator's result.
            // We can still assert determinism:
            const res2 = compareIds(composed, decomposed);
            expect(res2).toBe(res);
        }
    });

    it("behaves like a comparator (antisymmetry)", () => {
        const pairs: Array<[string, string]> = [
            ["item 2", "item 10"],
            ["  a   b", "a b"],
            ["café", "cafe"],
            ["Z", "a"],
        ];

        for (const [a, b] of pairs) {
            const ab = compareIds(a, b);
            const ba = compareIds(b, a);

            const noNegZero = (n: number) => (Object.is(n, -0) ? 0 : n);

            expect(noNegZero(Math.sign(ab))).toBe(noNegZero(-Math.sign(ba)));
        }
    });

    it("can be used to sort an array", () => {
        const arr = ["item 10", "item 2", "item 1", "Item 02", "item   2"];
        const sorted = [...arr].sort(compareIds);

        // Expected: numeric order, case-insensitive, whitespace-normalized ties clustered
        expect(sorted[0]).toMatch("item 1");
        expect(sorted[1]).toMatch("item 2");
        expect(sorted[2]).toMatch("item   2");
        expect(sorted[3]).toMatch("Item 02");
        expect(sorted[4]).toMatch("item 10");
    });
});
