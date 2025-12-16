import {useState, useEffect} from 'react';
import {PersonForm} from './components/PersonForm';
import {CriteriaList} from './components/CriteriaList';
import {GradesDisplay} from './components/GradesDisplay';
import {Tabs, TabsContent, TabsList, TabsTrigger} from './components/ui/tabs';
import {Card} from './components/ui/card';
import {Toaster} from './components/ui/sonner';
import {toast} from 'sonner';
import type {Criterion, CriterionProgress, GradeResult, PersonData} from "./types.ts";
import {getCriteria, getGrades, getPerson, getProgress, savePerson, saveProgress} from "./utils/service/projectApi.ts";

export default function App() {
    const [personData, setPersonData] = useState<PersonData | null>(null);
    const [criteria, setCriteria] = useState<Criterion[]>([]);
    const [progress, setProgress] = useState<Record<string, CriterionProgress>>({});
    const [grades, setGrades] = useState<{
        criteria: GradeResult[];
        teil1: { note: string; kriterien: GradeResult[] };
        teil2: { note: string; kriterien: GradeResult[] };
    } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);

            // Personendaten laden
            const personDataObject = await getPerson()
            if (personDataObject) {
                setPersonData(personDataObject);
            }

            // Kriterien laden
            const criteriaObject = await getCriteria()
            if (criteriaObject) {
                setCriteria(criteriaObject);

                // Fortschritt für jedes Kriterium laden
                const progressData: Record<string, CriterionProgress> = {};
                for (const criterion of criteriaObject) {
                    const progressJson = await getProgress(criterion.id)
                    if (progressJson) {
                        progressData[criterion.id] = progressJson;
                    }
                }
                setProgress(progressData);
            }

            // Noten laden
            await loadGrades();

        } catch (error) {
            console.error('Fehler beim Laden der Daten:', error);
            toast.error('Fehler beim Laden der Daten');
        } finally {
            setLoading(false);
        }
    };

    const loadGrades = async () => {
        try {
            const criteria = await getGrades();
            if (criteria) {
                setGrades(criteria);
            }
        } catch (error) {
            console.error('Fehler beim Laden der Noten:', error);
        }
    };

    const savePersonMethod = async (data: PersonData) => {
        try {
            const result = await savePerson(data)

            if (result.success) {
                setPersonData(data);
                toast.success('Personendaten gespeichert');
            } else {
                toast.error(result.error || 'Fehler beim Speichern');
            }
        } catch (error) {
            console.error('Fehler beim Speichern der Personendaten:', error);
            toast.error('Fehler beim Speichern der Personendaten');
        }
    };

    const saveProgressMethod = async (criterionId: string, progressData: CriterionProgress) => {
        try {
            const result = await saveProgress(criterionId, progressData)

            if (result.success) {
                setProgress(prev => ({...prev, [criterionId]: progressData}));
                toast.success('Fortschritt gespeichert');

                // Noten neu berechnen
                await loadGrades();
            } else {
                toast.error(result.error || 'Fehler beim Speichern');
            }
        } catch (error) {
            console.error('Fehler beim Speichern des Fortschritts:', error);
            toast.error('Fehler beim Speichern des Fortschritts');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div
                        className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    <p className="mt-4 text-slate-600">Lade Daten...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Toaster/>

            <header className="bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <h1 className="text-slate-900">Projekt Bewertung - Modul 324 & 450</h1>
                    <p className="text-slate-600 mt-2">Verfolgen Sie Ihren Projektfortschritt und berechnen Sie Ihre
                        Note</p>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Tabs defaultValue="person" className="space-y-6">
                    <TabsList className="bg-white border border-slate-200">
                        <TabsTrigger value="person">Personendaten</TabsTrigger>
                        <TabsTrigger value="criteria">Kriterien erfassen</TabsTrigger>
                        <TabsTrigger value="grades">Notenberechnung</TabsTrigger>
                    </TabsList>

                    <TabsContent value="person">
                        <Card className="p-6">
                            <h2 className="mb-6">Personendaten erfassen</h2>
                            <PersonForm initialData={personData} onSave={savePersonMethod}/>
                        </Card>
                    </TabsContent>

                    <TabsContent value="criteria">
                        <Card className="p-6">
                            <h2 className="mb-6">Kriterien und Fortschritt</h2>
                            <CriteriaList
                                criteria={criteria}
                                progress={progress}
                                onSaveProgress={saveProgressMethod}
                            />
                        </Card>
                    </TabsContent>

                    <TabsContent value="grades">
                        <Card className="p-6">
                            <h2 className="mb-6">Mutmassliche Note</h2>
                            {personData && (
                                <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                    <p><strong>Name:</strong> {personData.vorname} {personData.name}</p>
                                    <p><strong>Thema:</strong> {personData.thema}</p>
                                    <p><strong>Abgabedatum:</strong> {personData.datum}</p>
                                </div>
                            )}
                            <GradesDisplay grades={grades}/>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>

            <footer className="bg-white border-t border-slate-200 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-slate-500">
                    <p>Projekt Bewertungssystem für Modul 324 (DevOps) und Modul 450 (Testing)</p>
                </div>
            </footer>
        </div>
    );
}
