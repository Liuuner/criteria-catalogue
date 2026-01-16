import type { Criterion } from "../../types.ts";
import { useMemo, useState, useCallback } from "react";
import FlexSearch from "flexsearch";

interface UseFlexSearchResult {
    search: (query: string) => Criterion[];
    index: (criteria: Criterion[]) => void;
}

const useFlexSearch = (): UseFlexSearchResult => {
    const [criteriaMap, setCriteriaMap] = useState<Map<string, Criterion>>(new Map());

    const flexIndex = useMemo(() => {
        return new FlexSearch.Index({
            tokenize: "forward",
            resolution: 9,
        });
    }, []);

    const index = useCallback((criteria: Criterion[]) => {
        const newMap = new Map<string, Criterion>();

        criteria.forEach((criterion) => {
            // Combine all text fields into a searchable string
            const searchableText = [
                criterion.title,
                criterion.question,
                criterion.notes,
                ...criterion.requirements,
                // criterion.qualityLevels["0"].description,
                // criterion.qualityLevels["1"].description,
                // criterion.qualityLevels["2"].description,
                // criterion.qualityLevels["3"].description,
            ].join(" ");

            flexIndex.add(criterion.id, searchableText);
            newMap.set(criterion.id, criterion);
        });

        setCriteriaMap(newMap);
    }, [flexIndex]);

    const search = useCallback((query: string): Criterion[] => {
        if (!query.trim()) {
            return Array.from(criteriaMap.values());
        }

        const results = flexIndex.search(query);
        return results
            .map((id) => criteriaMap.get(id as string))
            .filter((criterion): criterion is Criterion => criterion !== undefined);
    }, [flexIndex, criteriaMap]);

    return { search, index };
};

export default useFlexSearch;
