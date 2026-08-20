export type RiskLevel = 'LOW' | 'INTERMEDIATE' | 'HIGH'
export type MineId = 'SINGRAULI' | 'JHARIA' | 'RANIGANJ' | 'BOKARO'

export type Parameters = {
  slopeAngle: number
  benchHeight: number
  cohesion: number
  frictionAngle: number
  density: number
  porePressure: number
  rainfall: number
}

export type Prediction = Parameters & { factorOfSafety: number; riskScore: number; risk: RiskLevel; timestamp: string }

export const inputFields = [
  ['slopeAngle', 'Slope angle', '°'], ['benchHeight', 'Bench height', 'm'], ['cohesion', 'Cohesion', 'kPa'],
  ['frictionAngle', 'Friction angle', '°'], ['density', 'Density', 'kN/m³'], ['porePressure', 'Pore pressure', 'kPa'], ['rainfall', 'Rainfall', 'mm'],
] as const

export const mines: { id: MineId; name: string; lat: number; lng: number; prediction: Prediction; alerts: string[] }[] = [
  { id: 'SINGRAULI', name: 'Singrauli Open Cast', lat: 24.19, lng: 82.67, prediction: { slopeAngle: 38, benchHeight: 18, cohesion: 42, frictionAngle: 31, density: 22.4, porePressure: 24, rainfall: 18, factorOfSafety: 1.62, riskScore: 28, risk: 'LOW', timestamp: '2026-08-20T09:30:00Z' }, alerts: [] },
  { id: 'JHARIA', name: 'Jharia Central Pit', lat: 23.74, lng: 86.42, prediction: { slopeAngle: 44, benchHeight: 22, cohesion: 31, frictionAngle: 27, density: 23.1, porePressure: 52, rainfall: 36, factorOfSafety: 1.18, riskScore: 67, risk: 'INTERMEDIATE', timestamp: '2026-08-20T08:48:00Z' }, alerts: ['Elevated pore pressure', 'Rainfall threshold crossed'] },
  { id: 'RANIGANJ', name: 'Raniganj East Block', lat: 23.62, lng: 87.13, prediction: { slopeAngle: 49, benchHeight: 25, cohesion: 22, frictionAngle: 24, density: 23.8, porePressure: 68, rainfall: 61, factorOfSafety: 0.91, riskScore: 91, risk: 'HIGH', timestamp: '2026-08-20T09:12:00Z' }, alerts: ['Critical FoS detected', 'Immediate inspection recommended'] },
  { id: 'BOKARO', name: 'Bokaro North Quarry', lat: 23.67, lng: 86.15, prediction: { slopeAngle: 41, benchHeight: 20, cohesion: 36, frictionAngle: 29, density: 22.9, porePressure: 41, rainfall: 29, factorOfSafety: 1.34, riskScore: 53, risk: 'INTERMEDIATE', timestamp: '2026-08-20T07:55:00Z' }, alerts: ['Monitor drainage line'] },
]

export function getRisk(fos: number): RiskLevel { return fos < 1 ? 'HIGH' : fos < 1.35 ? 'INTERMEDIATE' : 'LOW' }
export function calculateFoS(p: Parameters) {
  const base = (p.cohesion + p.density * p.benchHeight * Math.tan((p.frictionAngle * Math.PI) / 180)) / Math.max(1, p.density * p.benchHeight * Math.sin((p.slopeAngle * Math.PI) / 180))
  return Number(Math.max(0.45, Math.min(2.5, base * (1 - p.porePressure / 320) * (1 - p.rainfall / 900))).toFixed(2))
}
export function predict(p: Parameters): Prediction { const factorOfSafety = calculateFoS(p); const risk = getRisk(factorOfSafety); const riskScore = Math.round(Math.max(5, Math.min(99, 100 - factorOfSafety * 48 + p.rainfall * .25))); return { ...p, factorOfSafety, riskScore, risk, timestamp: new Date().toISOString() } }
export const featureImportance = [['Pore pressure', 0.31], ['Slope angle', 0.24], ['Rainfall', 0.18], ['Cohesion', 0.12], ['Friction angle', 0.08], ['Bench height', 0.05], ['Density', 0.02]]
export const history = [
  { day: 'Aug 18', fos: 1.46, score: 43 }, { day: 'Aug 19', fos: 1.29, score: 58 }, { day: 'Aug 20', fos: 1.18, score: 67 },
]
export function csvTemplate() { return `slope_angle,bench_height,cohesion,friction_angle,density,pore_pressure,rainfall\n38,18,42,31,22.4,24,18\n44,22,31,27,23.1,52,36` }
export function download(name: string, content: string, type = 'text/csv') { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([content], { type })); a.download = name; a.click(); URL.revokeObjectURL(a.href) }
export const riskClass = (risk: RiskLevel) => risk === 'HIGH' ? 'risk-high' : risk === 'INTERMEDIATE' ? 'risk-mid' : 'risk-low'
export const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
export const apiContract = { predict: 'POST /api/predict', history: 'GET /api/history/{mine_id}', alerts: 'GET /api/alerts/{mine_id}', csv: 'POST /api/upload-csv' }
