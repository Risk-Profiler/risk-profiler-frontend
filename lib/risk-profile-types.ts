export type RiskFormInput = {
  name: string
  merchant_id: string
  business_category: string
  business_age_months: number
  qris_volume_monthly: number
  qris_active_days: number
  ecommerce_rating: number
  pln_delay_days: number
  pdam_bill_avg: number
  pdam_late_payments: number
}

export type BackendPredictionResponse = {
  score?: number
  score_percentile?: number
  risk_level?: string
  recommended_limit?: number
  peer_comparison_used?: boolean
  probability?: number
  class_probabilities?: Record<string, number>
  confidence?: string
  band?: string
  band_range?: string
  explanation?: string
  ai_explanation?: string
  shap_drivers?: Partial<ShapDriver>[]
  contributions?: Partial<ContributionItem>[]
  breakdown?: Partial<BreakdownItem>[]
  data_sources?: Partial<DataSourceItem>[]
  recommendations?: string[]
}

export type RawBackendPredictionResponse =
  | BackendPredictionResponse
  | {
      status?: string
      data?: {
        merchant_id?: string
        prediction?: BackendPredictionResponse
      }
    }

export type BreakdownItem = {
  id: number
  title: string
  points: string
  weight: string
  color: string
  description: string
}

export type ContributionItem = {
  id: number
  label: string
  value: number
  impact: number
  color: string
}

export type DataSourceItem = {
  id: number
  label: string
  available: boolean
}

export type ShapDriver = {
  id: number
  feature: string
  label: string
  role: "supporting" | "balancing"
  strength: number
  value: string
  description: string
}

export type RiskProfile = {
  id: string
  name: string
  owner: string
  category: string
  score: number
  risk: string
  riskLabel: string
  probability: number
  scorePercentile: number
  confidence: string
  limit: number
  recommended_limit: number
  band: string
  bandRange: string
  status: string
  createdAt: string
  decisionNote?: string
  revisionLimit?: number
  peerComparisonUsed?: boolean
  input: RiskFormInput
  breakdown: BreakdownItem[]
  contributions: ContributionItem[]
  dataSources: DataSourceItem[]
  recommendations: string[]
  aiExplanation: string
  shapDrivers: ShapDriver[]
}
