import {type ReactNode, useEffect} from "react";

type DialogProps = {
    open: boolean;
    title?: string;
    description?: string;
    onClose: () => void;
    children?: ReactNode;
    size?: 'default' | 'small';
};

const Dialog = ({
                    open,
                    title = "Dialog",
                    description,
                    onClose,
                    children,
                    size = 'default',
                }: DialogProps) => {
    useEffect(() => {
        if (!open) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        globalThis.addEventListener("keydown", onKeyDown);
        return () => globalThis.removeEventListener("keydown", onKeyDown);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 w-full h-full">
            {/* Overlay */}
            <button
                aria-label="Close dialog overlay"
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
            />

            {/* Dialog */}
            <div
                aria-modal="true"
                aria-labelledby="dialog-title"
                aria-describedby={description ? "dialog-desc" : undefined}
                className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl ${
                    size === 'small'
                        ? 'w-auto max-w-md'
                        : 'min-w-[92vw] max-w-lg overflow-auto h-10/12'
                }`}
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <h2 id="dialog-title" className="text-lg font-semibold text-slate-900">
                            {title}
                        </h2>

                        {description && (
                            <p id="dialog-desc" className="mt-1 text-sm text-slate-600">
                                {description}
                            </p>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                <div className="mt-4">{children}</div>
            </div>
        </div>
    );
};

export default Dialog;
