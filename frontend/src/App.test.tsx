// App.test.tsx
import {beforeEach, describe, expect, it, vi} from "vitest";
import {fireEvent, render, screen, waitFor} from "@testing-library/react";
// --------------------
// Import App under test
// --------------------
import App from "./App";
import {toast} from "sonner";

// --------------------
// Mocks (hoisted safe)
// --------------------

// sonner toast mock (no top-level captured vars inside factory)
vi.mock("sonner", () => {
    return {
        toast: {
            error: vi.fn(),
            success: vi.fn(),
        },
    };
});

// projectApi mock (use vi.hoisted so functions are stable & accessible)
const api = vi.hoisted(() => ({
    createCriterion: vi.fn(),
    createIpa: vi.fn(),
    deleteCriterion: vi.fn(),
    getAllCriteria: vi.fn(),
    getCriteria: vi.fn(),
    getIpa: vi.fn(),
    getVersions: vi.fn(),
    updateCriterion: vi.fn(),
}));

vi.mock("./utils/service/projectApi.ts", () => ({
    createCriterion: api.createCriterion,
    createIpa: api.createIpa,
    deleteCriterion: api.deleteCriterion,
    getAllCriteria: api.getAllCriteria,
    getCriteria: api.getCriteria,
    getIpa: api.getIpa,
    getVersions: api.getVersions,
    updateCriterion: api.updateCriterion,
}));

// Storage hooks mock: stateful implementation so App re-renders when setIpaId / setRoute is called
vi.mock("./utils/hooks/useStorage.tsx", async () => {
    const React = await import("react");

    function useLocalStorage<T>(key: string, initialValue: T) {
        const [value, setValue] = React.useState<T>(() => {
            const stored = localStorage.getItem(key);
            return (stored !== null ? (stored as unknown as T) : initialValue) as T;
        });

        const set = (next: T) => {
            setValue(next);
            localStorage.setItem(key, String(next));
        };

        const clear = () => {
            localStorage.removeItem(key);
            setValue(initialValue);
        };

        return [value, set, clear] as const;
    }

    function useSessionStorage<T>(key: string, initialValue: T) {
        const [value, setValue] = React.useState<T>(() => {
            const stored = sessionStorage.getItem(key);
            return (stored !== null ? (stored as unknown as T) : initialValue) as T;
        });

        const set = (next: T) => {
            setValue(next);
            sessionStorage.setItem(key, String(next));
        };

        return [value, set] as const;
    }

    return {useLocalStorage, useSessionStorage};
});

// UI: Tabs mock (simple context-based tabs)
vi.mock("./components/ui/tabs", async () => {
    const React = await import("react");
    const Ctx = React.createContext<{ value: string; onValueChange?: (v: string) => void }>({
        value: "",
    });

    const Tabs = ({value, onValueChange, children}: any) => (
        <Ctx.Provider value={{value, onValueChange}}>{children}</Ctx.Provider>
    );
    const TabsList = ({children}: any) => <div data-testid="tabs-list">{children}</div>;
    const TabsTrigger = ({value, children}: any) => {
        const ctx = React.useContext(Ctx);
        return (
            <button type="button" onClick={() => ctx.onValueChange?.(value)}>
                {children}
            </button>
        );
    };
    const TabsContent = ({value, children}: any) => {
        const ctx = React.useContext(Ctx);
        return ctx.value === value ? <div data-testid={`tab-${value}`}>{children}</div> : null;
    };

    return {Tabs, TabsContent, TabsList, TabsTrigger};
});

// UI: Card mock
vi.mock("./components/ui/card", () => ({
    Card: ({children}: any) => <div data-testid="card">{children}</div>,
}));

// UI: Toaster mock
vi.mock("./components/ui/sonner", () => ({
    Toaster: () => <div data-testid="toaster"/>,
}));

// Child components: keep minimal & controllable
vi.mock("./components/Header.tsx", () => ({default: () => <div data-testid="header"/>}));
vi.mock("./components/Footer.tsx", () => ({default: ({version}: any) => <div data-testid="footer">{version}</div>}));
vi.mock("./components/Loader.tsx", () => ({default: () => <div data-testid="loader">loading...</div>}));

vi.mock("./components/Dialog.tsx", () => ({
    default: ({open, title, children}: any) =>
        open ? (
            <div data-testid="dialog">
                <div>{title}</div>
                {children}
            </div>
        ) : null,
}));

vi.mock("./components/PersonForm", () => ({
    PersonForm: ({onSave, logout, initialData}: any) => (
        <div data-testid="person-form">
            <div data-testid="person-initial">{initialData ? "has-data" : "no-data"}</div>
            <button
                type="button"
                onClick={() =>
                    onSave({
                        firstname: "Max",
                        lastname: "Muster",
                        topic: "IPA",
                        date: "2026-01-17",
                    })
                }
            >
                save-person
            </button>
            <button type="button" onClick={() => logout()}>
                logout
            </button>
        </div>
    ),
}));

vi.mock("./components/IpaLoginForm.tsx", () => ({
    IpaLoginForm: ({onSave}: any) => (
        <div data-testid="ipa-login">
            <button type="button" onClick={() => onSave("BB01")}>
                login
            </button>
        </div>
    ),
}));

vi.mock("./components/CriteriaList", () => ({
    CriteriaList: ({criteria, onSaveCriterion, onUpdateCriterion, onDeleteCriterion}: any) => (
        <div data-testid="criteria-list">
            <div data-testid="criteria-count">{criteria?.length ?? 0}</div>
            <button type="button" onClick={() => onSaveCriterion({id: "c-new"})}>
                add-criterion
            </button>
            <button type="button" onClick={() => onUpdateCriterion({id: "c1", title: "upd"})}>
                update-criterion
            </button>
            <button type="button" onClick={() => onDeleteCriterion("c1")}>
                delete-criterion
            </button>
        </div>
    )
}));

vi.mock("./components/GradesDisplay", () => ({
    GradesDisplay: ({id}: any) => <div data-testid="grades">grades-for:{id}</div>,
}));

vi.mock("./components/CriteriaSearchList.tsx", () => ({
    default: ({criteria}: any) => (
        <div data-testid="all-criteria">
            <div data-testid="all-criteria-count">{criteria?.length ?? 0}</div>
        </div>
    ),
}));

vi.mock("./components/ReadOnlyCriterionCard.tsx", () => ({
    ReadOnlyCriterionCard: ({criterion}: any) => <div data-testid="readonly-criterion">{criterion?.id}</div>,
}));

// --------------------
// Tests
// --------------------
describe("App", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        sessionStorage.clear();

        api.getVersions.mockResolvedValue("1.2.3");
        api.getAllCriteria.mockResolvedValue([]);
        api.getIpa.mockReset();
        api.getIpa.mockClear();
        api.getCriteria.mockResolvedValue([]);
    });

    it("zeigt Login-Tab wenn keine ipaId vorhanden ist", async () => {
        render(<App/>);

        // triggers are always visible in our Tabs mock (list is always rendered)
        expect(screen.getByText("Personendaten")).toBeInTheDocument();
        expect(screen.getByText("IPA Login")).toBeInTheDocument();
        expect(screen.getByText("Alle Kriterien")).toBeInTheDocument();

        // criteria/grades should NOT be visible when ipaId empty
        expect(screen.queryByText("Kriterien erfassen")).not.toBeInTheDocument();
        expect(screen.queryByText("Notenberechnung")).not.toBeInTheDocument();

        // version is loaded and passed to Footer
        await waitFor(() => expect(api.getVersions).toHaveBeenCalled());
        expect(screen.getByTestId("footer")).toHaveTextContent("1.2.3");
    });

    it("createIpa flow: speichert, zeigt Dialog + toast.success und blendet criteria/grades tabs ein", async () => {
        api.createIpa.mockResolvedValue({
            id: "BB01",
            firstname: "Max",
            lastname: "Muster",
            topic: "IPA",
            date: "2026-01-17",
            criteria: [{id: "c1"}],
        });

        render(<App/>);

        // Click save in mocked PersonForm
        fireEvent.click(screen.getAllByText("save-person")[0]);

        await waitFor(() => expect(api.createIpa).toHaveBeenCalled());

        // toast.success called
        expect(toast.success).toHaveBeenCalledTimes(1);
        expect(String(vi.mocked(toast.success).mock.calls[0][0])).toContain("BB01");

        // Dialog should open and show IPA id (App renders ipaId big)
        await waitFor(() => expect(screen.getByTestId("dialog")).toBeInTheDocument());
        expect(screen.getByTestId("dialog")).toHaveTextContent("IPA-ID");
        expect(screen.getByTestId("dialog")).toHaveTextContent("BB01");

        // After ipaId is set => criteria/grades tabs appear, login disappears
        await waitFor(() => {
            expect(screen.getByText("Kriterien erfassen")).toBeInTheDocument();
            expect(screen.getByText("Notenberechnung")).toBeInTheDocument();
        });

        // Also person tab shows the id line
        expect(screen.getByText(/IPA-ID:/)).toBeInTheDocument();
        expect(screen.getAllByText("BB01")[0]).toBeInTheDocument();
    });

    it("lädt bestehende ipaId aus localStorage und ruft getIpa auf, criteria tab zeigt Anzahl", async () => {
        localStorage.setItem("ipaId", "BB99");

        api.getIpa.mockResolvedValue({
            id: "BB99",
            firstname: "Eva",
            lastname: "Example",
            topic: "Topic",
            date: "2026-01-17",
            criteria: [{id: "c1"}, {id: "c2"}],
        });

        render(<App/>);

        await waitFor(() => expect(api.getIpa).toHaveBeenCalledWith("BB99"));

        // criteria/grades tabs should appear (ipaId exists)
        await waitFor(() => expect(screen.getAllByText("Kriterien erfassen")[0]).toBeInTheDocument());

        // switch to criteria tab via our TabsTrigger mock
        fireEvent.click(screen.getAllByText("Kriterien erfassen")[0]);

        // CriteriaList shows count 2
        await waitFor(() => expect(screen.getByTestId("criteria-count")).toHaveTextContent("2"));
    });

    it("deleteCriterion flow: ruft deleteCriterion und danach getCriteria und aktualisiert Liste", async () => {
        localStorage.setItem("ipaId", "BB01");

        api.getIpa.mockResolvedValue({
            id: "BB01",
            firstname: "A",
            lastname: "B",
            topic: "T",
            date: "2026-01-17",
            criteria: [{id: "c1"}, {id: "c2"}],
        });

        // after delete -> getCriteria returns smaller list
        api.deleteCriterion.mockResolvedValue(undefined);
        api.getCriteria.mockResolvedValue([{id: "c2"}]);

        render(<App/>);

        await waitFor(() => expect(api.getIpa).toHaveBeenCalled());

        fireEvent.click(screen.getAllByText("Kriterien erfassen")[0]);
        await waitFor(() => expect(screen.getByTestId("criteria-count")).toHaveTextContent("2"));

        fireEvent.click(screen.getByText("delete-criterion"));

        await waitFor(() => expect(api.deleteCriterion).toHaveBeenCalledWith("BB01", "c1"));
        await waitFor(() => expect(api.getCriteria).toHaveBeenCalledWith("BB01"));

        // UI updated to count 1
        await waitFor(() => expect(screen.getByTestId("criteria-count")).toHaveTextContent("1"));
    });

    it("updateCriterion: wenn personData vorhanden ist, ruft updateCriterion auf", async () => {
        localStorage.setItem("ipaId", "BB01");

        api.getIpa.mockResolvedValue({
            id: "BB01",
            firstname: "A",
            lastname: "B",
            topic: "T",
            date: "2026-01-17",
            criteria: [{id: "c1"}],
        });

        api.updateCriterion.mockResolvedValue({id: "c1", title: "upd"});

        render(<App/>);
        await waitFor(() => expect(api.getIpa).toHaveBeenCalled());

        fireEvent.click(screen.getAllByText("Kriterien erfassen")[0]);
        fireEvent.click(screen.getByText("update-criterion"));

        await waitFor(() => expect(api.updateCriterion).toHaveBeenCalledWith("BB01", "c1", expect.objectContaining({id: "c1"})));
    });

    it("ipa login button ruft loadData auf und navigiert zu person (route)", async () => {
        // no initial ipaId -> login tab visible
        api.getIpa.mockResolvedValue({
            id: "BB01",
            firstname: "A",
            lastname: "B",
            topic: "T",
            date: "2026-01-17",
            criteria: [],
        });

        render(<App/>);

        // go to login tab
        fireEvent.click(screen.getAllByText("IPA Login")[0]);
        expect(screen.getByTestId("ipa-login")).toBeInTheDocument();

        // perform login (calls ipaLogin -> loadData -> setRoute("person"))
        fireEvent.click(screen.getByText("login"));

        await waitFor(() => expect(api.getIpa).toHaveBeenCalledWith("BB01"));
        // person tab content should be visible (our TabsContent renders by route)
        await waitFor(() => expect(screen.getAllByTestId("tab-person")[0]).toBeInTheDocument());
    });
});
