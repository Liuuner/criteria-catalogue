import "@testing-library/jest-dom/vitest";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {act, fireEvent, render, screen} from "@testing-library/react";
import CriteriaSearchList from "./CriteriaSearchList";
import type {Criterion} from "../types";

vi.mock("./ui/input", () => ({
    Input: ({value, onChange, ...props}: any) => <input value={value} onChange={onChange} {...props} />,
}));
vi.mock("./ui/button", () => ({
    Button: ({children, onClick, type = "button", ...props}: any) => (
        <button type={type} onClick={onClick} {...props}>{children}</button>
    ),
}));

vi.mock("lucide-react", () => ({
    Search: (props: any) => <svg data-testid="SearchIcon" {...props} />,
    X: (props: any) => <svg data-testid="XIcon" {...props} />,
}));

// Make sorting stable & predictable
vi.mock("../utils/helper/sortHelper.ts", () => ({
    compareIds: (a: string, b: string) => a.localeCompare(b),
}));

/**
 * IMPORTANT: CriteriaSearchList calls `index(criteria)` in a useEffect.
 * Our mock stores the indexed array outside React state, so the component will not re-render
 * just because `index()` ran.
 *
 * To make the component recompute `filteredCriteria`, we trigger a query change (debounced),
 * which forces a re-render and uses the now-indexed data.
 */
let indexed: any[] = [];
vi.mock("../utils/hooks/useFlexSearch.tsx", () => ({
    default: () => ({
        index: (criteria: any[]) => {
            indexed = criteria;
        },
        search: (q: string) => {
            if (!q) return indexed;
            const qq = q.toLowerCase();
            return indexed.filter((c: any) => (c.id + " " + c.title + " " + c.question).toLowerCase().includes(qq));
        },
    }),
}));

function c(id: string, title = id): Criterion {
    return {
        id,
        title,
        question: "Q",
        requirements: ["r1"],
        checked: [],
        notes: "",
        qualityLevels: {
            "0": {description: "0", minRequirements: 0, requiredIndexes: []},
            "1": {description: "1", minRequirements: 1, requiredIndexes: [0]},
            "2": {description: "2", minRequirements: 1, requiredIndexes: [0]},
            "3": {description: "3", minRequirements: 1, requiredIndexes: []},
        },
    } as unknown as Criterion;
}

async function primeIndexAndRenderList() {
    const input = screen.getByPlaceholderText(/Search criteria/i) as HTMLInputElement;

    // Force a re-render after index() has run by changing query twice (debounced).
    fireEvent.change(input, {target: {value: "a"}});
    await act(async () => {
        vi.advanceTimersByTime(160);
    });

    fireEvent.change(input, {target: {value: ""}});
    await act(async () => {
        vi.advanceTimersByTime(160);
    });

    return input;
}

describe("CriteriaSearchList", () => {
    beforeEach(() => {
        indexed = [];
        vi.useFakeTimers();
    });
    afterEach(() => {
        vi.useRealTimers();
    });

    it("renders sections Teil 1 / Teil 2 and lists criteria after indexing", async () => {
        const criteria = [c("A1"), c("DOC1"), c("B2")];

        render(
            <CriteriaSearchList
                criteria={criteria}
                renderCriterion={(crit) => <div data-testid="crit">{crit.id}</div>}
                openCreationDialog={() => {
                }}
            />
        );

        await primeIndexAndRenderList();

        expect(screen.getByText("Teil 1")).toBeInTheDocument();
        expect(screen.getByText("Teil 2")).toBeInTheDocument();

        const ids = screen.getAllByTestId("crit").map((n) => n.textContent);
        // Part 1 should contain A1 + B2, Part 2 contains DOC1
        expect(ids).toEqual(["A1", "B2", "DOC1"]);
    });

    it("debounces search and filters list", async () => {
        const criteria = [c("A1"), c("DOC1"), c("B2")];

        render(
            <CriteriaSearchList
                criteria={criteria}
                renderCriterion={(crit) => <div data-testid="crit">{crit.id}</div>}
                openCreationDialog={() => {
                }}
            />
        );

        // Prime so initial list renders
        const input = await primeIndexAndRenderList();

        fireEvent.change(input, {target: {value: "doc"}});

        // Before debounce timer, list should still show all
        expect(screen.getAllByTestId("crit")).toHaveLength(3);

        await act(async () => {
            vi.advanceTimersByTime(160);
        });

        const items = screen.getAllByTestId("crit").map((n) => n.textContent);
        expect(items).toEqual(["DOC1"]);
    });

    it("supports '/' and Ctrl+F keyboard shortcuts to focus the input", async () => {
        const criteria = [c("A1")];

        render(
            <CriteriaSearchList
                criteria={criteria}
                renderCriterion={(crit) => <div data-testid="crit">{crit.id}</div>}
                openCreationDialog={() => {
                }}
            />
        );

        const input = screen.getByPlaceholderText(/Search criteria/i) as HTMLInputElement;

        fireEvent.keyDown(document, {key: "/"});
        expect(document.activeElement).toBe(input);

        input.blur();
        fireEvent.keyDown(document, {key: "f", ctrlKey: true});
        expect(document.activeElement).toBe(input);
    });

    it("clears query via X button", async () => {
        const criteria = [c("A1"), c("DOC1")];

        render(
            <CriteriaSearchList
                criteria={criteria}
                renderCriterion={(crit) => <div data-testid="crit">{crit.id}</div>}
                openCreationDialog={() => {
                }}
            />
        );

        const input = await primeIndexAndRenderList();

        // Search "doc"
        fireEvent.change(input, {target: {value: "doc"}});
        await act(async () => {
            vi.advanceTimersByTime(160);
        });

        expect(screen.getAllByTestId("crit")).toHaveLength(1);

        // Click the clear button (contains the X icon)
        const clearBtn = screen.getByTestId("XIcon").closest("button")!;
        fireEvent.click(clearBtn);

        await act(async () => {
            vi.advanceTimersByTime(160);
        });

        // Back to all items
        expect(screen.getAllByTestId("crit")).toHaveLength(2);
    });
});
