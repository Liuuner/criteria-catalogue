import {CriterionCard} from './CriterionCard';
import type {Criterion, CriterionProgress} from "../types.ts";

interface CriteriaListProps {
    criteria: Criterion[];
    progress: Record<string, CriterionProgress>;
    onSaveProgress: (criterionId: string, progress: CriterionProgress) => void;
}

export function CriteriaList({criteria, progress, onSaveProgress}: Readonly<CriteriaListProps>) {
    if (criteria.length === 0) {
        return (
            <div className="text-center py-12 text-slate-500">
                <p>Keine Kriterien gefunden.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {criteria.map((criterion) => (
                <CriterionCard
                    key={criterion.id}
                    criterion={criterion}
                    progress={progress[criterion.id] || {checkedRequirements: [], notes: ''}}
                    onSave={(progressData) => onSaveProgress(criterion.id, progressData)}
                />
            ))}
        </div>
    );
}
