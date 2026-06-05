import type { RiskProfile } from "@/lib/risk-profile"

type SimilarDebiturListProps = {
    profiles: RiskProfile[]
}

export default function SimilarDebiturList({
    profiles,
}: SimilarDebiturListProps) {
    if (profiles.length === 0) {
        return null
    }

    return (
        <section className="border-b p-4 lg:p-8 space-y-4">
            <h1 className="text-lg sm:text-xl font-bold">
                Debitur Serupa
            </h1>
            <div className="grid gap-3 md:grid-cols-3">
                {profiles.map((item) => (
                    <div
                        key={item.id}
                        className="rounded-xl border p-4"
                    >
                        <h2 className="font-semibold">
                            {item.name}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Skor {item.score} - {item.riskLabel}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Rp {item.limit.toLocaleString("id-ID")}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    )
}
