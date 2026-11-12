# CleanSight AI — Smart Public Cleanliness Tracker

A reconstructed, GitHub-ready prototype of CleanSight AI. It provides a citizen reporting interface, an authority/worker dashboard, image uploads, a basic image-similarity classifier, and persistent complaint records.

> **Important:** This is a recreated prototype based on the project description available in the conversation. It is not a recovered copy of the original project source code. The image classifier is a lightweight perceptual-hash nearest-neighbour baseline, not a trained AI/ML model.

## Features

- Submit a cleanliness complaint with an image, location, description, and category.
- Upload validation and image storage on the backend.
- Compare an uploaded image against labelled reference images using perceptual hashes.
- Save complaints in a local JSON file.
- View and filter reports in an authority dashboard.
- Update complaint status and assign a sanitation worker.
- Basic worker view showing assigned tasks.
- Responsive React interface.

## Project structure

```text
CleanSightAI/
├── frontend/                 # React + Vite application
├── backend/
│   ├── data/                 # JSON persistence and reference labels
│   ├── dataset/reference/    # Add labelled reference images here
│   ├── uploads/              # Uploaded complaint images (gitignored)
│   └── src/
│       ├── ai-model.js       # Perceptual-hash similarity baseline
│       ├── server.js         # Express API
│       └── storage.js        # JSON storage helpers
├── docs/
│   ├── API.md
│   └── FUNCTIONALITY.md
├── .gitignore
└── README.md
```

## Requirements

- Node.js 18.18+ (Node.js 20 LTS recommended)
- npm

## Run locally

Open two terminals.

### 1. Start the backend

```bash
cd backend
npm install
npm run dev
```

Backend runs at `http://localhost:5000`.

### 2. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal (normally `http://localhost:5173`).

The frontend uses `http://localhost:5000` by default. To change it, create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

## Add reference images for classification

1. Put reference images in `backend/dataset/reference/`.
2. Add entries to `backend/data/labels.json` using paths relative to that folder:

```json
[
  { "file": "plastic-bottles.jpg", "label": "Plastic Waste" },
  { "file": "organic-leaves.jpg", "label": "Organic Waste" },
  { "file": "paper-litter.jpg", "label": "Paper Waste" }
]
```

3. Restart the backend and submit a test image similar to one of the references.

The classifier converts images to a small grayscale image, computes a difference hash, and finds the closest labelled reference. It returns `Unknown` when there are no references or the nearest match is outside the configured threshold. Similarity matching is sensitive to image framing, lighting, and viewpoint; it is not a substitute for a trained model.

## Prototype roles

Use the role selector in the top navigation:
- **Citizen:** submit reports and view submitted complaints.
- **Authority:** view all reports, change status, and assign workers.
- **Worker:** view tasks assigned to the selected worker name.

There is no authentication in this demo. Role switching is for demonstrating the workflow only.

## Data and privacy

- Uploaded images are stored in `backend/uploads/`.
- Complaint data is stored in `backend/data/complaints.json`.
- These are local prototype stores, not production-grade storage.
- Do not upload real personal data, private images, API keys, or secrets to GitHub.
- The `.gitignore` excludes uploads, dependencies, environment files, and local logs.

## API quick reference

See [`docs/API.md`](docs/API.md).

## Current limitations

See [`docs/FUNCTIONALITY.md`](docs/FUNCTIONALITY.md) for a clear distinction between implemented prototype behaviour and simulated/planned features.
