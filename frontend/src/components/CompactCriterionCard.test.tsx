import "@testing-library/jest-dom/vitest";
import {describe, expect, it} from "vitest";
import {render, screen} from "@testing-library/react";

import {CompactCriterionCard} from "./CompactCriterionCard";

describe("CompactCriterionCard", () => {
    it("renders criterion id and quality level", () => {
        render(<CompactCriterionCard criterionId="A1" qualityLevel={2}/>);
        expect(screen.getByText("A1")).toBeInTheDocument();
        expect(screen.getByText("2")).toBeInTheDocument();
    });

    it("applies a color class depending on quality level", () => {
        const {rerender, container} = render(<CompactCriterionCard criterionId="A1" qualityLevel={0}/>);
        expect(container.firstChild).toHaveClass("from-red-50");

        rerender(<CompactCriterionCard criterionId="A1" qualityLevel={3}/>);
        expect(container.firstChild).toHaveClass("from-green-50");
    });
});
