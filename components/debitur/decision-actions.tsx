type DecisionActionsProps = {
    onReview: () => void
}

export default function DecisionActions({
  onReview
}: DecisionActionsProps) {

  return (
        <div className="mt-8 flex items-center justify-end gap-3">

        <button className="cursor-pointer rounded-xl border border-red-200 bg-red-50 px-5 py-3 font-medium text-red-600 transition hover:bg-red-100">
            Decline
        </button>

        <button
            onClick={onReview}
            className="cursor-pointer rounded-xl border px-5 py-3 font-medium transition hover:bg-muted"
        >
            Review
        </button>

        <button className="cursor-pointer rounded-xl bg-green-accent px-5 py-3 font-medium text-white transition hover:brightness-95">
            Approve
        </button>

        </div>
    )
}