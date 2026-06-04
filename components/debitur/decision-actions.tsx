type DecisionActionsProps = {
    onReview: () => void
    onDecline: () => void
    onApprove: () => void
}

export default function DecisionActions({
  onReview,
  onDecline,
  onApprove,
}: DecisionActionsProps) {

  return (
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end lg:w-fit">

        <button
            onClick={onDecline}
            className="cursor-pointer rounded-lg border border-red-200 bg-red-50 px-5 py-3 font-medium text-red-600 transition hover:bg-red-100"
        >
            Decline
        </button>

        <button
            onClick={onReview}
            className="cursor-pointer rounded-lg border px-5 py-3 font-medium transition hover:bg-muted"
        >
            Review
        </button>

        <button
            onClick={onApprove}
            className="cursor-pointer rounded-lg bg-green-accent px-5 py-3 font-medium text-white transition hover:brightness-95"
        >
            Approve
        </button>

        </div>
    )
}
