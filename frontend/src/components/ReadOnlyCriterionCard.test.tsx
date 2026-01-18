import "@testing-library/jest-dom/vitest";
// Shared lightweight mocks for shadcn/radix-style UI components.
// These keep tests focused on component logic rather than styling/implementation details.
import {describe, expect, it, vi} from "vitest";
import {fireEvent, render, screen} from "@testing-library/react";
import {ReadOnlyCriterionCard} from "./ReadOnlyCriterionCard";
import type {Criterion} from "../types";

vi.mock("./ui/card", () => ({
    Card: ({children, ...props}: any) => <div data-testid="Card" {...props}>{children}</div>,
}));
vi.mock("./ui/badge", () => ({
    Badge: ({children, className = "", ...props}: any) => <span data-testid="Badge"
                                                                className={className} {...props}>{children}</span>,
}));
vi.mock("./ui/label", () => ({
    Label: ({children, htmlFor, ...props}: any) => <label htmlFor={htmlFor} {...props}>{children}</label>,
}));
vi.mock("./ui/button", () => ({
    Button: ({children, onClick, type = "button", ...props}: any) => (
        <button type={type} onClick={onClick} {...props}>{children}</button>
    ),
}));
vi.mock("./ui/input", () => ({
    Input: ({value, onChange, ...props}: any) => <input value={value} onChange={onChange} {...props} />,
}));
vi.mock("./ui/textarea", () => ({
    Textarea: ({defaultValue, onBlur, ...props}: any) => <textarea defaultValue={defaultValue}
                                                                   onBlur={onBlur} {...props} />,
}));
vi.mock("./ui/checkbox", () => ({
    Checkbox: ({checked, onCheckedChange, id, ...props}: any) => (
        <input
            id={id}
            data-testid={id}
            type="checkbox"
            checked={!!checked}
            onChange={(e) => onCheckedChange?.(e.target.checked)}
            {...props}
        />
    ),
}));


vi.mock("lucide-react", () => ({
    ChevronDown: (props: any) => <svg data-testid="ChevronDown" {...props} />,
    ChevronUp: (props: any) => <svg data-testid="ChevronUp" {...props} />,
}));

function makeCriterion(overrides: Partial<Criterion> = {}): Criterion {
    return {
        id: "A1",
        title: "Titel",
        question: "Frage?",
        requirements: ["r1", "r2"],
        checked: [1],
        notes: "note",
        qualityLevels: {
            "0": {description: "n/a", minRequirements: 0, requiredIndexes: []},
            "1": {description: "lvl1", minRequirements: 1, requiredIndexes: [0]},
            "2": {description: "lvl2", minRequirements: 2, requiredIndexes: [0, 1]},
            "3": {description: "lvl3", minRequirements: 2, requiredIndexes: []},
        },
        ...overrides,
    } as unknown as Criterion;
}

describe("ReadOnlyCriterionCard", () => {
    it("is collapsed by default and expands on click", () => {
        render(<ReadOnlyCriterionCard criterion={makeCriterion()}/>);

        // Collapsed: requirements not shown
        expect(screen.queryByText("r1")).not.toBeInTheDocument();

        fireEvent.click(screen.getByText("Titel"));
        expect(screen.getByText("r1")).toBeInTheDocument();
        expect(screen.getByText("r2")).toBeInTheDocument();

        // Notes shown when expanded
        expect(screen.getByText(/Notizen/i)).toBeInTheDocument();
        expect(screen.getByText("note")).toBeInTheDocument();
    });

    it("respects defaultExpanded=true", () => {
        render(<ReadOnlyCriterionCard criterion={makeCriterion()} defaultExpanded/>);
        expect(screen.getByText("r1")).toBeInTheDocument();
    });
});
