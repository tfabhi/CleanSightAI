const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const { readComplaints, writeComplaints } = require("./storage");
const { classifyImage } = require("./ai-model");

const app = express();
const PORT = process.env.PORT || 5000;
const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(UPLOAD_DIR));

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `${Date.now()}-${uuidv4()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowedTypes.has(file.mimetype)) return cb(new Error("Only JPG, PNG, and WEBP images are allowed."));
    cb(null, true);
  }
});

app.get("/api/health", (_req, res) => res.json({ status: "ok", project: "CleanSight AI" }));

app.get("/api/complaints", (req, res) => {
  let items = readComplaints();
  if (req.query.status) items = items.filter(x => x.status === req.query.status);
  if (req.query.worker) items = items.filter(x => x.assignedWorker === req.query.worker);
  res.json(items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

app.post("/api/complaints", upload.single("image"), async (req, res, next) => {
  try {
    const { reporterName, location, description, category } = req.body;
    if (!reporterName || !location || !description) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "Name, location, and description are required." });
    }
    if (!req.file) return res.status(400).json({ message: "Please attach an image." });

    const classification = await classifyImage(req.file.path);
    const complaint = {
      id: uuidv4(),
      reporterName: reporterName.trim(),
      location: location.trim(),
      description: description.trim(),
      category: category || classification.label,
      classification,
      imageUrl: `/uploads/${req.file.filename}`,
      status: "Pending",
      priority: "Medium",
      assignedWorker: "",
      createdAt: new Date().toISOString()
    };

    const items = readComplaints();
    items.push(complaint);
    writeComplaints(items);
    res.status(201).json(complaint);
  } catch (error) {
    next(error);
  }
});

app.patch("/api/complaints/:id", (req, res) => {
  const allowed = ["status", "priority", "assignedWorker"];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  const validStatuses = ["Pending", "In Progress", "Resolved"];
  const validPriorities = ["Low", "Medium", "High"];
  if (updates.status && !validStatuses.includes(updates.status)) {
    return res.status(400).json({ message: "Invalid status." });
  }
  if (updates.priority && !validPriorities.includes(updates.priority)) {
    return res.status(400).json({ message: "Invalid priority." });
  }

  const items = readComplaints();
  const index = items.findIndex(x => x.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: "Complaint not found." });

  items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
  writeComplaints(items);
  res.json(items[index]);
});

app.get("/api/analytics", (_req, res) => {
  const items = readComplaints();
  res.json({
    total: items.length,
    pending: items.filter(x => x.status === "Pending").length,
    inProgress: items.filter(x => x.status === "In Progress").length,
    resolved: items.filter(x => x.status === "Resolved").length,
    byCategory: items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {})
  });
});

app.use((error, _req, res, _next) => {
  res.status(400).json({ message: error.message || "Request failed." });
});

app.listen(PORT, () => console.log(`CleanSight AI API running at http://localhost:${PORT}`));
