import "@testing-library/jest-dom/vitest";
import {describe, expect, it, vi} from "vitest";
import {fireEvent, render, screen} from "@testing-library/react";
import {CriteriaList} from "./CriteriaList";
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

// Mock CriteriaSearchList: keep list visible but avoid flexsearch complexity here
vi.mock("./CriteriaSearchList.tsx", () => ({
    default: (props: any) => (
        <div>
            <button type="button" onClick={props.openCreationDialog}>+ Neues Kriterium</button>
            <div data-testid="RenderedList">
                {props.criteria.map((c: any) => (
                    <div key={c.id}>{props.renderCriterion(c)}</div>
                ))}
            </div>
        </div>
    ),
}));

function makeCriterion(id: string, overrides: Partial<Criterion> = {}): Criterion {
    return {
        id,
        title: "T",
        question: "Q",
        requirements: ["r1", "r2"],
        checked: [],
        notes: "",
        qualityLevels: {
            "0": {description: "0", minRequirements: 0, requiredIndexes: []},
            "1": {description: "1", minRequirements: 1, requiredIndexes: [0]},
            "2": {description: "2", minRequirements: 2, requiredIndexes: [0, 1]},
            "3": {description: "3", minRequirements: 2, requiredIndexes: []},
        },
        ...overrides,
    } as unknown as Criterion;
}

describe("CriteriaList", () => {
    it("opens create dialog and saves a trimmed criterion", () => {
        const onSaveCriterion = vi.fn();
        const onUpdateCriterion = vi.fn();
        const onDeleteCriterion = vi.fn();

        render(
            <CriteriaList
                criteria={[]}
                onSaveCriterion={onSaveCriterion}
                onUpdateCriterion={onUpdateCriterion}
                onDeleteCriterion={onDeleteCriterion}
                defaultCriteria={[makeCriterion("PRE1", {title: "Preset", question: "Preset Q"})]}
            />
        );

        fireEvent.click(screen.getAllByText("+ Neues Kriterium")[0]);
        expect(screen.getByText(/Kriterium erstellen/i)).toBeInTheDocument();

        // Fill required fields with whitespace to verify trimming
        fireEvent.change(screen.getByLabelText(/^ID \*/i), {target: {value: "  A9  "}});
        fireEvent.change(screen.getByLabelText(/^Titel \*/i), {target: {value: "  Title  "}});
        fireEvent.change(screen.getByLabelText(/^Frage \*/i), {target: {value: "  Question  "}});

        // Requirements first field is required; fill it
        fireEvent.change(screen.getByPlaceholderText(/Kriterium 1/i), {target: {value: "  Req 1  "}});

        // Submit the form directly (more reliable across button implementations)
        const form = screen.getByLabelText(/^ID \*/i).closest("form")!;
        fireEvent.submit(form);

        expect(onSaveCriterion).toHaveBeenCalledTimes(1);
        const saved = onSaveCriterion.mock.calls[0][0] as Criterion;
        expect(saved.id).toBe("A9");
        expect(saved.title).toBe("Title");
        expect(saved.question).toBe("Question");
        expect(saved.requirements[0]).toBe("Req 1");
    });

    it("applyPreset loads a default criterion into the form", () => {
        const onSaveCriterion = vi.fn();
        const onUpdateCriterion = vi.fn();
        const onDeleteCriterion = vi.fn();

        const preset = makeCriterion("PRE1", {
            title: "Preset Title",
            question: "Preset Question",
            requirements: ["x", "y", "z"],
            qualityLevels: {
                "0": {description: "0", minRequirements: 0, requiredIndexes: []},
                "1": {description: "1", minRequirements: 1, requiredIndexes: [0]},
                "2": {description: "2", minRequirements: 2, requiredIndexes: [0, 2]},
                "3": {description: "3", minRequirements: 3, requiredIndexes: []},
            } as any,
        });

        render(
            <CriteriaList
                criteria={[]}
                onSaveCriterion={onSaveCriterion}
                onUpdateCriterion={onUpdateCriterion}
                onDeleteCriterion={onDeleteCriterion}
                defaultCriteria={[preset]}
            />
        );

        fireEvent.click(screen.getAllByText("+ Neues Kriterium")[0]);

        // Select preset
        fireEvent.change(screen.getByLabelText(/Preset/i), {target: {value: "PRE1"}});

        expect((screen.getByLabelText(/^ID \*/i) as HTMLInputElement).value).toBe("PRE1");
        expect((screen.getByLabelText(/^Titel \*/i) as HTMLInputElement).value).toBe("Preset Title");
        expect((screen.getByLabelText(/^Frage \*/i) as HTMLInputElement).value).toBe("Preset Question");
        expect(screen.getByPlaceholderText(/Kriterium 3/i)).toBeInTheDocument();
    });

    it("removing a requirement shifts requiredIndexes for quality levels", () => {
        const onSaveCriterion = vi.fn();
        const onUpdateCriterion = vi.fn();
        const onDeleteCriterion = vi.fn();

        const preset = makeCriterion("PRE2", {
            requirements: ["a", "b", "c"],
            qualityLevels: {
                "0": {description: "0", minRequirements: 0, requiredIndexes: []},
                "1": {description: "1", minRequirements: 1, requiredIndexes: [0]},
                "2": {description: "2", minRequirements: 2, requiredIndexes: [1, 2]}, // will shift when removing idx 1
                "3": {description: "3", minRequirements: 3, requiredIndexes: []},
            } as any,
        });

        render(
            <CriteriaList
                criteria={[]}
                onSaveCriterion={onSaveCriterion}
                onUpdateCriterion={onUpdateCriterion}
                onDeleteCriterion={onDeleteCriterion}
                defaultCriteria={[preset]}
            />
        );

        fireEvent.click(screen.getAllByText("+ Neues Kriterium")[0]);
        fireEvent.change(screen.getByLabelText(/Preset/i), {target: {value: "PRE2"}});

        // Remove requirement 2 ("b") via the remove button next to Kriterium 2 input
        const req2 = screen.getByPlaceholderText(/Kriterium 2/i);
        const row = req2.closest("div")!;
        const removeBtn = row.querySelector("button") as HTMLButtonElement;
        fireEvent.click(removeBtn);

        // Now only 2 requirements exist: Kriterium 1 and Kriterium 2
        expect(screen.queryByPlaceholderText(/Kriterium 3/i)).not.toBeInTheDocument();
    });
});
