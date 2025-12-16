import {useState, useEffect, type ChangeEvent} from 'react';
// TODO fix typing with new structure
import type {Criterion, CriterionProgress} from '../App';
import { Card } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Badge } from './ui/badge';

interface CriterionCardProps {
  criterion: Criterion;
  progress: CriterionProgress;
  onSave: (progress: CriterionProgress) => void;
}

export function CriterionCard({ criterion, progress, onSave }: Readonly<CriterionCardProps>) {
  const [checkedRequirements, setCheckedRequirements] = useState<number[]>(progress.checkedRequirements);
  const [notes, setNotes] = useState<string>(progress.notes);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setCheckedRequirements(progress.checkedRequirements);
    setNotes(progress.notes);
    setHasChanges(false);
  }, [progress]);

  const handleCheckChange = (index: number, checked: boolean) => {
    const newChecked = checked
      ? [...checkedRequirements, index]
      : checkedRequirements.filter(i => i !== index);
    setCheckedRequirements(newChecked);
    setHasChanges(true);
  };

  const handleNotesChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave({ checkedRequirements, notes });
    setHasChanges(false);
  };

  const calculateGutestufe = () => {
    const total = criterion.anforderungen.length;
    const checked = checkedRequirements.length;

    if (checked === total) return 3;
    if (checked >= 4) return 2;
    if (checked >= 2) return 1;
    return 0;
  };

  const gutestufe = calculateGutestufe();
  const gutestufeColors = {
    0: 'bg-red-100 text-red-800 border-red-200',
    1: 'bg-orange-100 text-orange-800 border-orange-200',
    2: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    3: 'bg-green-100 text-green-800 border-green-200'
  };

  return (
    <Card className="p-6 border-l-4 border-l-blue-500">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="outline" className="font-mono">{criterion.id}</Badge>
            <h3>{criterion.titel}</h3>
          </div>
          <p className="text-slate-600 italic">{criterion.leitfrage}</p>
        </div>
        <Badge className={gutestufeColors[gutestufe]}>
          Gütestufe {gutestufe}
        </Badge>
      </div>

      <div className="mb-4">
        <Label className="mb-3 block">Anforderungen ({checkedRequirements.length} von {criterion.anforderungen.length} erfüllt)</Label>
        <div className="space-y-3">
          {criterion.anforderungen.map((anforderung, index) => (
            <div key={anforderung} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
              <Checkbox
                id={`${criterion.id}-req-${index}`}
                checked={checkedRequirements.includes(index)}
                onCheckedChange={(checked) => handleCheckChange(index, checked as boolean)}
              />
              <label
                htmlFor={`${criterion.id}-req-${index}`}
                className="flex-1 cursor-pointer text-slate-700"
              >
                {anforderung}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <Label htmlFor={`${criterion.id}-notes`} className="mb-2 block">
          Notizen (Was fehlt noch?)
        </Label>
        <Textarea
          id={`${criterion.id}-notes`}
          value={notes}
          onChange={handleNotesChange}
          placeholder="Fügen Sie hier Ihre Notizen hinzu..."
          rows={3}
          className="resize-none"
        />
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <div className="text-slate-600">
          <p className="mb-1">Gütestufen:</p>
          <div className="space-y-1">
            {Object.entries(criterion.gutestufen).sort((a, b) => Number(b[0]) - Number(a[0])).map(([stufe, beschreibung]) => (
              <p key={stufe} className={`${stufe === String(gutestufe) ? 'font-semibold text-slate-900' : ''}`}>
                {stufe}: {beschreibung}
              </p>
            ))}
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={!hasChanges}
          variant={hasChanges ? "default" : "outline"}
        >
          {hasChanges ? 'Speichern' : 'Gespeichert'}
        </Button>
      </div>
    </Card>
  );
}
