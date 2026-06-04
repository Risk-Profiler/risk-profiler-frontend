import {
  normalizeBackendPrediction,
  type BackendPredictionResponse,
  type RawBackendPredictionResponse,
  type RiskFormInput,
} from "./risk-profile"

const DEFAULT_API_BASE_URL = "http://127.0.0.1:8000"
const REQUEST_TIMEOUT_MS = 12000

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message)
    this.name = "ApiError"
  }
}

function getApiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_RISK_API_URL?.replace(/\/$/, "") ??
    DEFAULT_API_BASE_URL
  )
}

function withTimeout(timeoutMs: number) {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs)

  return {
    signal: controller.signal,
    clear: () => window.clearTimeout(timeoutId),
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function assertPredictionResponse(
  value: unknown
): asserts value is RawBackendPredictionResponse {
  if (!isRecord(value)) {
    throw new ApiError("Backend response is not valid JSON object")
  }

  const nestedPrediction = isRecord(value.data)
    ? value.data.prediction
    : undefined
  const hasDirectPrediction =
    "risk_level" in value ||
    "score" in value ||
    "probability" in value ||
    "explanation" in value ||
    "recommended_limit" in value

  if (!hasDirectPrediction && !isRecord(nestedPrediction)) {
    throw new ApiError("Backend response does not include prediction data")
  }
}

export async function requestRiskPrediction(
  payload: RiskFormInput
): Promise<BackendPredictionResponse> {
  const timeout = withTimeout(REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(`${getApiBaseUrl()}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: timeout.signal,
    })

    if (!response.ok) {
      throw new ApiError("Prediction request failed", response.status)
    }

    const rawResult: unknown = await response.json()
    assertPredictionResponse(rawResult)

    return normalizeBackendPrediction(rawResult)
  } finally {
    timeout.clear()
  }
}
