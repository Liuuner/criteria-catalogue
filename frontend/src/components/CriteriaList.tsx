import {CriterionCard} from './CriterionCard';
import type {Criterion} from "../types.ts";
import Dialog from "./Dialog.tsx";
import {useState} from "react";

interface CriteriaListProps {
    criteria: Criterion[];
    onSaveCriterion: (criterion: Criterion) => void;
    onDeleteCriterion: (id: string) => void;
    defaultCriteria: Criterion[];
}

export function CriteriaList({criteria, onSaveCriterion, onDeleteCriterion}: Readonly<CriteriaListProps>) {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    return (
        <div className="space-y-6">
            {criteria.length === 0 &&
                <div className="text-center py-12 text-slate-500">
                    <p>Keine Kriterien gefunden.</p>
                </div>
            }

            {criteria.map((criterion) => (
                <CriterionCard
                    key={criterion.id}
                    criterion={criterion}
                    onSave={onSaveCriterion}
                    onDelete={onDeleteCriterion}
                />
            ))}

            <Dialog open={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} title={"Create Criterion"}>
                <form action="">

                </form>
            </Dialog>

            <button onClick={() => setIsCreateDialogOpen(true)}>+</button>
        </div>
    );
}
