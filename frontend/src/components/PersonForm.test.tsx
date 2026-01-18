import "@testing-library/jest-dom/vitest";
// Shared lightweight mocks for shadcn/radix-style UI components.
// These keep tests focused on component logic rather than styling/implementation details.
import {describe, expect, it, vi} from "vitest";
import {fireEvent, render, screen} from "@testing-library/react";
import {PersonForm} from "./PersonForm";
import type {PersonData} from "../types";

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


function makePerson(overrides: Partial<PersonData> = {}): PersonData {
    return {
        id: "1",
        firstname: "Max",
        lastname: "Mustermann",
        topic: "Topic",
        date: "2025-01-01",
        ...overrides,
    } as unknown as PersonData;
}

describe("PersonForm", () => {
    it("calls onSave with form data when initialData is null and submitted", () => {
        const onSave = vi.fn();
        const logout = vi.fn();
        render(<PersonForm initialData={null} onSave={onSave} logout={logout}/>);

        fireEvent.change(screen.getByLabelText(/Vorname/i), {target: {value: "Anna"}});
        fireEvent.change(screen.getByLabelText(/^Name \*/i), {target: {value: "Muster"}});
        fireEvent.change(screen.getByLabelText(/Thema der Arbeit/i), {target: {value: "X"}});
        fireEvent.change(screen.getByLabelText(/Datum der Abgabe/i), {target: {value: "2026-01-18"}});

        fireEvent.submit(screen.getByRole("button", {name: /Personendaten speichern/i}).closest("form")!);

        expect(onSave).toHaveBeenCalledTimes(1);
        const saved = onSave.mock.calls[0][0] as PersonData;
        expect(saved.firstname).toBe("Anna");
        expect(saved.lastname).toBe("Muster");
        expect(saved.topic).toBe("X");
        expect(saved.date).toBe("2026-01-18");
    });

    it("prefills and disables fields when initialData is provided", () => {
        const onSave = vi.fn();
        const logout = vi.fn();
        render(<PersonForm initialData={makePerson()} onSave={onSave} logout={logout}/>);

        const firstname = screen.getByLabelText(/Vorname/i) as HTMLInputElement;
        expect(firstname.value).toBe("Max");
        expect(firstname).toBeDisabled();

        // Save button hidden in this mode
        expect(screen.queryByRole("button", {name: /Personendaten speichern/i})).not.toBeInTheDocument();

        // Logout button visible
        expect(screen.getByRole("button", {name: /Logout/i})).toBeInTheDocument();
    });

    it("logout resets form and calls logout()", () => {
        const onSave = vi.fn();
        const logout = vi.fn();
        render(<PersonForm initialData={makePerson()} onSave={onSave} logout={logout}/>);

        fireEvent.click(screen.getByRole("button", {name: /Logout/i}));
        expect(logout).toHaveBeenCalledTimes(1);
    });
});
