type HeaderData = {
    id: string
    name: string
    recommended_limit: number | undefined
    band: string | undefined
}

export default function DetailsHeader({
    id,
    name,
    recommended_limit,
    band,
}: HeaderData) {
    return (
        <header className="overflow-hidden border-b p-4 lg:p-8 space-y-4">
            {/* breadcrumbs */}
            <div>
                <h1 className="text-sm sm:text-base text-muted-foreground">
                    Dashboard
                </h1>
            </div>

            {/* title n limit */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 space-y-1">
                    <h1 className="break-words text-xl font-bold sm:text-2xl lg:text-3xl">
                        {name}
                    </h1>

                    <p className="break-words text-sm sm:text-base text-muted-foreground">
                        Application ID: LA-2026-{id}
                    </p>
                </div>

                {/* desktop plafon */}
                <div className="hidden shrink-0 text-right lg:block">
                    <p className="text-sm text-muted-foreground">
                        Plafon Rekomendasi
                    </p>

                    <h1 className="text-2xl font-bold lg:text-3xl xl:text-4xl">
                        Rp {recommended_limit?.toLocaleString("id-ID") ?? "-"}
                    </h1>
                </div>
            </div>

            {/* mobile plafon card */}
            <div className="block rounded-xl border p-4 space-y-4 lg:hidden">
                <div>
                    <p className="text-sm text-muted-foreground">
                        Plafon Rekomendasi
                    </p>

                    <h1 className="break-words text-2xl font-bold sm:text-3xl">
                        Rp {recommended_limit?.toLocaleString("id-ID") ?? "-"}
                    </h1>
                </div>

                <hr />

                <div className="space-y-2">
                    <p className="w-fit rounded-full bg-blue-card px-4 py-2 text-xs sm:text-sm text-blue-card-txt">
                        Menunggu Persetujuan Analis
                    </p>

                    <p className="text-sm sm:text-base text-muted-foreground">
                        Berdasarkan skor 78 · Band {band} (70–84) → Rp 15jt–30jt
                    </p>
                </div>
            </div>

            {/* desktop status */}
            <div className="hidden lg:flex lg:items-center lg:justify-between lg:gap-6">
                <p className="w-fit shrink-0 rounded-full bg-blue-card px-4 py-2 text-sm text-blue-card-txt">
                    Menunggu Persetujuan Analis
                </p>

                <p className="max-w-xl text-right text-sm xl:text-base text-muted-foreground">
                    Berdasarkan skor 78 · Band {band} (70–84) → Rp 15jt–30jt
                </p>
            </div>
        </header>
    )
}