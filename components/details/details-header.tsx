import DetailsHeaderSkeleton from "../skeletons/details/details-header"
import { getStatusStyle } from "@/lib/risk-profile"

type HeaderData = {
    id: string
    name: string
    recommended_limit: number | undefined
    band: string | undefined
    bandRange: string | undefined
    score: number | undefined
    scorePercentile: number | undefined
    status: string | undefined
    loading?: boolean
}

export default function DetailsHeader({
    id,
    name,
    recommended_limit,
    band,
    bandRange,
    score,
    scorePercentile,
    status,
    loading = false,
}: HeaderData) {
    if (loading) {
        return <DetailsHeaderSkeleton />
    }

    const safeStatus = status ?? "Pending Review"
    const calibratedPosition =
        typeof scorePercentile === "number"
            ? `${Math.round(scorePercentile * 100)}% data kalibrasi`
            : "data kalibrasi model"

    return (
        <header className="overflow-hidden border-b p-4 lg:p-8 space-y-4">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 space-y-1">
                    <h1 className="break-words text-xl font-bold sm:text-2xl lg:text-3xl">
                        {name}
                    </h1>

                    <p className="break-words text-sm text-muted-foreground">
                        Application ID: {id}
                    </p>
                </div>

                <div className="hidden shrink-0 text-right lg:block">
                    <p className="text-sm text-muted-foreground">
                        Plafon Rekomendasi
                    </p>

                    <h1 className="text-2xl font-bold lg:text-3xl xl:text-4xl">
                        Rp {recommended_limit?.toLocaleString("id-ID") ?? "-"}
                    </h1>
                </div>
            </div>

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
                    <p className={`w-fit rounded-full px-4 py-2 text-xs sm:text-sm ${getStatusStyle(safeStatus)}`}>
                        {safeStatus}
                    </p>

                    <p className="text-sm text-muted-foreground">
                        Berdasarkan skor {score ?? "-"} - Band {band ?? "-"} ({bandRange ?? "-"}) - posisi {calibratedPosition}.
                    </p>
                </div>
            </div>

            <div className="hidden lg:flex lg:items-center lg:justify-between lg:gap-6">
                <p className={`w-fit shrink-0 rounded-full px-4 py-2 text-sm ${getStatusStyle(safeStatus)}`}>
                    {safeStatus}
                </p>

                <p className="max-w-xl text-right text-sm text-muted-foreground">
                    Berdasarkan skor {score ?? "-"} - Band {band ?? "-"} ({bandRange ?? "-"}) - posisi {calibratedPosition}.
                </p>
            </div>
        </header>
    )
}
