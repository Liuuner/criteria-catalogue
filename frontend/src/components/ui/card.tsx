import {cn} from "./utils";
import type {ComponentProps} from "react";

function Card({className, ...props}: ComponentProps<"div">) {
    return (
        <div
            data-slot="card"
            className={cn(
                "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border",
                className,
            )}
            {...props}
        />
    );
}

export {
    Card
};
