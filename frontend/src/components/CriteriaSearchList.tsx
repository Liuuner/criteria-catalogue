import { useEffect, useState } from "react";
import type { Criterion } from "../types.ts";
import { Input } from "./ui/input.tsx";
import * as React from "react";
import useFlexSearch from "../utils/hooks/useFlexSearch.tsx";
import {Search, X} from "lucide-react";

interface CriteriaSearchListProps {
    criteria: Criterion[];
    renderCriterion: (criterion: Criterion) => React.ReactNode;
    placeholder?: string;
}

export default function CriteriaSearchList({
                                       criteria,
                                       renderCriterion,
                                       placeholder = "Search criteria...",
                                   }: Readonly<CriteriaSearchListProps>) {
    const [query, setQuery] = useState("");
    const { search, index } = useFlexSearch();

    useEffect(() => {
        index(criteria);
    }, [criteria, index]);

    const filteredCriteria = search(query);

    return (
        <div className="flex flex-col gap-4">
            <div className="sticky top-0 z-10 bg-background pb-2 pt-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={placeholder}
                        className="w-full pl-10 pr-10 h-12 text-base border-2 border-muted focus:border-primary shadow-sm rounded-lg"
                    />
                    {query && (
                        <button
                            onClick={() => setQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    )}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                    {filteredCriteria.length} of {criteria.length} criteria
                </p>
            </div>
            <div className="flex flex-col gap-6">
                {filteredCriteria.map((criterion) => (
                    <div key={criterion.id}>
                        {renderCriterion(criterion)}
                    </div>
                ))}
            </div>
        </div>
    );
}
