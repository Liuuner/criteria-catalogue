import type {Criterion, GradesPayload, IPA, PersonData} from "../../types.ts";

const API_BASE = import.meta.env.VITE_API_URL;

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T | null> {
    const res = await fetch(input, {
        ...init,
        headers: {
            ...init?.headers,
        },
    });

    const text = await res.text();
    if (text) {
        return JSON.parse(text) as T;
    }
    return null;
}

export async function getIpa(id: string): Promise<IPA | null> {
    const json = await fetchJson<IPA>(`${API_BASE}/api/ipa/${id}`);
    return json ?? null;
}

export async function createIpa(personData: PersonData): Promise<IPA | null> {
    const json = await fetchJson<IPA>(`${API_BASE}/api/ipa`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(personData),
    });
    return json ?? null;
}

export async function getCriteria(id: string): Promise<Criterion[]> {
    const json = await fetchJson<Criterion[]>(`${API_BASE}/api/ipa/${id}/criteria`);
    return json ?? [];
}

export async function createCriterion(id: string, criterion: Criterion): Promise<Criterion | null> {
    return await fetchJson<Criterion>(`${API_BASE}/api/ipa/${id}/criteria`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(criterion),
    });
}

export async function updateCriterion(IpaId: string, criterionId: string, data: Partial<IPA>): Promise<Criterion | null> {
    return await fetchJson<Criterion>(`${API_BASE}/api/ipa/${IpaId}/criteria/${criterionId}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data),
    });
}

export async function deleteCriterion(IpaId: string, criterionId: string): Promise<void> {
    await fetchJson<unknown>(`${API_BASE}/api/ipa/${IpaId}/criteria/${criterionId}`, {
        method: "DELETE",
    });
}

export async function getGrades(id: string): Promise<GradesPayload | null> {
    const json = await fetchJson<GradesPayload>(`${API_BASE}/api/ipa/${id}/grade`);
    return json ?? null;
}

export async function getAllCriteria(): Promise<Criterion[]> {
    const json = await fetchJson<Criterion[]>(`${API_BASE}/api/criteria`);
    return json ?? [];
}
