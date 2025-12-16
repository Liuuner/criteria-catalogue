import {useState, useEffect, type FormEvent, type ChangeEvent} from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import type {PersonData} from "../types.ts";

interface PersonFormProps {
  initialData: PersonData | null;
  onSave: (data: PersonData) => void;
}

export function PersonForm({ initialData, onSave }: Readonly<PersonFormProps>) {
  const [formData, setFormData] = useState<PersonData>({
    name: '',
    vorname: '',
    thema: '',
    datum: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field: keyof PersonData) => (e: ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <Label htmlFor="vorname">Vorname *</Label>
        <Input
          id="vorname"
          type="text"
          value={formData.vorname}
          onChange={handleChange('vorname')}
          required
          placeholder="Max"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={handleChange('name')}
          required
          placeholder="Mustermann"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="thema">Thema der Arbeit *</Label>
        <Input
          id="thema"
          type="text"
          value={formData.thema}
          onChange={handleChange('thema')}
          required
          placeholder="z.B. Webapplikation für Projektbewertung"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="datum">Datum der Abgabe *</Label>
        <Input
          id="datum"
          type="date"
          value={formData.datum}
          onChange={handleChange('datum')}
          required
        />
      </div>

      <Button type="submit" className="w-full sm:w-auto">
        Personendaten speichern
      </Button>
    </form>
  );
}
