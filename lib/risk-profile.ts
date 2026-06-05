import type {
  BackendPredictionResponse,
  BreakdownItem,
  ContributionItem,
  DataSourceItem,
  RawBackendPredictionResponse,
  RiskFormInput,
  RiskProfile,
  ShapDriver,
} from "./risk-profile-types"

export type {
  BackendPredictionResponse,
  BreakdownItem,
  ContributionItem,
  DataSourceItem,
  RawBackendPredictionResponse,
  RiskFormInput,
  RiskProfile,
  ShapDriver,
} from "./risk-profile-types"
export {
  getDecisionDisplay,
  getDecisionState,
  getRiskColor,
  getStatusStyle,
  isDecisionFinal,
  type DecisionState,
} from "./risk-decision"

const clamp = (value: number, min = 0, max = 100) =>
  Math.min(max, Math.max(min, value))

const cleanModelText = (value: string) =>
  value
    .replace(/\s?\(pengaruh [^)]+\)/gi, "")
    .replace(/,\s?pengaruh [+-]?\d+(\.\d+)?/gi, "")
    .replace(/dengan kekuatan pengaruh [+-]?\d+(\.\d+)?/gi, "dalam keputusan model")
    .replace(/\bSHAP\b/gi, "pengaruh model")
    .replace(/\bdriver\b/gi, "faktor")
    .replace(/\bbackend\b/gi, "sistem")
    .replace(/\bkalkulasi frontend\b/gi, "analisis aplikasi")
    .replace(/\bSkor ML\b/gi, "Skor model")
    .replace(/\bprobabilitas kelas\b/gi, "tingkat keyakinan")

const limitRecommendationText = (limit: number, peerComparisonUsed: boolean) => {
  const basis = peerComparisonUsed
    ? "dari profil pembanding serupa"
    : "berdasarkan skor, kapasitas transaksi, dan faktor risiko merchant"

  return `Plafon rekomendasi ${basis}: Rp ${limit.toLocaleString("id-ID")}.`
}

const normalizeRecommendationText = (
  value: string,
  limit: number,
  peerComparisonUsed: boolean
) => {
  const cleaned = cleanModelText(value)

  if (/^Plafon rekomendasi /i.test(cleaned)) {
    return limitRecommendationText(limit, peerComparisonUsed)
  }

  return cleaned
}

const roundTo = (value: number, step: number) =>
  Math.round(value / step) * step

const featureLabels: Record<string, string> = {
  business_age_months: "Usia Usaha",
  qris_volume_monthly: "Volume QRIS Bulanan",
  qris_active_days: "Hari Aktif QRIS",
  ecommerce_rating: "Rating E-Commerce",
  pln_delay_days: "Keterlambatan PLN",
  pdam_bill_avg: "Rata-rata Tagihan PDAM",
  pdam_late_payments: "Keterlambatan PDAM",
  volume_per_active_day: "Volume QRIS per Hari Aktif",
  volume_to_age_ratio: "Rasio Volume terhadap Usia Usaha",
  pln_delay_ratio: "Rasio Telat PLN terhadap Usia Usaha",
  chronic_pln_delay: "Indikasi Keterlambatan PLN Kronis",
  business_category_fashion: "Kategori Fashion",
  business_category_fnb: "Kategori F&B",
  business_category_jasa: "Kategori Jasa",
  business_category_retail: "Kategori Retail",
}

const isNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value)

const asNumber = (value: unknown, fallback: number) =>
  isNumber(value) ? value : fallback

function normalizeBackendContributions(
  contributions?: Partial<ContributionItem>[]
) {
  if (!Array.isArray(contributions) || contributions.length === 0) return null

  return contributions.map((item, index) => {
    const impact = asNumber(item.impact, 0)

    return {
      id: asNumber(item.id, index + 1),
      label: item.label ?? `Variabel ${index + 1}`,
      value: Math.round(clamp(asNumber(item.value, 0))),
      impact,
      color:
        item.color ??
        (impact >= 0 ? "bg-green-accent" : "bg-red-accent"),
    }
  })
}

function normalizeBackendBreakdown(breakdown?: Partial<BreakdownItem>[]) {
  if (!Array.isArray(breakdown) || breakdown.length === 0) return null

  return breakdown.map((item, index) => ({
    id: asNumber(item.id, index + 1),
    title: item.title ?? `Kategori ${index + 1}`,
    points: item.points ?? "-",
    weight: item.weight ?? "Bobot model",
    color: item.color ?? "bg-green-accent",
    description: cleanModelText(item.description ?? "Dikirim dari sistem scoring."),
  }))
}

function normalizeBackendDataSources(dataSources?: Partial<DataSourceItem>[]) {
  if (!Array.isArray(dataSources) || dataSources.length === 0) return null

  return dataSources.map((item, index) => ({
    id: asNumber(item.id, index + 1),
    label: item.label ?? `Sumber data ${index + 1}`,
    available: Boolean(item.available),
  }))
}

function normalizeBackendShapDrivers(drivers?: Partial<ShapDriver>[]) {
  if (!Array.isArray(drivers) || drivers.length === 0) return null

  return drivers.map((driver, index) => {
    const feature = driver.feature ?? `feature_${index + 1}`
    const role =
      driver.role === "balancing" || driver.role === "supporting"
        ? driver.role
        : index === drivers.length - 1
          ? "balancing"
          : "supporting"

    return {
      id: asNumber(driver.id, index + 1),
      feature,
      label: driver.label ?? featureLabels[feature] ?? feature,
      role,
      strength: Math.round(clamp(asNumber(driver.strength, 70))),
      value: driver.value ?? "-",
      description: cleanModelText(
        driver.description ?? driverDescription(feature, role)
      ),
    }
  })
}

export function normalizeBackendPrediction(
  response: RawBackendPredictionResponse
): BackendPredictionResponse {
  if ("data" in response && response.data?.prediction) {
    return response.data.prediction
  }

  return response as BackendPredictionResponse
}

export function normalizeRiskLevel(riskLevel?: string, score?: number) {
  const normalized = riskLevel?.toLowerCase().trim() ?? ""

  if (normalized.includes("low") || normalized.includes("rendah")) {
    return "Low Risk"
  }

  if (normalized.includes("medium") || normalized.includes("sedang")) {
    return "Medium Risk"
  }

  if (normalized.includes("high") || normalized.includes("tinggi")) {
    return "High Risk"
  }

  if ((score ?? 0) >= 70) {
    return "Low Risk"
  }

  if ((score ?? 0) >= 50) {
    return "Medium Risk"
  }

  return "High Risk"
}

export function getRiskLabel(riskLevel: string) {
  if (riskLevel === "Low Risk") return "Risiko Rendah"
  if (riskLevel === "Medium Risk") return "Risiko Sedang"
  return "Risiko Tinggi"
}

export function getBand(score: number) {
  if (score >= 85) return { band: "A", range: "85-100" }
  if (score >= 70) return { band: "B", range: "70-84" }
  if (score >= 55) return { band: "C", range: "55-69" }
  if (score >= 40) return { band: "D", range: "40-54" }
  return { band: "E", range: "0-39" }
}

function calculateScore(input: RiskFormInput, response: BackendPredictionResponse) {
  if (typeof response.score === "number") {
    return Math.round(clamp(response.score))
  }

  const riskLevel = normalizeRiskLevel(response.risk_level)
  const backendSignal =
    riskLevel === "Low Risk" ? 88 : riskLevel === "Medium Risk" ? 58 : 30

  const volumeScore = clamp(input.qris_volume_monthly / 100000)
  const activeDaysScore = clamp((input.qris_active_days / 30) * 100)
  const ageScore = clamp((input.business_age_months / 36) * 100)
  const disciplineScore = clamp(100 - input.pln_delay_days * 6)
  const pdamScore = clamp(100 - input.pdam_late_payments * 14)
  const digitalScore = clamp(input.ecommerce_rating * 20)
  const probability = typeof response.probability === "number" ? response.probability : 0.72

  const rawScore =
    volumeScore * 0.26 +
    activeDaysScore * 0.18 +
    ageScore * 0.14 +
    disciplineScore * 0.15 +
    pdamScore * 0.04 +
    digitalScore * 0.13 +
    backendSignal * 0.1

  const confidenceAdjustment = (probability - 0.5) * 8

  return Math.round(clamp(rawScore + confidenceAdjustment))
}

function calculateRecommendedLimit(input: RiskFormInput, score: number) {
  const band = getBand(score).band
  const ceilings: Record<string, number> = {
    A: 50000000,
    B: 30000000,
    C: 18000000,
    D: 9000000,
    E: 4000000,
  }
  const bandCeiling = ceilings[band] ?? 4000000

  const turnoverBased = input.qris_volume_monthly * (score >= 70 ? 0.35 : score >= 55 ? 0.25 : 0.15)
  const ageMultiplier = input.business_age_months >= 24 ? 1 : input.business_age_months >= 12 ? 0.85 : 0.65
  const disciplinePenalty = input.pln_delay_days > 14 ? 0.55 : input.pln_delay_days > 7 ? 0.75 : 1
  const pdamPenalty = input.pdam_late_payments > 3 ? 0.7 : input.pdam_late_payments > 1 ? 0.85 : 1

  return Math.max(
    1000000,
    roundTo(Math.min(bandCeiling, turnoverBased * ageMultiplier * disciplinePenalty * pdamPenalty), 500000)
  )
}

function calculateConfidence(probability: number) {
  if (probability >= 0.8) return "Tinggi"
  if (probability >= 0.6) return "Sedang"
  return "Perlu Review"
}

function buildBreakdown(input: RiskFormInput, score: number): BreakdownItem[] {
  const cashflow = clamp(
    input.qris_volume_monthly / 125000 +
      (input.qris_active_days / 30) * 35 +
      (input.business_age_months / 36) * 15
  )
  const utility = clamp(100 - input.pln_delay_days * 6)
  const pdam = clamp(100 - input.pdam_late_payments * 14)
  const digital = clamp(input.ecommerce_rating * 20)
  const age = clamp((input.business_age_months / 36) * 100)
  const riskSignal = clamp(score)

  const items = [
    {
      title: "Stabilitas Arus Kas",
      score: cashflow,
      max: 50,
      weight: "Bobot 40%",
      description: "Diukur dari volume QRIS, konsistensi hari aktif, dan usia usaha.",
    },
    {
      title: "Kedisiplinan Utilitas",
      score: utility * 0.72 + pdam * 0.28,
      max: 20,
      weight: "Bobot 20%",
      description: "Mengikuti pola kedisiplinan pembayaran PLN dan PDAM.",
    },
    {
      title: "Kredibilitas Digital",
      score: digital,
      max: 15,
      weight: "Bobot 15%",
      description: "Berdasarkan rating e-commerce sebagai sinyal reputasi operasional.",
    },
    {
      title: "Ketahanan Usaha",
      score: age,
      max: 10,
      weight: "Bobot 10%",
      description: "Usaha yang lebih lama berjalan dianggap memiliki stabilitas lebih baik.",
    },
    {
      title: "Sinyal Model Risiko",
      score: riskSignal,
      max: 5,
      weight: "Bobot 15%",
      description: "Diringkas dari probabilitas model dan faktor prediksi teratas.",
    },
  ]

  return items.map((item, index) => {
    const points = Math.round((item.score / 100) * item.max)

    return {
      id: index + 1,
      title: item.title,
      points: `${points}/${item.max} pts`,
      weight: item.weight,
      color:
        item.score >= 70
          ? "bg-green-accent"
          : item.score >= 50
            ? "bg-yellowish-accent"
            : "bg-red-accent",
      description: item.description,
    }
  })
}

function buildContributions(input: RiskFormInput, score: number): ContributionItem[] {
  const volumePerActiveDay = input.qris_volume_monthly / (input.qris_active_days + 1)
  const volumeToAgeRatio = input.qris_volume_monthly / (input.business_age_months + 1)
  const plnDelayRatio = input.pln_delay_days / (input.business_age_months + 1)

  const values = [
    {
      label: "qris_volume_monthly",
      value: clamp(input.qris_volume_monthly / 100000),
      impact: Math.round(clamp(input.qris_volume_monthly / 250000)),
    },
    {
      label: "qris_active_days",
      value: clamp((input.qris_active_days / 30) * 100),
      impact: Math.round((input.qris_active_days / 30) * 18),
    },
    {
      label: "volume_per_active_day",
      value: clamp(volumePerActiveDay / 250000),
      impact: Math.round(clamp(volumePerActiveDay / 400000, 0, 18)),
    },
    {
      label: "ecommerce_rating",
      value: clamp(input.ecommerce_rating * 20),
      impact: Math.round(input.ecommerce_rating * 3),
    },
    {
      label: "pln_delay_ratio",
      value: clamp(100 - plnDelayRatio * 160),
      impact: Math.round(clamp(18 - plnDelayRatio * 140, -22, 18)),
    },
    {
      label: "pdam_late_payments",
      value: clamp(100 - input.pdam_late_payments * 14),
      impact: Math.round(clamp(12 - input.pdam_late_payments * 5, -18, 12)),
    },
    {
      label: "volume_to_age_ratio",
      value: clamp(volumeToAgeRatio / 250000),
      impact: Math.round(clamp(volumeToAgeRatio / 550000, 0, 14)),
    },
    {
      label: "pln_delay_days",
      value: clamp(100 - input.pln_delay_days * 6),
      impact: Math.round(clamp(20 - input.pln_delay_days * 2, -20, 20)),
    },
    {
      label: "business_age_months",
      value: clamp((input.business_age_months / 36) * 100),
      impact: Math.round(clamp(input.business_age_months / 3, 0, 12)),
    },
  ]

  return values.map((item, index) => ({
    id: index + 1,
    label: featureLabels[item.label] ?? item.label,
    value: Math.round(item.value),
    impact: item.impact,
    color: item.impact >= 0 && score >= 50 ? "bg-green-accent" : "bg-red-accent",
  }))
}

function buildDataSources(input: RiskFormInput): DataSourceItem[] {
  return [
    {
      id: 1,
      label: `QRIS - ${input.qris_active_days} hari aktif`,
      available: input.qris_volume_monthly > 0 && input.qris_active_days > 0,
    },
    {
      id: 2,
      label: `Utilitas PLN - telat ${input.pln_delay_days} hari`,
      available: input.pln_delay_days >= 0,
    },
    {
      id: 3,
      label: `E-Commerce - rating ${input.ecommerce_rating.toFixed(1)}`,
      available: input.ecommerce_rating > 0,
    },
    {
      id: 4,
      label: `Profil usaha - ${input.business_age_months} bulan`,
      available: input.business_age_months > 0,
    },
    {
      id: 5,
      label: `PDAM - ${input.pdam_late_payments} kali telat`,
      available: input.pdam_bill_avg >= 0,
    },
  ]
}

function featureValue(input: RiskFormInput, feature: string) {
  const volumePerActiveDay = input.qris_volume_monthly / (input.qris_active_days + 1)
  const volumeToAgeRatio = input.qris_volume_monthly / (input.business_age_months + 1)
  const plnDelayRatio = input.pln_delay_days / (input.business_age_months + 1)

  const values: Record<string, string> = {
    business_age_months: `${input.business_age_months} bulan`,
    qris_volume_monthly: `Rp ${input.qris_volume_monthly.toLocaleString("id-ID")}`,
    qris_active_days: `${input.qris_active_days} hari`,
    ecommerce_rating: input.ecommerce_rating.toFixed(1),
    pln_delay_days: `${input.pln_delay_days} hari`,
    pdam_bill_avg: `Rp ${input.pdam_bill_avg.toLocaleString("id-ID")}`,
    pdam_late_payments: `${input.pdam_late_payments} kali`,
    volume_per_active_day: `Rp ${Math.round(volumePerActiveDay).toLocaleString("id-ID")}`,
    volume_to_age_ratio: `Rp ${Math.round(volumeToAgeRatio).toLocaleString("id-ID")}`,
    pln_delay_ratio: plnDelayRatio.toFixed(2),
    chronic_pln_delay: input.pln_delay_days > 14 ? "Ya" : "Tidak",
    business_category_fashion: input.business_category === "fashion" ? "Aktif" : "Tidak",
    business_category_fnb: input.business_category === "fnb" ? "Aktif" : "Tidak",
    business_category_jasa: input.business_category === "jasa" ? "Aktif" : "Tidak",
    business_category_retail: input.business_category === "retail" ? "Aktif" : "Tidak",
  }

  return values[feature] ?? "-"
}

function driverDescription(feature: string, role: ShapDriver["role"]) {
  const label = featureLabels[feature] ?? feature
  const direction = role === "supporting" ? "mendorong kelas prediksi model" : "menahan kekuatan prediksi model"

  return `${label} ${direction} berdasarkan pola analisis model.`
}

function extractBackendShapFeatures(explanation?: string) {
  if (!explanation) return []
  const matches = [...explanation.matchAll(/'([^']+)'/g)]
  return matches.map((match) => match[1]).filter(Boolean)
}

function buildShapDrivers(input: RiskFormInput, response: BackendPredictionResponse, score: number): ShapDriver[] {
  const backendFeatures = extractBackendShapFeatures(response.explanation)
  const fallbackFeatures = [
    input.pln_delay_days > 7 ? "pln_delay_ratio" : "volume_per_active_day",
    input.pdam_late_payments > 1 ? "pdam_late_payments" : "qris_active_days",
    input.ecommerce_rating >= 4 ? "ecommerce_rating" : "business_age_months",
  ]
  const features = backendFeatures.length >= 3 ? backendFeatures : fallbackFeatures

  return features.slice(0, 3).map((feature, index) => {
    const role = index === 2 ? "balancing" : "supporting"
    const baseStrength = role === "supporting" ? 86 - index * 12 : 48

    return {
      id: index + 1,
      feature,
      label: featureLabels[feature] ?? feature,
      role,
      strength: Math.round(clamp(baseStrength + (score - 50) * 0.12)),
      value: featureValue(input, feature),
      description: driverDescription(feature, role),
    }
  })
}

function buildAiExplanation(
  input: RiskFormInput,
  response: BackendPredictionResponse,
  riskLevel: string,
  score: number,
  drivers: ShapDriver[]
) {
  if (response.ai_explanation) return response.ai_explanation
  if (response.explanation) return response.explanation

  const supporting = drivers.filter((driver) => driver.role === "supporting")
  const balancing = drivers.find((driver) => driver.role === "balancing")

  return `Sistem mengklasifikasikan merchant ${input.merchant_id} sebagai ${riskLevel}, terutama dipengaruhi oleh ${supporting[0]?.label ?? "Volume QRIS Bulanan"} dan ${supporting[1]?.label ?? "Hari Aktif QRIS"}. Faktor ${balancing?.label ?? "Usia Usaha"} menjadi penyeimbang kekuatan prediksi. Skor analisis saat ini ${score}/100.`
}

function buildRecommendations(
  riskLevel: string,
  limit: number,
  score: number,
  band: string,
  drivers: ShapDriver[],
  peerComparisonUsed: boolean
) {
  const topDriver = drivers[0]
  const balancingDriver = drivers.find((driver) => driver.role === "balancing")

  if (riskLevel === "Low Risk") {
    return [
      "Layak untuk pembiayaan dengan proses approval normal.",
      `Profil risiko rendah - Band ${band} dengan skor ${score}/100.`,
      `Faktor utama: ${topDriver?.label ?? "stabilitas transaksi"} bernilai ${topDriver?.value ?? "baik"}.`,
      limitRecommendationText(limit, peerComparisonUsed),
    ]
  }

  if (riskLevel === "Medium Risk") {
    return [
      "Dapat dipertimbangkan dengan review analis dan limit konservatif.",
      `Profil risiko sedang - Band ${band} dengan skor ${score}/100.`,
      `Perhatikan faktor ${topDriver?.label ?? "utilitas/transaksi"} sebelum approval final.`,
      limitRecommendationText(limit, peerComparisonUsed),
    ]
  }

  return [
    "Tidak direkomendasikan untuk approval langsung.",
    `Profil risiko tinggi - Band ${band} dengan skor ${score}/100.`,
    `Faktor paling dominan: ${topDriver?.label ?? "keterlambatan utilitas"}; faktor penahan: ${balancingDriver?.label ?? "stabilitas usaha"}.`,
    limitRecommendationText(limit, peerComparisonUsed),
    "Minta dokumen tambahan sebelum approval final.",
  ]
}

export function createRiskProfile(
  input: RiskFormInput,
  response: BackendPredictionResponse,
  existingId?: string
): RiskProfile {
  const score = calculateScore(input, response)
  const risk = normalizeRiskLevel(response.risk_level, score)
  const riskLabel = getRiskLabel(risk)
  const bandData = getBand(score)
  const probability = typeof response.probability === "number" ? response.probability : 0.72
  const scorePercentile =
    typeof response.score_percentile === "number"
      ? response.score_percentile
      : score / 100
  const shapDrivers =
    normalizeBackendShapDrivers(response.shap_drivers) ??
    buildShapDrivers(input, response, score)
  const aiExplanation = buildAiExplanation(input, response, risk, score, shapDrivers)
  const limit =
    typeof response.recommended_limit === "number"
      ? response.recommended_limit
      : calculateRecommendedLimit(input, score)
  const peerComparisonUsed = response.peer_comparison_used === true

  return {
    id: existingId ?? `LA-2026-${Math.floor(Math.random() * 9000) + 1000}`,
    name: input.name,
    owner: "New Applicant",
    category: input.business_category,
    score,
    risk,
    riskLabel,
    probability,
    scorePercentile,
    confidence: response.confidence ?? calculateConfidence(probability),
    limit,
    recommended_limit: limit,
    band: response.band ?? bandData.band,
    bandRange: response.band_range ?? bandData.range,
    status: "Pending Review",
    createdAt: new Date().toISOString(),
    peerComparisonUsed,
    input,
    breakdown:
      normalizeBackendBreakdown(response.breakdown) ??
      buildBreakdown(input, score),
    contributions:
      normalizeBackendContributions(response.contributions) ??
      buildContributions(input, score),
    dataSources:
      normalizeBackendDataSources(response.data_sources) ??
      buildDataSources(input),
    recommendations:
      response.recommendations?.map((item) =>
        normalizeRecommendationText(item, limit, peerComparisonUsed)
      ) ??
      buildRecommendations(
        risk,
        limit,
        score,
        response.band ?? bandData.band,
        shapDrivers,
        peerComparisonUsed
      ),
    aiExplanation: cleanModelText(aiExplanation),
    shapDrivers,
  }
}

export function hydrateRiskProfile(profile: Partial<RiskProfile>): RiskProfile {
  const fallbackInput: RiskFormInput = {
    name: profile.name ?? "UMKM",
    merchant_id: "1",
    business_category: profile.category ?? "general",
    business_age_months: 12,
    qris_volume_monthly: Math.max(profile.limit ?? 5000000, 1000000),
    qris_active_days: 20,
    ecommerce_rating: 4,
    pln_delay_days: profile.risk === "High Risk" ? 12 : 2,
    pdam_bill_avg: 0,
    pdam_late_payments: profile.risk === "High Risk" ? 3 : 0,
  }
  const input: RiskFormInput = {
    ...fallbackInput,
    ...(profile.input ?? {}),
    merchant_id: String(profile.input?.merchant_id ?? fallbackInput.merchant_id),
    pdam_bill_avg: profile.input?.pdam_bill_avg ?? fallbackInput.pdam_bill_avg,
    pdam_late_payments: profile.input?.pdam_late_payments ?? fallbackInput.pdam_late_payments,
  }

  const generated = createRiskProfile(
    input,
    {
      score: profile.score,
      risk_level: profile.risk,
      recommended_limit: profile.limit ?? profile.recommended_limit,
      probability: profile.probability,
      score_percentile: profile.scorePercentile,
      band: profile.band,
    },
    profile.id
  )

  return {
    ...generated,
    ...profile,
    input,
    score: profile.score ?? generated.score,
    risk: normalizeRiskLevel(profile.risk, profile.score ?? generated.score),
    riskLabel: profile.riskLabel ?? getRiskLabel(normalizeRiskLevel(profile.risk, profile.score)),
    limit: profile.limit ?? profile.recommended_limit ?? generated.limit,
    recommended_limit: profile.recommended_limit ?? profile.limit ?? generated.limit,
    band: profile.band ?? generated.band,
    bandRange: profile.bandRange ?? generated.bandRange,
    breakdown: profile.breakdown ?? generated.breakdown,
    contributions: profile.contributions ?? generated.contributions,
    dataSources: profile.dataSources ?? generated.dataSources,
    peerComparisonUsed: profile.peerComparisonUsed ?? generated.peerComparisonUsed,
    recommendations: (profile.recommendations ?? generated.recommendations).map((item) =>
      normalizeRecommendationText(
        item,
        profile.limit ?? profile.recommended_limit ?? generated.limit,
        profile.peerComparisonUsed ?? generated.peerComparisonUsed ?? false
      )
    ),
    aiExplanation: cleanModelText(profile.aiExplanation ?? generated.aiExplanation),
    shapDrivers: (profile.shapDrivers ?? generated.shapDrivers).map((driver) => ({
      ...driver,
      description: cleanModelText(driver.description),
    })),
    confidence: profile.confidence ?? generated.confidence,
    scorePercentile: profile.scorePercentile ?? generated.scorePercentile,
    status: profile.status ?? "Pending Review",
    createdAt: profile.createdAt ?? generated.createdAt,
  }
}
