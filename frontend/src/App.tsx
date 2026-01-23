import {useEffect, useState} from 'react';
import {PersonForm} from './components/PersonForm';
import {CriteriaList} from './components/CriteriaList';
import {GradesDisplay} from './components/GradesDisplay';
import {Tabs, TabsContent, TabsList, TabsTrigger} from './components/ui/tabs';
import {Card} from './components/ui/card';
import {Toaster} from './components/ui/sonner';
import {toast} from 'sonner';
import type {Criterion, PersonData} from "./types.ts";
import {
    createCriterion,
    createIpa,
    deleteCriterion,
    getAllCriteria,
    getCriteria,
    getIpa,
    getVersions, login, logout,
    updateCriterion,
} from "./utils/service/projectApi.ts";
import Header from "./components/Header.tsx";
import Footer from "./components/Footer.tsx";
import Loader from "./components/Loader.tsx";
import {IpaLoginForm} from "./components/IpaLoginForm.tsx";
import Dialog from "./components/Dialog.tsx";
import CriteriaSearchList from "./components/CriteriaSearchList.tsx";
import {ReadOnlyCriterionCard} from "./components/ReadOnlyCriterionCard.tsx";
import {useLocalStorage, useSessionStorage} from "./utils/hooks/useStorage.tsx";

export default function App() {
    const [version, setVersion] = useState<string>("0.0.0");
    const [route, setRoute] = useSessionStorage("currentRoute", 'person');
    const [ipaId, setIpaId, clearIpaId] = useLocalStorage<string>("ipaId", "");
    const [personData, setPersonData] = useState<PersonData | null>(null);
    const [defaultCriteria, setDefaultCriteria] = useState<Criterion[]>([])
    const [criteria, setCriteria] = useState<Criterion[]>([]);
    const [loading, setLoading] = useState(true);
    const [isIpaIdModal, setIsIpaIdModal] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        void getVersions().then((version) => setVersion(version))
        void loadData(ipaId);
        void getAllCriteria().then(criteria => setDefaultCriteria(criteria));
    }, []);

    const catchUnauthorized = (error: unknown) => {
        if (error instanceof Error && error.message.includes('401')) {
            toast.error('Nicht autorisierter Zugriff. Bitte melden Sie sich erneut an.');
            void logout();
            setIsLoggedIn(false);
            setPersonData(null);
            setRoute("login");
        } else {
            throw error;
        }
    }

    const loadData = async (id: string) => {
        try {
            if (!id) {
                return;
            }

            setLoading(true);

            const ipa = await getIpa(id).catch(catchUnauthorized);

            if (ipa) {
                setIsLoggedIn(true)
                setPersonData({...ipa, criteria: null} as PersonData);
                setCriteria(ipa.criteria)

                setIpaId(id)
                localStorage.setItem('ipaId', id);
            }
        } catch (error) {
            console.error('Fehler beim Laden der Daten:', error);
            toast.error('Fehler beim Laden der Daten');
        } finally {
            setLoading(false);
        }
    };

    const createIpaMethod = async (data: PersonData) => {
        try {
            if (data.firstname && data.lastname && data.topic && data.date) {
                const result = await createIpa(data).catch(catchUnauthorized);

                if (result) {
                    setIsLoggedIn(true);
                    setPersonData({...result, criteria: null} as PersonData);
                    setCriteria(result.criteria);
                    setIpaId(result.id ?? "");
                    setIsIpaIdModal(true);
                    toast.success(`IPA Daten gespeichert - Ihre IPA-ID ist: ${result.id}`);
                } else {
                    toast.error('Fehler beim Speichern');
                }
            }
        } catch (error) {
            console.error('Fehler beim Speichern der Personendaten:', error);
            toast.error('Fehler beim Speichern der Personendaten');
        }
    };

    const handleLogin = async (ipaIdLogin: string, password: string) => {
        try {
            const success = await login({id: ipaIdLogin, password: password}).catch(catchUnauthorized);
            if (!success) {
                toast.error('Login fehlgeschlagen. Bitte überprüfen Sie Ihre IPA-ID und Ihr Passwort.');
                return;
            }
            setIsLoggedIn(true)
            await loadData(ipaIdLogin).then(() => setRoute("person"));
        } catch (error) {
            console.error('Fehler beim Login:', error);
            toast.error('Fehler beim Login');
        }
    }

    const handleLogout = () => {
        logout().then(() => toast.success("Erfolgreich ausgeloggt")).catch(catchUnauthorized);
        setPersonData(null);
        clearIpaId();
    }

    const saveCriterionMethod = async (criterion: Criterion) => {
        try {
            const result = await createCriterion(ipaId, criterion).catch(catchUnauthorized);

            if (result) {
                setCriteria([...criteria, result]);
                toast.success('Fortschritt gespeichert');
            }
        } catch (error) {
            console.error('Fehler beim erstellen des Kriteriums:', error);
            toast.error('Fehler beim erstellen des Kriteriums.');
        }
    }

    const updateCriterionMethod = async (criterion: Criterion) => {
        try {
            if (!personData?.id) {
                return;
            }
            const result = await updateCriterion(personData?.id, criterion.id, criterion).catch(catchUnauthorized);

            if (result) {
                setCriteria(prev => prev.map(c => c.id === criterion.id ? result : c));
            }

        } catch (error) {
            console.error('Fehler beim Speichern des Fortschritts:', error);
            toast.error('Fehler beim Speichern des Fortschritts');
        }
    };

    const deleteCriterionMethod = async (criterionId: string) => {
        try {
            await deleteCriterion(ipaId, criterionId).catch(catchUnauthorized).then(() => {
                void getCriteria(ipaId).then(criteria => setCriteria(criteria))
            })
        } catch (error) {
            console.error('Fehler beim löschen des Kriteriums:', error);
            toast.error('Fehler beim löschen des Kriteriums');
        }
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Toaster/>

            {loading && <Loader/>}

            <Header/>

            <Dialog open={isIpaIdModal} size={"small"} onClose={() => setIsIpaIdModal(false)} title={"IPA-ID"}>
                <p className={"text-center"}><b>Bitte Merke dir diese ID, sie ist dein "Login".</b></p>
                <p className={"text-center"}><b className={"text-red-600 text-[100px]"}>{ipaId}</b></p>
            </Dialog>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Tabs value={route} onValueChange={value => setRoute(value)} defaultValue="person"
                      className="space-y-6">
                    <TabsList className="bg-white border border-slate-200">
                        <TabsTrigger value="person">Personendaten</TabsTrigger>
                        {!isLoggedIn &&
                            <TabsTrigger value="login">IPA Login</TabsTrigger>
                        }
                        {isLoggedIn && <>
                            <TabsTrigger value="criteria">Kriterien erfassen</TabsTrigger>
                            <TabsTrigger value="grades">Notenberechnung</TabsTrigger>
                        </>}
                        <TabsTrigger value="all-criteria">Alle Kriterien</TabsTrigger>
                    </TabsList>

                    <TabsContent value="person">
                        <Card className="p-6">
                            <h2 className="text-2xl"><b>Personendaten erfassen</b></h2>
                            {ipaId && isLoggedIn && <h3>IPA-ID: <b className={"text-red-600"}>{ipaId}</b></h3>}
                            <PersonForm initialData={personData} onSave={createIpaMethod} logout={handleLogout}/>
                        </Card>
                    </TabsContent>

                    <TabsContent value="login">
                        <Card className="p-6">
                            <h2 className="mb-6 text-2xl"><b>IPA Login</b></h2>
                            <IpaLoginForm onLogin={handleLogin} defaultIpaId={ipaId}/>
                        </Card>
                    </TabsContent>

                    <TabsContent value="criteria">
                        <Card className="p-6">
                            <h2 className="mb-6 text-2xl"><b>Kriterien und Fortschritt</b></h2>
                            <CriteriaList
                                criteria={criteria}
                                onSaveCriterion={saveCriterionMethod}
                                onUpdateCriterion={updateCriterionMethod}
                                onDeleteCriterion={deleteCriterionMethod}
                                defaultCriteria={defaultCriteria}
                            />
                        </Card>
                    </TabsContent>

                    <TabsContent value="grades">
                        <Card className="p-6">
                            <h1 className="mb-6 text-2xl"><b>Mutmassliche Note</b></h1>
                            {personData && (
                                <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                    <p><strong>Name:</strong> {personData.firstname} {personData.lastname}</p>
                                    <p><strong>Thema:</strong> {personData.topic}</p>
                                    <p><strong>Abgabedatum:</strong> {personData.date}</p>
                                </div>
                            )}
                            <GradesDisplay id={ipaId}/>
                        </Card>
                    </TabsContent>

                    <TabsContent value={"all-criteria"}>
                        <Card className="p-6">
                            <h1 className="mb-6 text-2xl"><b>Alle Kriterien</b></h1>
                            <CriteriaSearchList criteria={defaultCriteria} renderCriterion={(c) => (
                                <ReadOnlyCriterionCard key={c.id} className={"border-l-4 border-l-blue-500"}
                                                       criterion={c} defaultExpanded={false}/>
                            )}/>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>

            <Footer version={version}/>
        </div>
    );
}
