# ROCKSENSE

ROCKSENSE is a Next.js prototype for predictive open-pit mine slope safety, prepared for Smart India Hackathon 2025–26 (PS 25023). It is intentionally labeled as a prototype: all readings are deterministic synthetic data and there is no live IoT ingestion.

## Run

```bash
pnpm install
pnpm dev
```

Routes are represented by the primary navigation: Home, Dashboard, Uploads, Mine Map, and Reports. Uploads supports seven parameters and a CSV validation demo. Mine Map uses React Leaflet with OpenStreetMap tiles.

## Data contract

The client service layer in `lib/rocksense.ts` mirrors the future FastAPI surface:

- `POST /api/predict`
- `GET /api/history/{mine_id}`
- `GET /api/alerts/{mine_id}`
- `POST /api/upload-csv`

The next production step is to move these pure functions into a FastAPI `backend/` service and replace synthetic fixtures with PostgreSQL/TimescaleDB and an MQTT/IoT ingestion worker. The UI already keeps the model inputs and response shape isolated for that migration.

## Model notes

Factor of Safety is a deliberately isolated demonstration calculation, not a validated geotechnical design model. Thresholds are: LOW >= 1.35, INTERMEDIATE 1.00–1.34, and HIGH < 1.00. The risk score and feature importance are deterministic XGBoost-style demo outputs. LSGM is documented as an extension interface only; no invented LSGM formula is presented.

## Optional alerts

`.env.example` contains placeholders for a future Twilio integration. Twilio is not called by this prototype. For production, add a server-side alert worker with deduplication, rate limits, audit logging, and verified sender configuration.

## CSV format

```csv
slope_angle,bench_height,cohesion,friction_angle,density,pore_pressure,rainfall
38,18,42,31,22.4,24,18
```
