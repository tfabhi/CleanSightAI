const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const REFERENCE_DIR = path.join(__dirname, "..", "dataset", "reference");
const LABELS_FILE = path.join(__dirname, "..", "data", "labels.json");
const MAX_DISTANCE = 12; // lower means stricter matching

async function differenceHash(filePath) {
  const { data } = await sharp(filePath)
    .rotate()
    .resize(9, 8, { fit: "fill" })
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let hash = "";
  for (let y = 0; y < 8; y += 1) {
    for (let x = 0; x < 8; x += 1) {
      const left = data[y * 9 + x];
      const right = data[y * 9 + x + 1];
      hash += left > right ? "1" : "0";
    }
  }
  return hash;
}

function hammingDistance(a, b) {
  let distance = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i += 1) {
    if (a[i] !== b[i]) distance += 1;
  }
  return distance + Math.abs(a.length - b.length);
}

async function classifyImage(uploadPath) {
  let labels = [];
  try {
    labels = JSON.parse(fs.readFileSync(LABELS_FILE, "utf8"));
  } catch {
    labels = [];
  }

  if (!Array.isArray(labels) || labels.length === 0) {
    return {
      label: "Unknown",
      confidence: 0,
      method: "perceptual-hash-baseline",
      message: "No labelled reference images found. Add samples to backend/dataset/reference and backend/data/labels.json."
    };
  }

  const uploadHash = await differenceHash(uploadPath);
  let best = null;

  for (const sample of labels) {
    if (!sample.file || !sample.label) continue;
    const samplePath = path.resolve(REFERENCE_DIR, sample.file);
    if (!samplePath.startsWith(REFERENCE_DIR + path.sep) || !fs.existsSync(samplePath)) continue;

    try {
      const sampleHash = await differenceHash(samplePath);
      const distance = hammingDistance(uploadHash, sampleHash);
      if (!best || distance < best.distance) {
        best = { label: sample.label, distance, file: sample.file };
      }
    } catch {
      // Ignore unreadable reference images and continue.
    }
  }

  if (!best || best.distance > MAX_DISTANCE) {
    return {
      label: "Unknown",
      confidence: 0,
      method: "perceptual-hash-baseline",
      message: "No sufficiently similar reference image was found."
    };
  }

  const confidence = Math.max(0, Math.round((1 - best.distance / 64) * 100));
  return {
    label: best.label,
    confidence,
    method: "perceptual-hash-baseline",
    matchedReference: best.file,
    message: "Closest labelled reference image match. This is a similarity estimate, not an ML probability."
  };
}

module.exports = { classifyImage };
