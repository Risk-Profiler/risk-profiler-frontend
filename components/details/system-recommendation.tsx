import SystemRecommendationSkeleton from "../skeletons/details/system-recommendation"
import { Check, CircleCheck } from "lucide-react"

type SystemRecommendationProps = {
    loading?: boolean
}

export default function SystemRecommendation({
    loading = false
}: SystemRecommendationProps) {
    if (loading) {
        return <SystemRecommendationSkeleton />
    }

    return (
        <div className="overflow-hidden border-y p-4 lg:p-8 space-y-6">
            {/* title */}
            <div>
                <h1 className="text-lg sm:text-xl font-bold">
                    Rekomendasi Sistem
                </h1>

                <p className="text-xs sm:text-sm text-muted-foreground">
                    MicroScore v2.3 · Dihasilkan otomatis
                </p>
            </div>

            <hr />

            {/* recommendations */}
            <div className="space-y-4 sm:px-4 lg:px-8">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2 min-w-0">
                        <CircleCheck
                            fill="green"
                            color="white"
                            className="shrink-0"
                        />

                        <h1 className="break-words text-base sm:text-lg">
                            Layak untuk pembiayaan
                        </h1>
                    </div>

                    <div className="w-fit rounded-full bg-light-green-accent px-3 py-2 text-xs text-green-accent">
                        Skor 78/100
                    </div>
                </div>

                <div className="flex items-start gap-2">
                    <CircleCheck
                        fill="green"
                        color="white"
                        className="mt-1 shrink-0"
                    />

                    <h1 className="break-words text-base sm:text-lg">
                        Profil risiko rendah — Band B (70–84)
                    </h1>
                </div>

                <div className="flex items-start gap-2">
                    <CircleCheck
                        fill="green"
                        color="white"
                        className="mt-1 shrink-0"
                    />

                    <h1 className="break-words text-base sm:text-lg">
                        Plafon optimal: Rp 25.000.000
                    </h1>
                </div>
            </div>

            <hr />

            {/* badges */}
            <div className="flex flex-wrap gap-3 py-2 text-xs sm:text-sm">
                <div className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-green-accent p-3 text-green-accent sm:w-fit sm:flex-1">
                    <Check size={16} className="shrink-0 sm:size-[18px]" />

                    <h1 className="text-center font-semibold break-words">
                        Data per Mar 2025
                    </h1>
                </div>

                <div className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-green-accent p-3 text-green-accent sm:w-fit sm:flex-1">
                    <Check size={16} className="shrink-0 sm:size-[18px]" />

                    <h1 className="text-center font-semibold break-words">
                        4 dari 5 sumber tersedia
                    </h1>
                </div>

                <div className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-green-accent p-3 text-green-accent sm:w-fit sm:flex-1">
                    <Check size={16} className="shrink-0 sm:size-[18px]" />

                    <h1 className="text-center font-semibold break-words">
                        Kepercayaan model: Tinggi
                    </h1>
                </div>

                <div className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-green-accent p-3 text-green-accent sm:w-fit sm:flex-1">
                    <Check size={16} className="shrink-0 sm:size-[18px]" />

                    <h1 className="text-center font-semibold break-words">
                        Top 28% debitur sejenis
                    </h1>
                </div>
            </div>

            <hr />

            {/* footer */}
            <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                Rekomendasi ini dihasilkan secara otomatis oleh MicroScore AI
                dan harus dikonfirmasi oleh analis sebelum dikirim ke komite
                kredit.
            </p>
        </div>
    )
    
}