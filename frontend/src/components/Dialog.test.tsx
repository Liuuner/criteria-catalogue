import "@testing-library/jest-dom/vitest";
import {describe, expect, it, vi} from "vitest";
import {fireEvent, render, screen} from "@testing-library/react";

import Dialog from "./Dialog";

describe("Dialog", () => {
    it("renders nothing when closed", () => {
        const onClose = vi.fn();
        const {container} = render(<Dialog open={false} onClose={onClose}>Hi</Dialog>);
        expect(container).toBeEmptyDOMElement();
    });

    it("renders title/description and children when open", () => {
        const onClose = vi.fn();
        render(
            <Dialog open={true} title="My Title" description="Desc" onClose={onClose}>
                <div>Child</div>
            </Dialog>
        );
        expect(screen.getByText("My Title")).toBeInTheDocument();
        expect(screen.getByText("Desc")).toBeInTheDocument();
        expect(screen.getByText("Child")).toBeInTheDocument();
        expect(screen.getByRole("button", {name: /Close dialog overlay/i})).toBeInTheDocument();
    });

    it("closes when clicking overlay", () => {
        const onClose = vi.fn();
        render(<Dialog open={true} onClose={onClose}>X</Dialog>);
        fireEvent.click(screen.getByRole("button", {name: /Close dialog overlay/i}));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("closes when clicking the close button", () => {
        const onClose = vi.fn();
        render(<Dialog open={true} onClose={onClose}>X</Dialog>);
        fireEvent.click(screen.getByRole("button", {name: "Close"}));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("closes on Escape key when open", () => {
        const onClose = vi.fn();
        render(<Dialog open={true} onClose={onClose}>X</Dialog>);
        fireEvent.keyDown(window, {key: "Escape"});
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
