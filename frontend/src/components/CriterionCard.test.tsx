import "@testing-library/jest-dom/vitest";
// Shared lightweight mocks for shadcn/radix-style UI components.
// These keep tests focused on component logic rather than styling/implementation details.
import {describe, expect, it, vi} from "vitest";
import {fireEvent, render, screen} from "@testing-library/react";
import {CriterionCard} from "./CriterionCard";
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


function makeCriterion(overrides: Partial<Criterion> = {}): Criterion {
    return {
        id: "A1",
        title: "Titel",
        question: "Frage?",
        requirements: ["r1", "r2", "r3", "r4", "r5"],
        checked: [],
        notes: "",
        qualityLevels: {
            "0": {description: "n/a", minRequirements: 0, requiredIndexes: []},
            "1": {description: "lvl1", minRequirements: 2, requiredIndexes: [0]},
            "2": {description: "lvl2", minRequirements: 4, requiredIndexes: [0, 1]},
            "3": {description: "lvl3", minRequirements: 5, requiredIndexes: []},
        },
        ...overrides,
    } as unknown as Criterion;
}

describe("CriterionCard", () => {
    it("shows Gütestufe 0 when nothing is checked", () => {
        const onSave = vi.fn();
        const onDelete = vi.fn();
        render(<CriterionCard criterion={makeCriterion()} onSave={onSave} onDelete={onDelete}/>);
        expect(screen.getByText(/Gütestufe 0/i)).toBeInTheDocument();
    });

    it("shows Gütestufe 3 when all requirements are checked", () => {
        const onSave = vi.fn();
        const onDelete = vi.fn();
        const c = makeCriterion({checked: [0, 1, 2, 3, 4]});
        render(<CriterionCard criterion={c} onSave={onSave} onDelete={onDelete}/>);
        expect(screen.getByText(/Gütestufe 3/i)).toBeInTheDocument();
    });

    it("computes Gütestufe 2 when required indexes + minRequirements are satisfied", () => {
        const onSave = vi.fn();
        const onDelete = vi.fn();
        // requiredIndexes for level 2: [0,1], minRequirements: 4
        const c = makeCriterion({checked: [0, 1, 2, 3]});
        render(<CriterionCard criterion={c} onSave={onSave} onDelete={onDelete}/>);
        expect(screen.getByText(/Gütestufe 2/i)).toBeInTheDocument();
    });

    it("calls onSave when toggling a checkbox", () => {
        const onSave = vi.fn();
        const onDelete = vi.fn();
        const c = makeCriterion();
        render(<CriterionCard criterion={c} onSave={onSave} onDelete={onDelete}/>);

        const cb = screen.getByTestId("A1-req-0");
        fireEvent.click(cb);

        expect(onSave).toHaveBeenCalledTimes(1);
        const saved = onSave.mock.calls[0][0] as Criterion;
        expect(saved.checked).toContain(0);
    });

    it("calls onSave with notes on textarea blur", () => {
        const onSave = vi.fn();
        const onDelete = vi.fn();
        const c = makeCriterion({notes: "alt"});
        render(<CriterionCard criterion={c} onSave={onSave} onDelete={onDelete}/>);

        const textarea = screen.getByPlaceholderText(/Fügen Sie hier Ihre Notizen hinzu/i) as HTMLTextAreaElement;
        textarea.value = "neu";
        fireEvent.blur(textarea);

        expect(onSave).toHaveBeenCalledTimes(1);
        const saved = onSave.mock.calls[0][0] as Criterion;
        expect(saved.notes).toBe("neu");
    });

    it("opens delete dialog and confirms delete", () => {
        const onSave = vi.fn();
        const onDelete = vi.fn();
        const c = makeCriterion();
        render(<CriterionCard criterion={c} onSave={onSave} onDelete={onDelete}/>);

        fireEvent.click(screen.getByRole("button", {name: /Löschen/i}));
        expect(screen.getByText(/Kriterium löschen/i)).toBeInTheDocument();

        fireEvent.click(screen.getAllByRole("button", {name: /Löschen/i})[1]); // confirm button inside dialog
        expect(onDelete).toHaveBeenCalledWith("A1");
    });
});
