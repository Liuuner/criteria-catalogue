const Loader = () => {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="text-center">
                <div
                    className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                <p className="mt-4 text-slate-600">Lade Daten...</p>
            </div>
        </div>
    )
}

export default Loader;
