export interface PersonData {
    name: string;
    vorname: string;
    thema: string;
    datum: string;
}

export interface Criterion {
    id: string;
    titel: string;
    leitfrage: string;
    anforderungen: string[];
    guterstufen: {
        "0": Guterstufe;
        "1": Guterstufe;
        "2": Guterstufe;
        "3": Guterstufe;
    };
}

interface Guterstufe {
    beschreibung: string;
    requiredItems: [];
    requiredTotal: number;
}

export interface CriterionProgress {
    checkedRequirements: number[];
    notes: string;
}

export interface GradeResult {
    id: string;
    titel: string;
    gutestufe: number;
    checkedCount: number;
    totalRequirements: number;
}

export interface GradesPayload {
    criteria: GradeResult[];
    teil1: { note: string; kriterien: GradeResult[] };
    teil2: { note: string; kriterien: GradeResult[] };
}
