import DataSources from "./data-sources"
import BreakdownList from "./breakdown-list"
import type { BreakdownItem, DataSourceItem } from "@/lib/risk-profile"

type CBProps = {
    dataSources: DataSourceItem[]
    breakdown: BreakdownItem[]
    loading?: boolean
}

export default function ContributionBreakdown({
    dataSources,
    breakdown,
    loading = false
}: CBProps) {

    return (
        <div className="overflow-hidden p-4 lg:p-8 space-y-8">

            {/* sumber data */}
            <DataSources
                dataSources={dataSources}
                loading={loading}
            />

            {/* breakdown list */}
            <BreakdownList
                breakdown={breakdown}
                loading={loading}
            />

        </div>
    )
}
