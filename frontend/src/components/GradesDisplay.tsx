import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import type {GradeResult} from "../types.ts";

interface GradesDisplayProps {
  grades: {
    criteria: GradeResult[];
    teil1: { note: string; kriterien: GradeResult[] };
    teil2: { note: string; kriterien: GradeResult[] };
  } | null;
}

export function GradesDisplay({ grades }: Readonly<GradesDisplayProps>) {
  if (!grades) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p>Keine Notendaten verfügbar.</p>
      </div>
    );
  }

  const getGradeColor = (note: number) => {
    if (note >= 5.5) return 'text-green-600';
    if (note >= 4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGutestufeColor = (stufe: number) => {
    if (stufe === 3) return 'bg-green-100 text-green-800 border-green-200';
    if (stufe === 2) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (stufe === 1) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <div className="space-y-8">
      {/* Gesamtübersicht */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-linear-to-br from-blue-50 to-blue-100 border-blue-200">
          <h3 className="mb-2 text-blue-900">Teil 1: Umsetzung</h3>
          <div className={`text-5xl mb-2 ${getGradeColor(Number.parseFloat(grades.teil1.note))}`}>
            {grades.teil1.note}
          </div>
          <p className="text-slate-600">
            Basierend auf {grades.teil1.kriterien.length} Kriterien
          </p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <h3 className="mb-2 text-purple-900">Teil 2: Dokumentation</h3>
          <div className={`text-5xl mb-2 ${getGradeColor(parseFloat(grades.teil2.note))}`}>
            {grades.teil2.note}
          </div>
          <p className="text-slate-600">
            Basierend auf {grades.teil2.kriterien.length} Kriterien
          </p>
        </Card>
      </div>

      {/* Details Teil 1 */}
      <div>
        <h3 className="mb-4">Teil 1 - Detailübersicht</h3>
        <div className="space-y-3">
          {grades.teil1.kriterien.map((criterion) => (
            <Card key={criterion.id} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="font-mono">{criterion.id}</Badge>
                  <span>{criterion.titel}</span>
                </div>
                <Badge className={getGutestufeColor(criterion.gutestufe)}>
                  Gütestufe {criterion.gutestufe}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Erfüllt: {criterion.checkedCount} von {criterion.totalRequirements}</span>
                  <span>{Math.round((criterion.checkedCount / criterion.totalRequirements) * 100)}%</span>
                </div>
                <Progress
                  value={(criterion.checkedCount / criterion.totalRequirements) * 100}
                  className="h-2"
                />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Details Teil 2 */}
      {grades.teil2.kriterien.length > 0 && (
        <div>
          <h3 className="mb-4">Teil 2 - Detailübersicht</h3>
          <div className="space-y-3">
            {grades.teil2.kriterien.map((criterion) => (
              <Card key={criterion.id} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono">{criterion.id}</Badge>
                    <span>{criterion.titel}</span>
                  </div>
                  <Badge className={getGutestufeColor(criterion.gutestufe)}>
                    Gütestufe {criterion.gutestufe}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Erfüllt: {criterion.checkedCount} von {criterion.totalRequirements}</span>
                    <span>{Math.round((criterion.checkedCount / criterion.totalRequirements) * 100)}%</span>
                  </div>
                  <Progress
                    value={(criterion.checkedCount / criterion.totalRequirements) * 100}
                    className="h-2"
                  />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Alle Kriterien */}
      <div>
        <h3 className="mb-4">Alle Kriterien im Überblick</h3>
        <Card className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {grades.criteria.map((criterion) => (
              <div key={criterion.id} className="text-center p-3 rounded-lg bg-slate-50">
                <div className="font-mono mb-1">{criterion.id}</div>
                <Badge className={getGutestufeColor(criterion.gutestufe)}>
                  {criterion.gutestufe}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Legende */}
      <Card className="p-6 bg-slate-50">
        <h4 className="mb-4">Berechnungshinweise</h4>
        <div className="space-y-2 text-slate-700">
          <p>
            <strong>Gütestufe pro Kriterium:</strong> Basiert auf der Anzahl erfüllter Anforderungen
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Gütestufe 3: Alle Anforderungen erfüllt</li>
            <li>Gütestufe 2: 4-5 Anforderungen erfüllt</li>
            <li>Gütestufe 1: 2-3 Anforderungen erfüllt</li>
            <li>Gütestufe 0: Weniger als 2 Anforderungen erfüllt</li>
          </ul>
          <p className="mt-4">
            <strong>Note:</strong> Durchschnitt der Gütestufen umgerechnet in eine Note (1-6)
          </p>
          <p className="text-slate-500">
            Formel: (Durchschnitt Gütestufe / 3) × 5 + 1
          </p>
        </div>
      </Card>
    </div>
  );
}
