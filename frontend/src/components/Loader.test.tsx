import "@testing-library/jest-dom/vitest";
import {describe, expect, it} from "vitest";
import {render, screen} from "@testing-library/react";

import Loader from "./Loader";

describe("Loader", () => {
    it("renders loading text and spinner", () => {
        render(<Loader/>);
        expect(screen.getByText(/Lade Daten/i)).toBeInTheDocument();
        // spinner div exists (by class)
        const spinner = document.querySelector(".animate-spin");
        expect(spinner).toBeTruthy();
    });
});
