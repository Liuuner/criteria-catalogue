import {cn} from "./ui/utils";

interface CriterionCardProps {
    criterionId: string;
    qualityLevel: number;
}

function getQualityLevelColor(level: number) {
    if (level === 3) return 'bg-linear-to-br from-green-50 to-green-100 text-green-800 border-green-200';
    if (level === 2) return 'bg-linear-to-br from-yellow-50 to-yellow-100 text-yellow-800 border-yellow-200';
    if (level === 1) return 'bg-linear-to-br from-orange-50 to-orange-100 text-orange-800 border-orange-200';
    return 'bg-linear-to-br from-red-50 to-red-100 text-red-800 border-red-200';
}

export function CompactCriterionCard({criterionId, qualityLevel}: Readonly<CriterionCardProps>) {
    return (
        <div
            className={cn(
                "text-center p-3 rounded-lg border",
                getQualityLevelColor(qualityLevel)
            )}
        >
            <div className="font-mono text-sm mb-1">{criterionId}</div>
            <div className="font-medium">{qualityLevel}</div>
        </div>
    );
}
