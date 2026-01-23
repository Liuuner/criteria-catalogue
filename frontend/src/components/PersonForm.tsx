import {useState, useEffect, type FormEvent, type ChangeEvent} from 'react';
import {Button} from './ui/button';
import {Input} from './ui/input';
import {Label} from './ui/label';
import type {PersonData} from "../types.ts";

interface PersonFormProps {
    initialData: PersonData | null;
    onSave: (data: PersonData) => void;
    logout: () => void;
}

const defaultFormData = {
    id: null,
    firstname: '',
    lastname: '',
    topic: '',
    date: ''
}

export function PersonForm({initialData, onSave, logout}: Readonly<PersonFormProps>) {
    const [formData, setFormData] = useState<PersonData>(defaultFormData);

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
        setFormData(prev => ({...prev, [field]: e.target.value}));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            {initialData !== null && (
                <Button onClick={() => {
                    logout();
                    setFormData(defaultFormData);
                }} variant={"destructive"} type={"button"}>
                    Logout
                </Button>
            )}

            <div className="space-y-2">
                <Label htmlFor="firstname">Vorname *</Label>
                <Input
                    className={"bg-[#F3F3F5]!"}
                    id="firstname"
                    type="text"
                    value={formData.firstname}
                    onChange={handleChange('firstname')}
                    required
                    placeholder="Max"
                    disabled={initialData !== null}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="lastname">Name *</Label>
                <Input
                    className={"bg-[#F3F3F5]!"}
                    id="lastname"
                    type="text"
                    value={formData.lastname}
                    onChange={handleChange('lastname')}
                    required
                    placeholder="Mustermann"
                    disabled={initialData !== null}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="topic">Thema der Arbeit *</Label>
                <Input
                    className={"bg-[#F3F3F5]!"}
                    id="topic"
                    type="text"
                    value={formData.topic}
                    onChange={handleChange('topic')}
                    required
                    placeholder="z.B. Webapplikation für Projektbewertung"
                    disabled={initialData !== null}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="date">Datum der Abgabe *</Label>
                <Input
                    className={"bg-[#F3F3F5]!"}
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange('date')}
                    required
                    disabled={initialData !== null}
                />
            </div>

            {initialData == null && <div className="space-y-2">
                <Label htmlFor="password">Passwort</Label>
                <Input
                    className={"bg-[#F3F3F5]!"}
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange('password')}
                    required
                />
            </div>}

            {initialData === null && (
                <Button type="submit" className="w-full sm:w-auto">
                    Personendaten speichern
                </Button>
            )}
        </form>
    );
}
