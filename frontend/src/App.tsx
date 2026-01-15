import {useEffect, useState} from 'react';
import {PersonForm} from './components/PersonForm';
import {CriteriaList} from './components/CriteriaList';
import {GradesDisplay} from './components/GradesDisplay';
import {Tabs, TabsContent, TabsList, TabsTrigger} from './components/ui/tabs';
import {Card} from './components/ui/card';
import {Toaster} from './components/ui/sonner';
import {toast} from 'sonner';
import type {Criterion, GradesPayload, PersonData} from "./types.ts";
import {
    createIpa,
    deleteCriterion,
    getAllCriteria, getCriteria,
    getGrades,
    getIpa, getVersions,
    updateCriterion,
} from "./utils/service/projectApi.ts";
import Header from "./components/Header.tsx";
import Footer from "./components/Footer.tsx";
import Loader from "./components/Loader.tsx";
import {IpaLoginForm} from "./components/IpaLoginForm.tsx";
import Dialog from "./components/Dialog.tsx";

export default function App() {
    const [version, setVersion] = useState<string>("0.0.0");
    const [route, setRoute] = useState('person');
    const [ipaId, setIpaId] = useState<string>(localStorage.getItem('ipaId') ?? "");
    const [personData, setPersonData] = useState<PersonData | null>(null);
    const [defaultCriteria, setDefaultCriteria] = useState<Criterion[]>([])
    const [criteria, setCriteria] = useState<Criterion[]>([]);
    const [grades, setGrades] = useState<GradesPayload | null>(null);
    const [loading, setLoading] = useState(true);
    const [isIpaIdModal, setIsIpaIdModal] = useState(false);

    useEffect(() => {
        void getVersions().then((version) => setVersion(version))
        void loadData(ipaId);
        void getAllCriteria().then(criteria => setDefaultCriteria(criteria));
    }, []);

    const loadData = async (id: string) => {
        try {
            if (!id) {
                return;
            }

            setLoading(true);

            const ipa = await getIpa(id);

            if (ipa) {
                setPersonData({...ipa, criteria: null} as PersonData);
                setCriteria(ipa.criteria)

                await loadGrades(id);

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

    const loadGrades = async (id: string) => {
        try {
            const grades = await getGrades(id);
            if (grades) {
                setGrades(grades);
            }
        } catch (error) {
            console.error('Fehler beim Laden der Noten:', error);
        }
    };

    const createIpaMethod = async (data: PersonData) => {
        try {
            if (data.firstname && data.lastname && data.topic && data.date) {
                const result = await createIpa(data)

                if (result) {
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

    const ipaLogin = async (ipaIdLogin: string) => {
        try {
            await loadData(ipaIdLogin).then(() => setRoute("person"));
        } catch (error) {
            console.error('Fehler beim Login:', error);
            toast.error('Fehler beim Login');
        }
    }

    const logout = () => {
        setPersonData(null);
        localStorage.removeItem('ipaId');
        setIpaId("");
    }

    const updateCriterionMethod = async (criterion: Criterion) => {
        try {
            if (!personData?.id) {
                return;
            }
            const result = await updateCriterion(personData?.id, criterion.id, criterion)

            if (result) {
                setCriteria(prev => prev.map(c => c.id === criterion.id ? result : c));
                toast.success('Fortschritt gespeichert');

                await loadGrades(ipaId);
            }

        } catch (error) {
            console.error('Fehler beim Speichern des Fortschritts:', error);
            toast.error('Fehler beim Speichern des Fortschritts');
        }
    };

    const deleteCriterionMethod = async (criterionId: string) => {
        try {
            await deleteCriterion(ipaId, criterionId).then(() => {
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

            <Dialog open={isIpaIdModal} onClose={() => setIsIpaIdModal(false)} title={"IPA-ID"}>
                <p><b>Bitte Merke dir diese ID, sie ist dein "Login".</b></p>
                <br/>
                <h3>ID: <b className={"text-red-600"}>{ipaId}</b></h3>
            </Dialog>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Tabs value={route} onValueChange={value => setRoute(value)} defaultValue="person" className="space-y-6" >
                    <TabsList className="bg-white border border-slate-200">
                        <TabsTrigger value="person">Personendaten</TabsTrigger>
                        {!ipaId &&
                            <TabsTrigger value="login">IPA Login</TabsTrigger>
                        }
                        {ipaId && <>
                            <TabsTrigger value="criteria">Kriterien erfassen</TabsTrigger>
                            <TabsTrigger value="grades">Notenberechnung</TabsTrigger>
                        </>}
                    </TabsList>

                    <TabsContent value="person">
                        <Card className="p-6">
                            <h2 className="text-2xl"><b>Personendaten erfassen</b></h2>
                            {ipaId && <h3>IPA-ID: <b className={"text-red-600"}>{ipaId}</b></h3>}
                            <PersonForm initialData={personData} onSave={createIpaMethod} logout={logout}/>
                        </Card>
                    </TabsContent>

                    <TabsContent value="login">
                        <Card className="p-6">
                            <h2 className="mb-6 text-2xl"><b>IPA Login</b></h2>
                            <IpaLoginForm onSave={ipaLogin}/>
                        </Card>
                    </TabsContent>

                    <TabsContent value="criteria">
                        <Card className="p-6">
                            <h2 className="mb-6 text-2xl"><b>Kriterien und Fortschritt</b></h2>
                            <CriteriaList
                                criteria={criteria}
                                onSaveCriterion={updateCriterionMethod}
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
                            <GradesDisplay grades={grades}/>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>

            <Footer version={version}/>
        </div>
    );
}
