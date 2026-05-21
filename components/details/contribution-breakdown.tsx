import DataSources from "./data-sources"
import BreakdownList from "./breakdown-list"

type CBProps = {
    loading?: boolean
}

export default function ContributionBreakdown({
    loading = false
}: CBProps) {

    return (
        <div className="overflow-hidden p-4 lg:p-8 space-y-8">

            {/* sumber data */}
            <DataSources
                loading={loading}
            />

            {/* breakdown list */}
            <BreakdownList
                loading={loading}
            />

        </div>
    )
}