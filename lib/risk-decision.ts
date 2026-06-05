export type DecisionState = "pending" | "approved" | "rejected" | "revision"

export function getDecisionState(status?: string): DecisionState {
  const normalized = status?.toLowerCase().trim() ?? ""

  if (normalized.includes("approved") || normalized.includes("diterima")) {
    return "approved"
  }

  if (normalized.includes("rejected") || normalized.includes("ditolak")) {
    return "rejected"
  }

  if (
    normalized.includes("revision") ||
    normalized.includes("revisi") ||
    normalized.includes("plafon")
  ) {
    return "revision"
  }

  return "pending"
}

export function isDecisionFinal(status?: string) {
  return getDecisionState(status) !== "pending"
}

export function getDecisionDisplay(status?: string) {
  const state = getDecisionState(status)
  const displays = {
    pending: {
      title: "Menunggu keputusan analis",
      description: "Pengajuan masih berada dalam tahap review.",
      className: "bg-blue-card text-blue-card-txt",
      borderClassName: "border-blue-card",
    },
    approved: {
      title: "Pengajuan diterima",
      description: "Rekomendasi approval telah dicatat untuk proses lanjutan.",
      className: "bg-light-green-accent text-green-accent",
      borderClassName: "border-green-accent/30",
    },
    rejected: {
      title: "Pengajuan ditolak",
      description: "Rekomendasi penolakan telah dicatat oleh analis.",
      className: "bg-light-red-accent text-red-accent",
      borderClassName: "border-red-200",
    },
    revision: {
      title: "Revisi plafon sedang diajukan",
      description: "Pengajuan menunggu tindak lanjut atas plafon yang direvisi.",
      className: "bg-light-yellowish-accent text-yellowish-accent",
      borderClassName: "border-yellow-200",
    },
  } satisfies Record<
    DecisionState,
    {
      title: string
      description: string
      className: string
      borderClassName: string
    }
  >

  return displays[state]
}

export function getStatusStyle(status: string) {
  const state = getDecisionState(status)

  if (state === "approved") {
    return "bg-light-green-accent text-green-accent"
  }

  if (state === "rejected") {
    return "bg-light-red-accent text-red-accent"
  }

  if (state === "revision") {
    return "bg-light-yellowish-accent text-yellowish-accent"
  }

  return "bg-blue-card text-blue-card-txt"
}

export function getRiskColor(riskLevel: string) {
  if (riskLevel === "Low Risk") return "bg-green-accent"
  if (riskLevel === "Medium Risk") return "bg-yellowish-accent"
  return "bg-red-accent"
}
