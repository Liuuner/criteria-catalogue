import {CriterionCard} from "./CriterionCard";
import type {Criterion} from "../types.ts";
import Dialog from "./Dialog.tsx";
import {type FormEvent, useEffect, useState} from "react";
import {Label} from "./ui/label.tsx";
import {Input} from "./ui/input.tsx";
import {Checkbox} from "./ui/checkbox.tsx";
import {Button} from "./ui/button.tsx";
import CriteriaSearchList from "./CriteriaSearchList.tsx";

interface CriteriaListProps {
    criteria: Criterion[];
    onSaveCriterion: (criterion: Criterion) => void;
    onUpdateCriterion: (criterion: Criterion) => void;
    onDeleteCriterion: (id: string) => void;
    defaultCriteria: Criterion[];
}

const emptyCriterion: Criterion = {
    id: "",
    title: "",
    question: "",
    requirements: [""],
    checked: [],
    notes: "",
    qualityLevels: {
        "0": {description: "", minRequirements: 0, requiredIndexes: []},
        "1": {description: "", minRequirements: 0, requiredIndexes: []},
        "2": {description: "", minRequirements: 0, requiredIndexes: []},
        "3": {description: "", minRequirements: 0, requiredIndexes: []},
    },
};

const LEVELS = ["0", "1", "2"] as const;

function toggleIndex(list: number[], idx: number, on: boolean) {
    if (on) return list.includes(idx) ? list : [...list, idx].sort((a, b) => a - b);
    return list.filter((x) => x !== idx);
}

export function CriteriaList({
                                 criteria,
                                 onSaveCriterion,
                                 onUpdateCriterion,
                                 onDeleteCriterion,
                                 defaultCriteria,
                             }: Readonly<CriteriaListProps>) {
    const [createCriterion, setCreateCriterion] = useState<Criterion>(emptyCriterion);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [presetId, setPresetId] = useState("");

    useEffect(() => {
        if (!isCreateDialogOpen) return;

        // Wenn Dialog geöffnet wird: frisch starten
        setCreateCriterion(emptyCriterion);
    }, [isCreateDialogOpen]);

    function applyPreset(id: string) {

        if (!id) {
            setCreateCriterion(emptyCriterion);
            setPresetId("");
            return;
        }

        const preset = defaultCriteria.find(criterion => criterion.id === id);
        if (!preset) return;
        setPresetId(preset.id);
        setCreateCriterion(preset);
        setTimeout(() => {
            console.log(preset)
            console.log(createCriterion)
        }, 1000)
    }

    function setRequirementAt(index: number, value: string) {
        setCreateCriterion((prev) => {
            const req = [...prev.requirements];
            req[index] = value;

            // Falls Requirements gelöscht/geleert werden, ensure requiredIndexes passen weiterhin:
            const newQualityLevels = {...prev.qualityLevels};
            LEVELS.forEach((lvl) => {
                const ql = newQualityLevels[lvl];
                const filtered = ql.requiredIndexes.filter((i) => i >= 0 && i < req.length);
                newQualityLevels[lvl] = {...ql, requiredIndexes: filtered};
            });

            return {...prev, requirements: req, qualityLevels: newQualityLevels};
        });
    }

    function addRequirement() {
        setCreateCriterion((prev) => ({
            ...prev,
            requirements: [...prev.requirements, ""],
        }));
    }

    function removeRequirement(index: number) {
        setCreateCriterion((prev) => {
            if (prev.requirements.length <= 1) return prev;

            const req = prev.requirements.filter((_, i) => i !== index);

            const newQualityLevels = {...prev.qualityLevels};
            LEVELS.forEach((lvl) => {
                const ql = newQualityLevels[lvl];
                // Indizes nach Entfernen shiften
                const shifted = ql.requiredIndexes
                    .filter((i) => i !== index)
                    .map((i) => (i > index ? i - 1 : i))
                    .filter((i) => i >= 0 && i < req.length);

                newQualityLevels[lvl] = {...ql, requiredIndexes: shifted};
            });

            return {...prev, requirements: req, qualityLevels: newQualityLevels};
        });
    }

    function handleSave(e: FormEvent) {
        e.preventDefault();

        const trimmed = {
            ...createCriterion,
            id: createCriterion.id.trim(),
            title: createCriterion.title.trim(),
            question: createCriterion.question.trim(),
            requirements: createCriterion.requirements.map((r) => r.trim()).filter((r, i, arr) => !(r === "" && i === arr.length - 1)),
        };

        // Minimale Validierung (optional erweitern)
        if (!trimmed.id || !trimmed.title || !trimmed.question) return;
        if (trimmed.requirements.every((r) => r === "")) return;

        onSaveCriterion(trimmed);
        setIsCreateDialogOpen(false);
        setPresetId("");
    }

    return (
        <div className="space-y-6">
            {criteria.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                    <p>Keine Kriterien gefunden.</p>
                </div>
            )}

            <CriteriaSearchList criteria={criteria} renderCriterion={(c) => (
                <CriterionCard
                    key={c.id}
                    criterion={c}
                    onSave={onUpdateCriterion}
                    onDelete={onDeleteCriterion}
                />
            )}/>

            <Dialog
                open={isCreateDialogOpen}
                onClose={() => setIsCreateDialogOpen(false)}
                title="Kriterium erstellen"
            >
                <form onSubmit={handleSave} className="space-y-6 w-full">
                    {/* Presets */}
                    <div className="space-y-2">
                        <Label htmlFor="preset">Preset (optional)</Label>
                        <select
                            id="preset"
                            className="w-full rounded-md border border-slate-200 bg-[#F3F3F5] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                            value={presetId}
                            onChange={(e) => applyPreset(e.target.value)}
                        >
                            <option value="">— Kein Preset —</option>
                            {defaultCriteria.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.id} — {c.title}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-slate-500">
                            Wähle ein Preset, um von den Standard Kriterien zu wählen.
                        </p>
                    </div>

                    <div className="w-full space-y-2">
                        <Label htmlFor="id">ID *</Label>
                        <Input
                            className="bg-[#F3F3F5]!"
                            id="id"
                            type="text"
                            value={createCriterion.id}
                            onChange={(e) => setCreateCriterion((p) => ({...p, id: e.target.value}))}
                            required
                            placeholder="AB12"
                        />
                    </div>

                    <div className="w-full space-y-2">
                        <Label htmlFor="title">Titel *</Label>
                        <Input
                            className="bg-[#F3F3F5]!"
                            id="title"
                            type="text"
                            value={createCriterion.title}
                            onChange={(e) => setCreateCriterion((p) => ({...p, title: e.target.value}))}
                            required
                            placeholder="IPA über..."
                        />
                    </div>

                    {/* Frage */}
                    <div className="space-y-2">
                        <Label htmlFor="question">Frage *</Label>
                        <Input
                            className="bg-[#F3F3F5]!"
                            id="question"
                            type="text"
                            value={createCriterion.question}
                            onChange={(e) => setCreateCriterion((p) => ({...p, question: e.target.value}))}
                            required
                            placeholder="Wie erfolgt ...?"
                        />
                    </div>

                    {/* Requirements */}
                    <div className="space-y-2 pt-2">
                        <div className="flex items-end justify-between gap-3">
                            <div>
                                <Label>Kriterien *</Label>
                                <p className="text-xs text-slate-500">Jede Zeile ist eine Anforderung (Requirement).</p>
                            </div>
                            <Button type="button" variant="secondary" onClick={addRequirement}>
                                + Hinzufügen
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {createCriterion.requirements.map((req, index) => (
                                <div key={`req-${index}`} className="flex gap-3 items-center">
                                    <Input
                                        className="bg-[#F3F3F5]!"
                                        type="text"
                                        value={req}
                                        onChange={(e) => setRequirementAt(index, e.target.value)}
                                        required={index === 0}
                                        placeholder={`Kriterium ${index + 1}`}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => removeRequirement(index)}
                                        disabled={createCriterion.requirements.length <= 1}
                                        className="shrink-0"
                                        title="Entfernen"
                                    >
                                        –
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Qualitätsstufen */}
                    <div className="space-y-6 pt-2">
                        {LEVELS.map((level) => {
                            console.log(createCriterion)
                            const ql = createCriterion.qualityLevels[level];
                            return (
                                <div key={level} className="rounded-lg border border-slate-200 p-4 space-y-4 bg-white">
                                    <div className="space-y-2">
                                        <Label htmlFor={`desc-${level}`}>Gütestufe {level} – Beschreibung *</Label>
                                        <Input
                                            className="bg-[#F3F3F5]!"
                                            id={`desc-${level}`}
                                            type="text"
                                            value={ql.description}
                                            onChange={(e) =>
                                                setCreateCriterion((p) => ({
                                                    ...p,
                                                    qualityLevels: {
                                                        ...p.qualityLevels,
                                                        [level]: {
                                                            ...p.qualityLevels[level],
                                                            description: e.target.value
                                                        },
                                                    },
                                                }))
                                            }
                                            required
                                            placeholder="Beschreibung"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor={`min-${level}`}>Mindestanforderungen {level} *</Label>
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
                                            <Input
                                                className="bg-[#F3F3F5]! w-32"
                                                id={`min-${level}`}
                                                type="number"
                                                min={0}
                                                max={createCriterion.requirements.length}
                                                value={Number.isFinite(ql.minRequirements) ? ql.minRequirements : 0}
                                                onChange={(e) =>
                                                    setCreateCriterion((p) => ({
                                                        ...p,
                                                        qualityLevels: {
                                                            ...p.qualityLevels,
                                                            [level]: {
                                                                ...p.qualityLevels[level],
                                                                minRequirements: e.target.value === "" ? 0 : e.target.valueAsNumber,
                                                            },
                                                        },
                                                    }))
                                                }
                                            />

                                            <div className="flex flex-wrap gap-4">
                                                {createCriterion.requirements.map((_, idx) => {
                                                    const checked = ql.requiredIndexes.includes(idx);
                                                    return (
                                                        <label key={`${level}-req-${idx}`}
                                                               className="flex items-center gap-2 text-sm">
                                                            <Checkbox
                                                                id={`${level}-req-${idx}`}
                                                                checked={checked}
                                                                onCheckedChange={(val) => {
                                                                    const on = val === true;
                                                                    setCreateCriterion((p) => ({
                                                                        ...p,
                                                                        qualityLevels: {
                                                                            ...p.qualityLevels,
                                                                            [level]: {
                                                                                ...p.qualityLevels[level],
                                                                                requiredIndexes: toggleIndex(p.qualityLevels[level].requiredIndexes, idx, on),
                                                                            },
                                                                        },
                                                                    }));
                                                                }}
                                                            />
                                                            <span>Req {idx + 1}</span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-500">
                                            Checkboxen markieren “muss erfüllt sein” für diese Gütestufe.
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Button type="button" variant="secondary" onClick={() => setIsCreateDialogOpen(false)}>
                            Abbrechen
                        </Button>
                        <Button type="submit">Speichern</Button>
                    </div>
                </form>
            </Dialog>

            <Button type="button" onClick={() => setIsCreateDialogOpen(true)} variant="secondary">
                + Neues Kriterium
            </Button>
        </div>
    );
}
