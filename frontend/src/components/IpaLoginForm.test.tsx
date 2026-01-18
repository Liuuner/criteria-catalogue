import "@testing-library/jest-dom/vitest";
// Shared lightweight mocks for shadcn/radix-style UI components.
// These keep tests focused on component logic rather than styling/implementation details.
import {describe, expect, it, vi} from "vitest";
import {fireEvent, render, screen} from "@testing-library/react";
import {IpaLoginForm} from "./IpaLoginForm";

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


describe("IpaLoginForm", () => {
    it("uppercases IPA ID on submit", () => {
        const onSave = vi.fn();
        render(<IpaLoginForm onSave={onSave}/>);

        const input = screen.getByLabelText(/IPA ID/i) as HTMLInputElement;
        fireEvent.change(input, {target: {value: "ab12"}});
        fireEvent.submit(screen.getByRole("button", {name: /IPA Laden/i}).closest("form")!);

        expect(onSave).toHaveBeenCalledWith("AB12");
    });

    it("requires input", () => {
        const onSave = vi.fn();
        render(<IpaLoginForm onSave={onSave}/>);
        const input = screen.getByLabelText(/IPA ID/i) as HTMLInputElement;
        expect(input).toBeRequired();
    });
});
