import "@testing-library/jest-dom/vitest";
// Shared lightweight mocks for shadcn/radix-style UI components.
// These keep tests focused on component logic rather than styling/implementation details.
import {beforeEach, describe, expect, it, vi} from "vitest";
import {render, screen} from "@testing-library/react";
import {GradesDisplay} from "./GradesDisplay";

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


// Mock CompactCriterionCard to easily assert props being passed
vi.mock("./CompactCriterionCard.tsx", () => ({
    CompactCriterionCard: (props: any) => (
        <div data-testid="CompactCriterionCard" data-id={props.criterionId} data-level={props.qualityLevel}/>
    ),
}));

// Mock API
const getGradesMock = vi.fn();
vi.mock("../utils/service/projectApi.ts", () => ({
    getGrades: (...args: any[]) => getGradesMock(...args),
}));

function makeGradesPayload() {
    return {
        part1: {
            grade: 5.5,
            criterionGrades: [
                {criterionId: "A1", criterionTitle: "T1", qualityLevel: 3},
            ],
        },
        part2: {
            grade: 3.5,
            criterionGrades: [
                {criterionId: "DOC1", criterionTitle: "T2", qualityLevel: 1},
            ],
        },
    };
}

describe("GradesDisplay", () => {
    beforeEach(() => {
        getGradesMock.mockReset();
    });

    it("shows fallback text when no grades are returned", async () => {
        getGradesMock.mockResolvedValueOnce(null);
        render(<GradesDisplay id="X"/>);
        expect(await screen.findByText(/Keine Notendaten verfügbar/i)).toBeInTheDocument();
    });

    it("renders grades and passes criterion ids to CompactCriterionCard", async () => {
        getGradesMock.mockResolvedValueOnce(makeGradesPayload());
        render(<GradesDisplay id="X"/>);

        // Part headings
        expect(await screen.findByText(/Teil 1: Umsetzung/i)).toBeInTheDocument();
        expect(screen.getByText(/Teil 2: Dokumentation/i)).toBeInTheDocument();

        // Grades appear
        expect(screen.getByText("5.5")).toBeInTheDocument();
        expect(screen.getByText("3.5")).toBeInTheDocument();

        // Compact cards (all criteria combined)
        const cards = screen.getAllByTestId("CompactCriterionCard");
        expect(cards).toHaveLength(2);
        expect(cards[0]).toHaveAttribute("data-id", "A1");
        expect(cards[1]).toHaveAttribute("data-id", "DOC1");
    });
});
