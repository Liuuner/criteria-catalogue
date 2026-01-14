export interface IPA extends PersonData {
    criteria: Criterion[];
}

export interface PersonData {
    id: string | null;
    firstname: string;
    lastname: string;
    topic: string;
    date: string;
}

export interface Criterion {
    id: string;
    title: string;
    question: string;
    requirements: string[];
    checked: number[]
    qualityLevels: {
        "0": QualityLevel;
        "1": QualityLevel;
        "2": QualityLevel;
        "3": QualityLevel;
    };
    notes: string;
}

interface QualityLevel {
    description: string;
    minRequirements: number;
    requiredIndexes: number[];
}

export interface GradesPayload {
    part1: GradeDetails;
    part2: GradeDetails;
}

export interface GradeDetails {
    grade: number;
    averageQualityLevel: number
    criterionGrades: CriterionGrade[];
}

export interface CriterionGrade {
    criterionId: string;
    criterionTitle: string;
    qualityLevel: number;
}
