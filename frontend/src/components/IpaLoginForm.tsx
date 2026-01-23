import {Label} from "./ui/label.tsx";
import {Input} from "./ui/input.tsx";
import {type FormEvent, useState} from "react";
import {Button} from "./ui/button.tsx";

interface IpaLoginFormProps {
    onLogin: (id: string, password: string) => void;
    defaultIpaId?: string;
}

export function IpaLoginForm({onLogin, defaultIpaId = ""}: Readonly<IpaLoginFormProps>) {
    const [ipaId, setIpaId] = useState(defaultIpaId);
    const [ipaPassword, setIpaPassword] = useState("");

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onLogin(ipaId.toUpperCase(), ipaPassword);
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
            <div className="space-y-2">
                <Label htmlFor="ipaId">Passwort</Label>
                <Input
                    className={"bg-[#F3F3F5]!"}
                    id="ipaPassword"
                    type="password"
                    value={ipaPassword}
                    onChange={e => setIpaPassword(e.target.value)}
                    required
                    placeholder={"Password"}
                />
            </div>

            <Button type="submit" className="w-full sm:w-auto">
                IPA Laden
            </Button>
        </form>
    )
}
