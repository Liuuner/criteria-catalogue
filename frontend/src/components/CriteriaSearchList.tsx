import {type ReactNode, useEffect, useMemo, useRef, useState} from "react";
import type {Criterion} from "../types.ts";
import {Input} from "./ui/input.tsx";
import useFlexSearch from "../utils/hooks/useFlexSearch.tsx";
import {Search, X} from "lucide-react";
import {compareIds} from "../utils/helper/sortHelper.ts";
import {Button} from "./ui/button.tsx";

interface CriteriaSearchListProps {
    criteria: Criterion[];
    renderCriterion: (criterion: Criterion) => ReactNode;
    placeholder?: string;
    openCreationDialog?: () => void;
}

function isCriterionPart2(criterionID: string): boolean {
    return criterionID.length >= 3 && criterionID.substring(0, 3).toLowerCase() === "doc";

}

export default function CriteriaSearchList({
                                               criteria,
                                               renderCriterion,
                                               placeholder = "Search criteria...",
                                               openCreationDialog
                                           }: Readonly<CriteriaSearchListProps>) {
    const [query, setQuery] = useState("");
    const [isPart1Open, setIsPart1Open] = useState(true);
    const [isPart2Open, setIsPart2Open] = useState(true);
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const {search, index} = useFlexSearch();
    const inputRef = useRef<HTMLInputElement>(null);

    // Keyboard shortcuts: / and Ctrl+F to focus search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Check if user is already typing in an input/textarea
            const target = e.target as HTMLElement;
            const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

            if (e.key === '/' && !isTyping) {
                e.preventDefault();
                inputRef.current?.focus();
            }

            if (e.key === 'f' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        index(criteria);
    }, [criteria, index]);

    // Debounce the query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 150); // 150ms delay

        return () => clearTimeout(timer);
    }, [query]);

    const filteredCriteria = search(debouncedQuery);

    const {part1, part2} = useMemo(() => {
        const part1: Criterion[] = [];
        const part2: Criterion[] = [];

        filteredCriteria.forEach((criterion) => {
            if (isCriterionPart2(criterion.id)) {
                part2.push(criterion);
            } else {
                part1.push(criterion);
            }
        });

        part1.sort((a, b) => compareIds(a.id, b.id));
        part2.sort((a, b) => compareIds(a.id, b.id));

        return {part1, part2};
    }, [filteredCriteria]);

    return (
        <div className="flex flex-col gap-4">
            {criteria.length !== 0 && (
                <div className="sticky top-0 z-20 bg-background pb-2 pt-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"/>
                        <Input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => {
                                setIsPart1Open(true);
                                setIsPart2Open(true);
                                setQuery(e.target.value)
                            }}
                            placeholder={placeholder}
                            className="w-full pl-10 pr-10 h-12 text-base border-2 border-muted focus:border-primary shadow-sm rounded-lg"
                        />
                        {query ? (
                            <button
                                onClick={() => setQuery("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X className="h-5 w-5"/>
                            </button>
                        ) : (
                            <kbd
                                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                                /
                            </kbd>
                        )}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {filteredCriteria.length} of {criteria.length} criteria
                    </p>
                </div>
            )}

            {openCreationDialog && ((isPart1Open && part1.length !== 0) || (isPart2Open && part2.length !== 0)) && (
                <Button type="button" onClick={openCreationDialog} variant="secondary">
                    Neues Kriterium
                </Button>
            )}

            <div className="flex flex-col">
                {/* Part 1 Section */}
                {part1.length > 0 && (
                    <section>
                        <div onClick={() => setIsPart1Open(!isPart1Open)}
                             className={"top-22 flex justify-between cursor-pointer items-center z-10 bg-background py-3 border-b" + (isPart1Open ? " sticky" : " mb-20")}>
                            <div>
                                <h2 className="text-lg font-semibold">Teil 1</h2>
                                <p className="text-sm text-muted-foreground">{part1.length} criteria</p>
                            </div>
                            <button
                                className={"w-8 h-8 pb-1 aspect-square transition-transform rotate-0" + (isPart1Open && " rotate-90")}
                            >{">"}</button>
                        </div>
                        <div
                            className={"transition-all flex flex-col gap-6 py-4" + (isPart1Open ? "" : " -my-8 p-0! h-0 overflow-hidden opacity-0")}>
                            {part1.map((criterion) => (
                                <div key={criterion.id}>
                                    {renderCriterion(criterion)}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Part 2 Section */}
                {part2.length > 0 && (
                    <section>
                        <div onClick={() => setIsPart2Open(!isPart2Open)}
                             className={"top-22 flex justify-between cursor-pointer  items-center z-10 bg-background py-3 border-b" + (isPart2Open ? " sticky" : " mb-20")}>
                            <div>
                                <h2 className="text-lg font-semibold">Teil 2</h2>
                                <p className="text-sm text-muted-foreground">{part2.length} criteria</p>
                            </div>
                            <button
                                className={"w-8 h-8 pb-1 aspect-square transition-transform rotate-0" + (isPart2Open && " rotate-90")}
                            >{">"}</button>
                        </div>
                        <div
                            className={"transition-all flex flex-col gap-6 py-4" + (isPart2Open ? "" : " -my-8 p-0! h-0 overflow-hidden opacity-0")}>
                            {part2.map((criterion) => (
                                <div key={criterion.id}>
                                    {renderCriterion(criterion)}
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>

        </div>
    );
}
