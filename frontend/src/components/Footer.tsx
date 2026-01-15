import type {FC} from "react";

interface FooterProps {
    version: string;
}

const Footer: FC<FooterProps> = ({version}) => {
    return (
        <footer className="bg-white border-t border-slate-200 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-slate-500">
                <p>Projekt Bewertungssystem für Modul 324 (DevOps) und Modul 450 (Testing)</p>
                <p>{version}</p>
            </div>
        </footer>
    )
}

export default Footer;
