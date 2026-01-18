// projectApi.test.ts
import {beforeEach, describe, expect, it, vi} from "vitest";

// 1) Mock sonner with NO top-level captured vars (factory is hoisted)
vi.mock("sonner", () => {
    const toast = {
        error: vi.fn(),
    };
    return {toast};
});

// 3) Import module under test
import {
    getIpa,
    createIpa,
    getCriteria,
    createCriterion,
    updateCriterion,
    deleteCriterion,
    getGrades,
    getAllCriteria,
    getVersions,
} from "./projectApi"; // <-- adjust

// 4) Import the mocked module to access the spy
import {toast} from "sonner";

type MockFetchResponse = {
    status?: number;
    text?: () => Promise<string>;
};

function mockFetchOnce(r: MockFetchResponse) {
    (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: r.status ?? 200,
        text: r.text ?? (async () => ""),
    });
}

describe("projectApi", () => {
    beforeEach(() => {
        globalThis.fetch = vi.fn();
        vi.mocked(toast.error).mockClear();
    });

    it("getIpa: returns IPA when id !== AA00", async () => {
        mockFetchOnce({
            status: 200,
            text: async () => JSON.stringify({id: "BB01", name: "x"}),
        });

        const res = await getIpa("BB01");

        expect(globalThis.fetch).toHaveBeenCalledWith(
            "undefined/api/ipa/BB01",
            {headers: {}}
        );
        expect(res).toEqual({id: "BB01", name: "x"});
        expect(toast.error).not.toHaveBeenCalled();
    });

    it('getIpa: returns null when API returns id "AA00"', async () => {
        mockFetchOnce({
            status: 200,
            text: async () => JSON.stringify({id: "AA00"}),
        });

        await expect(getIpa("whatever")).resolves.toBeNull();
    });

    it("fetchJson: returns null on 204", async () => {
        mockFetchOnce({status: 204, text: async () => ""});

        await expect(getGrades("X")).resolves.toBeNull();
        expect(toast.error).not.toHaveBeenCalled();
    });

    it("fetchJson: calls toast.error and returns null when payload has error", async () => {
        mockFetchOnce({
            status: 400,
            text: async () => JSON.stringify({error: "Boom"}),
        });

        await expect(getGrades("X")).resolves.toBeNull();
        expect(toast.error).toHaveBeenCalledWith("Boom");
    });

    it("createIpa: POSTs JSON and returns created IPA", async () => {
        const person = {firstName: "Ada"} as any;

        mockFetchOnce({
            status: 200,
            text: async () => JSON.stringify({id: "BB02"}),
        });

        const res = await createIpa(person);

        expect(globalThis.fetch).toHaveBeenCalledWith(
            "undefined/api/ipa",
            {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(person),
            }
        );
        expect(res).toEqual({id: "BB02"});
    });

    it("getCriteria: returns [] when null (204)", async () => {
        mockFetchOnce({status: 204, text: async () => ""});

        await expect(getCriteria("BB01")).resolves.toEqual([]);
    });

    it("createCriterion: POSTs and returns criterion", async () => {
        const criterion = {id: "c1", label: "Quality"} as any;

        mockFetchOnce({
            status: 200,
            text: async () => JSON.stringify(criterion),
        });

        const res = await createCriterion("BB01", criterion);

        expect(globalThis.fetch).toHaveBeenCalledWith(
            "undefined/api/ipa/BB01/criteria",
            {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(criterion),
            }
        );
        expect(res).toEqual(criterion);
    });

    it("updateCriterion: PUTs and returns updated criterion", async () => {
        const data = {id: "c1", label: "Updated"} as any;

        mockFetchOnce({
            status: 200,
            text: async () => JSON.stringify(data),
        });

        const res = await updateCriterion("BB01", "c1", data);

        expect(globalThis.fetch).toHaveBeenCalledWith(
            "undefined/api/ipa/BB01/criteria/c1",
            {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(data),
            }
        );
        expect(res).toEqual(data);
    });

    it("deleteCriterion: sends DELETE", async () => {
        mockFetchOnce({status: 204, text: async () => ""});

        await deleteCriterion("BB01", "c1");

        expect(globalThis.fetch).toHaveBeenCalledWith(
            "undefined/api/ipa/BB01/criteria/c1",
            {
                "headers": {},
                method: "DELETE"
            }
        );
    });

    it("getAllCriteria: returns [] on null (204) and list on success", async () => {
        mockFetchOnce({status: 204, text: async () => ""});
        await expect(getAllCriteria()).resolves.toEqual([]);

        mockFetchOnce({
            status: 200,
            text: async () => JSON.stringify([{id: "c1"}]),
        });
        await expect(getAllCriteria()).resolves.toEqual([{id: "c1"}]);
    });

    it("getVersions: returns plain text", async () => {
        (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
            text: async () => "1.2.3",
        });

        await expect(getVersions()).resolves.toBe("1.2.3");
        expect(globalThis.fetch).toHaveBeenCalledWith("undefined/version");
    });
});
