import express from "express";
import cors from "cors";
import fs from "fs";

const app = express();
const PORT = 3001;
const DATA_FILE = "./foundlink-items.json";

app.use(cors());
app.use(express.json());

let items = [];

if (fs.existsSync(DATA_FILE)) {
  try {
    items = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    items = [];
  }
}

function saveItems() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2));
}

app.get("/", (req, res) => {
  res.send("FoundLink backend is running!");
});

app.get("/api/items", (req, res) => {
  res.json(items);
});

app.post("/api/items", (req, res) => {
  const { name, category, location, date, status, description } = req.body;

  if (!name || !category || !location || !date || !status) {
    return res.status(400).json({ message: "Please fill in all required fields." });
  }

  const newItem = {
    id: Date.now().toString(),
    name,
    category,
    location,
    date,
    status,
    description: description || "",
  };

  items.unshift(newItem);
  saveItems();

  res.status(201).json(newItem);
});

app.patch("/api/items/:id", (req, res) => {
  const item = items.find((item) => item.id === req.params.id);

  if (!item) {
    return res.status(404).json({ message: "Report not found." });
  }

  if (req.body.status) {
    item.status = req.body.status;
  }

  saveItems();
  res.json(item);
});

app.delete("/api/items/:id", (req, res) => {
  const oldLength = items.length;
  items = items.filter((item) => item.id !== req.params.id);

  if (items.length === oldLength) {
    return res.status(404).json({ message: "Report not found." });
  }

  saveItems();
  res.json({ message: "Report deleted successfully." });
});

app.listen(PORT, () => {
  console.log(`FoundLink backend running at http://localhost:${PORT}`);
});