# API reference

Base URL: `http://localhost:5000`

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | API health check |
| GET | `/api/complaints` | List reports |
| GET | `/api/complaints?status=Pending` | Filter by status |
| GET | `/api/complaints?worker=Ravi` | Filter by assigned worker |
| POST | `/api/complaints` | Create report (multipart form data) |
| PATCH | `/api/complaints/:id` | Update status, priority, or assigned worker |
| GET | `/api/analytics` | Summary counts and category totals |

## Create complaint

Send `multipart/form-data` with:
- `reporterName` (required)
- `location` (required)
- `description` (required)
- `category` (optional; blank lets the classifier label it)
- `image` (required; JPG, PNG, WEBP; max 5 MB)

## Update complaint

Example JSON:
```json
{
  "status": "In Progress",
  "priority": "High",
  "assignedWorker": "Ravi"
}
```
