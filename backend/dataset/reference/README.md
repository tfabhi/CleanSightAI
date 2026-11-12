# Reference images

Add your own labelled reference images to this folder. Then list each filename and its category in `../data/labels.json`.

Supported formats: JPG, PNG, WEBP.

Example:
```json
[
  { "file": "plastic-bottles.jpg", "label": "Plastic Waste" },
  { "file": "dry-leaves.jpg", "label": "Organic Waste" }
]
```

No sample images are included, so classification returns `Unknown` until reference images are added.
