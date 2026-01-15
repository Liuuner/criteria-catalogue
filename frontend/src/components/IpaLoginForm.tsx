import {Label} from "./ui/label.tsx";
import {Input} from "./ui/input.tsx";
import {type FormEvent, useState} from "react";
import {Button} from "./ui/button.tsx";

interface IpaLoginFormProps {
    onSave: (id: string) => void;
}

export function IpaLoginForm({onSave}: Readonly<IpaLoginFormProps>) {
    const [ipaId, setIpaId] = useState("");

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSave(ipaId.toUpperCase());
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            <div className="space-y-2">
                <Label htmlFor="ipaId">IPA ID *</Label>
                <Input
                    className={"bg-[#F3F3F5]!"}
                    id="ipaId"
                    type="text"
                    value={ipaId}
                    onChange={e => setIpaId(e.target.value)}
                    required
                    placeholder="AB12"
                />
            </div>

            <Button type="submit" className="w-full sm:w-auto">
                IPA Laden
            </Button>
        </form>
    )
}
