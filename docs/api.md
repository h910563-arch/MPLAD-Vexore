# API Reference

Base URL (local dev): `http://localhost:4000/api`

All responses are JSON. There is no authentication in this prototype.

---

### `GET /health`
Health check.

```json
{ "status": "ok", "service": "mplad-sentinel-backend" }
```

---

### `GET /projects`
List projects with optional search, filters and sorting. Every project includes
its live-computed `risk` object.

**Query parameters** (all optional):

| Param | Values | Description |
|---|---|---|
| `search` | string | Matches project name, district or project ID (case-insensitive) |
| `riskLevel` | `LOW` \| `MEDIUM` \| `HIGH` | Filter by risk level |
| `status` | `ONGOING` \| `COMPLETED` \| `DELAYED` \| `NOT_STARTED` | Filter by status |
| `district` | string | Exact district match |
| `projectType` | string | Exact project type match |
| `sort` | `highest-risk` \| `lowest-risk` \| `highest-cost` \| `lowest-progress` \| `most-delayed` | Default: `highest-risk` |

**Response**

```json
{
  "total": 63,
  "projects": [
    {
      "id": 42, "projectId": "MPLAD-00142", "projectName": "Community Hall",
      "projectType": "Community Hall", "district": "Ghaziabad", "cost": 48.4,
      "progressPercentage": 32, "expenditurePercentage": 85, "status": "DELAYED",
      "risk": { "riskScore": 94, "riskLevel": "HIGH", "reasons": [ ... ] }
    }
  ]
}
```

---

### `GET /projects/:id`
Full details for one project (by `projectId`, e.g. `MPLAD-00142`), including its
risk result. Returns `404` if not found.

---

### `GET /projects/high-risk?limit=8`
Medium and high risk projects, sorted by risk score descending. `limit` is
optional (default 8).

---

### `GET /projects/:id/risk`
Just the risk result for one project:

```json
{
  "projectId": "MPLAD-00142",
  "riskScore": 94,
  "riskLevel": "HIGH",
  "reasons": [
    {
      "type": "COST", "severity": "HIGH",
      "message": "Project cost is 87% higher than comparable community hall projects.",
      "score": 30,
      "data": { "projectCost": "₹48.4L", "comparableMedian": "₹25.9L", "deviation": "87%" }
    }
  ],
  "breakdown": [
    { "type": "COST", "label": "Cost anomaly", "score": 30 }
  ]
}
```

---

### `GET /projects/:id/similar`
Potentially similar/duplicate projects nearby (same type, within 5 km).

```json
{
  "similar": [
    { "projectId": "MPLAD-00144", "projectName": "Community Hall", "district": "Ghaziabad",
      "cost": 20, "distanceKm": 2.8, "similarity": 74 }
  ]
}
```

---

### `GET /projects/filters`
Distinct values for building filter dropdowns.

```json
{ "districts": ["Bhopal", "Coimbatore", ...], "projectTypes": [...], "statuses": [...] }
```

---

### `GET /dashboard/stats`
```json
{ "totalProjects": 63, "totalFundsLakh": 1267, "completed": 31, "delayed": 9, "highRisk": 2 }
```

### `GET /dashboard/risk-distribution`
```json
[{ "level": "LOW", "count": 54 }, { "level": "MEDIUM", "count": 7 }, { "level": "HIGH", "count": 2 }]
```

### `GET /dashboard/status-distribution`
```json
[{ "status": "COMPLETED", "count": 31 }, { "status": "ONGOING", "count": 23 }, { "status": "DELAYED", "count": 9 }]
```

### `GET /dashboard/district-distribution`
```json
[{ "district": "Lucknow", "count": 9 }, ...]
```

### `GET /dashboard/expenditure-vs-progress`
```json
[{ "projectId": "MPLAD-00101", "projectName": "Road Construction", "progress": 85, "expenditure": 78 }, ...]
```

---

### `GET /analytics/summary`
Aggregate data for the Analytics page: average cost by project type, average
progress by district, anomaly counts by category, plus the risk and status
distributions above, all in one call.
