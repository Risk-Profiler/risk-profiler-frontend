import { gaugeCategories } from "@/lib/gauges"

type GaugeData = {
    score: number | undefined
}

export default function ScoreGauge({ score }: GaugeData) {
    const safeScore = score ?? 0

    return (
        <div className="overflow-hidden">
            <div className="relative">
                <div className="flex h-6 overflow-hidden rounded-full sm:h-8">
                    <div className="w-1/4 bg-very-low-score" />
                    <div className="w-1/4 bg-medium-score" />
                    <div className="w-1/4 bg-good-score" />
                    <div className="w-1/4 bg-very-good-score" />
                </div>

                {/* marker */}
                <div
                    className="absolute top-6 -translate-x-1/2 sm:top-8"
                    style={{ left: `${safeScore}%` }}
                >
                    <div className="mx-auto h-5 w-[2px] bg-black sm:h-6" />
                    <div className="mx-auto h-2 w-2 rounded-full bg-black" />

                    <p className="mt-1 text-center text-xs sm:text-sm">
                        {score ?? "-"}
                    </p>
                </div>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-3 sm:mt-18 sm:grid-cols-2 sm:gap-4">
                {gaugeCategories.map((category) => (
                    <div
                        key={category.id}
                        className="flex min-w-0 items-center gap-2"
                    >
                        <div
                            className={`${category.color} h-2 w-2 shrink-0 rounded-full`}
                        />

                        <div className="min-w-0 text-xs sm:text-sm">
                            <h1 className="break-words">{category.range}</h1>

                            <p className="break-words text-muted-foreground">
                                {category.category}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <p className="mt-6 text-xs sm:text-sm text-muted-foreground">
                MicroScore v2.3 · 12.400 kasus · Akurasi 91.2%
            </p>
        </div>
    )
}