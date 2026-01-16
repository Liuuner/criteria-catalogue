import {useState, useEffect, type ChangeEvent} from 'react';
import {Card} from './ui/card';
import {Checkbox} from './ui/checkbox';
import {Textarea} from './ui/textarea';
import {Button} from './ui/button';
import {Label} from './ui/label';
import {Badge} from './ui/badge';
import Dialog from './Dialog';
import type {Criterion} from "../types.ts";

interface CriterionCardProps {
    criterion: Criterion;
    onSave: (progress: Criterion) => void;
    onDelete: (id: string) => void;
}

export function CriterionCard({criterion, onSave, onDelete}: Readonly<CriterionCardProps>) {
    const [checkedRequirements, setCheckedRequirements] = useState<number[]>(criterion.checked);
    const [notes, setNotes] = useState<string>(criterion.notes);
    const [hasChanges, setHasChanges] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    useEffect(() => {
        setCheckedRequirements(criterion.checked);
        setNotes(criterion.notes);
        setHasChanges(false);
    }, [criterion]);

    const handleCheckChange = (index: number, checked: boolean) => {
        const newChecked = checked
            ? [...checkedRequirements, index]
            : checkedRequirements.filter(i => i !== index);
        setCheckedRequirements(newChecked);
        setHasChanges(true);
    };

    const handleNotesChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setNotes(e.target.value);
        setHasChanges(true);
    };

    const handleSave = () => {
        onSave({...criterion, checked: checkedRequirements, notes});
        setHasChanges(false);
    };

    const handleDelete = () => {
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        onDelete(criterion.id);
        setIsDeleteDialogOpen(false);
    };

    const calculateQualityLevel = () => {
        const total = criterion.requirements.length;
        const checked = checkedRequirements.length;

        if (checked === 0) {
            return 0;
        } else if (checked === total) {
            return 3;
        } else if (criterion
                .qualityLevels["2"]
                .requiredIndexes
                .every(index => checkedRequirements.includes(index))
            && criterion
                .qualityLevels["2"]
                .minRequirements <= checked
        ) {
            return 2;
        } else if (criterion
                .qualityLevels["1"]
                .requiredIndexes
                .every(index => checkedRequirements.includes(index))
            && criterion
                .qualityLevels["1"]
                .minRequirements <= checked
        ) {
            return 1;
        } else {
            return 0;
        }
    };

    const currentQualityLevel = calculateQualityLevel();
    const qualityLevelColors = {
        0: 'bg-red-100 text-red-800 border-red-200',
        1: 'bg-orange-100 text-orange-800 border-orange-200',
        2: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        3: 'bg-green-100 text-green-800 border-green-200'
    };

    return (
        <Card className="p-6 border-l-4 border-l-blue-500">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="font-mono">{criterion.id}</Badge>
                        <h3>{criterion.title}</h3>
                    </div>
                    <p className="text-slate-600 italic">{criterion.question}</p>
                </div>
                <Badge className={qualityLevelColors[currentQualityLevel]}>
                    Gütestufe {currentQualityLevel}
                </Badge>
            </div>

            <div className="mb-4">
                <Label className="mb-3 block">Anforderungen
                    ({checkedRequirements.length} von {criterion.requirements.length} erfüllt)</Label>
                <div className="space-y-3">
                    {criterion.requirements.map((requirement, index) => (
                        <div key={requirement}
                             className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                            <Checkbox
                                id={`${criterion.id}-req-${index}`}
                                checked={checkedRequirements.includes(index)}
                                onCheckedChange={(checked) => handleCheckChange(index, checked as boolean)}
                            />
                            <label
                                htmlFor={`${criterion.id}-req-${index}`}
                                className="flex-1 cursor-pointer text-slate-700"
                            >
                                {requirement}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mb-4">
                <Label htmlFor={`${criterion.id}-notes`} className="mb-2 block">
                    Notizen (Was fehlt noch?)
                </Label>
                <Textarea
                    id={`${criterion.id}-notes`}
                    value={notes}
                    onChange={handleNotesChange}
                    placeholder="Fügen Sie hier Ihre Notizen hinzu..."
                    rows={3}
                    className="resize-none bg-[#F3F3F5]!"
                />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <div className="text-slate-600">
                    <p className="mb-1">Gütestufen:</p>
                    <div className="space-y-1">
                        <p className={`${3 === currentQualityLevel ? 'font-semibold text-slate-900' : ''}`}>
                            3: alle Punkte erfüllt
                        </p>
                        {Object.entries(criterion.qualityLevels).sort((a, b) => Number(b[0]) - Number(a[0])).map(([level, qualityLevel]) => (
                            <p key={level}
                               className={`${level === String(currentQualityLevel) ? 'font-semibold text-slate-900' : ''}`}>
                                {level}: {qualityLevel.description}
                            </p>
                        ))}
                    </div>
                </div>
               <div className="flex gap-3">
                   <Button
                       onClick={handleDelete}
                       variant={"destructive"}
                   >
                       Löschen
                   </Button>

                   <Button
                       onClick={handleSave}
                       disabled={!hasChanges}
                       variant={"default"}
                   >
                       Speichern
                   </Button>
               </div>
            </div>

            <Dialog
                open={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                title="Kriterium löschen"
                description={`Möchten Sie das Kriterium "${criterion.id} – ${criterion.title}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`}
                size="small"
            >
                <div className="flex items-center justify-end gap-3 pt-4">
                    <Button type="button" variant="secondary" onClick={() => setIsDeleteDialogOpen(false)}>
                        Abbrechen
                    </Button>
                    <Button type="button" variant="destructive" onClick={confirmDelete}>
                        Löschen
                    </Button>
                </div>
            </Dialog>
        </Card>
    );
}
