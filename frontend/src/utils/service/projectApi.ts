import {projectId, publicAnonKey} from "../supabase/info.tsx";
import type {Criterion, CriterionProgress, GradesPayload, PersonData} from "../../types.ts";

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-e2bf8d92`;

type ApiOk<T> = { data?: T; success?: true };
type ApiError = { error?: string; success?: false };

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
    const res = await fetch(input, {
        ...init,
        headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            ...(init?.headers ?? {}),
        },
    });

    // falls Supabase Function mal kein JSON liefert:
    const text = await res.text();
    try {
        return JSON.parse(text) as T;
    } catch {
        throw new Error(`Ungültige API-Antwort (${res.status}): ${text}`);
    }
}

export async function getPerson(): Promise<PersonData | null> {
    const json = await fetchJson<ApiOk<PersonData> & ApiError>(`${API_BASE}/person`);
    return json.data ?? null;
}

export async function savePerson(data: PersonData): Promise<{ success: boolean; error?: string }> {
    const json = await fetchJson<ApiOk<unknown> & ApiError>(`${API_BASE}/person`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return { success: !!json.success, error: json.error };
}

export async function getCriteria(): Promise<Criterion[]> {
    const json = await fetchJson<ApiOk<Criterion[]> & ApiError>(`${API_BASE}/criteria`);
    return json.data ?? [];
}

export async function getProgress(criterionId: string): Promise<CriterionProgress | null> {
    const json = await fetchJson<ApiOk<CriterionProgress> & ApiError>(
        `${API_BASE}/progress/${criterionId}`
    );
    return json.data ?? null;
}

export async function saveProgress(
    criterionId: string,
    progress: CriterionProgress
): Promise<{ success: boolean; error?: string }> {
    const json = await fetchJson<ApiOk<unknown> & ApiError>(`${API_BASE}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ criterionId, ...progress }),
    });
    return { success: !!json.success, error: json.error };
}

export async function getGrades(): Promise<GradesPayload | null> {
    // dein Endpoint liefert offenbar direkt {criteria, teil1, teil2}
    const json = await fetchJson<Partial<GradesPayload> & ApiError>(`${API_BASE}/grades`);
    if (json && Array.isArray((json as any).criteria)) return json as GradesPayload;
    return null;
}
