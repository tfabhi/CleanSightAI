const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const COMPLAINTS_FILE = path.join(DATA_DIR, "complaints.json");

function ensureStorage() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(COMPLAINTS_FILE)) {
    fs.writeFileSync(COMPLAINTS_FILE, "[]\n", "utf8");
  }
}

function readComplaints() {
  ensureStorage();
  try {
    return JSON.parse(fs.readFileSync(COMPLAINTS_FILE, "utf8"));
  } catch {
    return [];
  }
}

function writeComplaints(items) {
  ensureStorage();
  const tempFile = COMPLAINTS_FILE + ".tmp.json";
  fs.writeFileSync(tempFile, JSON.stringify(items, null, 2) + "\n", "utf8");
  fs.renameSync(tempFile, COMPLAINTS_FILE);
}

module.exports = { readComplaints, writeComplaints };
