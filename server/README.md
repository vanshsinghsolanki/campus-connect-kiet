# Campus Connect API (Phase 2 foundation)

This folder adds a read-only profile API while the existing GitHub Pages front end continues to use its sample data. No accounts, write endpoints, or production deployment are enabled yet.

## Requirements

- Node.js 20.19 or newer
- MongoDB, local or hosted
- npm

## Run locally

From this folder:

1. Copy `.env.example` to `.env` and set `MONGODB_URI`.
2. Install dependencies with `npm install`.
3. Import the existing sample profiles with `npm run seed`.
4. Start the API with `npm run dev`.

The API listens on `http://localhost:4000` by default. Do not commit `.env` or place a production database URI in source control.

## Endpoints

- `GET /api/v1/health/live` — process liveness.
- `GET /api/v1/health/ready` — readiness; returns 503 when MongoDB is disconnected.
- `GET /api/v1/profiles` — public profile search and filtering.
- `GET /api/v1/profiles/:id` — one public profile.

List query parameters: `q`, `department`, `role`, `verification`, `batch`, `skill`, `page` and `limit`. Page size is capped at 50. Search input is escaped before it reaches MongoDB. Responses exclude email addresses and database metadata.

Example:

```sh
curl "http://localhost:4000/api/v1/profiles?department=CSE&role=alumni&q=backend&page=1&limit=10"
```

The list response has a `data` array and `pagination` metadata. Invalid query values return a structured 400 response with an `X-Request-ID`.

## Browser access and deployment

Set `ALLOWED_ORIGINS` to a comma-separated list of exact browser origins (scheme and host, no path). Keep the list narrow. The API is not hosted by GitHub Pages; deploy this Node service to a Node-capable host and provide `MONGODB_URI` as a secret there. Use HTTPS in production.

The current API has read-only routes by design. Do not add public profile writes or real authentication until authorization, account ownership, verification and privacy requirements are designed.
