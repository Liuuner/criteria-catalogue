import {useState} from 'react';
import {Card} from './ui/card';
import {Badge} from './ui/badge';
import {ChevronDown, ChevronUp} from 'lucide-react';
import type {Criterion} from "../types.ts";

interface ReadOnlyCriterionCardProps {
    criterion: Criterion;
    defaultExpanded?: boolean;
    className?: string;
}

export function ReadOnlyCriterionCard({criterion, defaultExpanded = false, className = ''}: Readonly<ReadOnlyCriterionCardProps>) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    const checkedRequirements = criterion.checked;
    const notes = criterion.notes;

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
    /*const qualityLevelColors = {
        0: 'bg-red-100 text-red-800 border-red-200',
        1: 'bg-orange-100 text-orange-800 border-orange-200',
        2: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        3: 'bg-green-100 text-green-800 border-green-200'
    };*/

    return (
        <Card className={`p-6 ${className}`}>
            <div
                className="flex items-start justify-between cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="font-mono">{criterion.id}</Badge>
                        <h3>{criterion.title}</h3>
                    </div>
                    <p className="text-slate-600 italic">{criterion.question}</p>
                </div>
                <div className="flex items-center gap-3">
                    {/*<Badge className={qualityLevelColors[currentQualityLevel]}>
                        Gütestufe {currentQualityLevel}
                    </Badge>*/}
                    {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-slate-500" />
                    ) : (
                        <ChevronDown className="h-5 w-5 text-slate-500" />
                    )}
                </div>
            </div>

            {isExpanded && (
                <>
                    <div className="mt-4 mb-4">
                        <p className="mb-3 text-sm font-medium">
                            Anforderungen ({checkedRequirements.length} von {criterion.requirements.length} erfüllt)
                        </p>
                        <div className="space-y-3">
                            {criterion.requirements.map((requirement, index) => (
                                <div
                                    key={requirement}
                                    className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                                        checkedRequirements.includes(index) 
                                            ? 'bg-green-50 border border-green-200' 
                                            : 'bg-slate-50'
                                    }`}
                                >
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                                        checkedRequirements.includes(index)
                                            ? 'bg-green-500 border-green-500 text-white'
                                            : 'border-slate-300 bg-white'
                                    }`}>
                                        {checkedRequirements.includes(index) && (
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                    <span className="flex-1 text-slate-700">
                                        {requirement}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {notes && (
                        <div className="mb-4">
                            <p className="mb-2 text-sm font-medium">
                                Notizen
                            </p>
                            <div className="p-3 rounded-lg bg-slate-50 text-slate-700 whitespace-pre-wrap">
                                {notes}
                            </div>
                        </div>
                    )}

                    <div className="pt-4 border-t border-slate-200">
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
                    </div>
                </>
            )}
        </Card>
    );
}

