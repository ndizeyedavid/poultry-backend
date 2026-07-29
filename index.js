import express from "express";
import cors from "cors";
import mysql from "mysql2";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 8081);
const JWT_SECRET =
  process.env.JWT_SECRET || "poultry-backend-dev-secret-change-in-production";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@poultry.com";
const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD || process.env.VITE_PASSWORD || "123";
const FRONTEND_URL = process.env.FRONTEND_URL;

const DEFAULT_HOUSE = {
  id: "house-1",
  name: "Main House",
  location: "Poultry Farm",
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const allowedOrigins = FRONTEND_URL
  ? FRONTEND_URL.split(",").map((origin) => origin.trim())
  : true;

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());

const db = mysql.createConnection({
  host: "ib2zgu.h.filess.io",
  user: "poultry_nowexactam",
  password: "bf8d8b3ac110f71365a2f75eeaa1343437d18cda",
  database: "poultry_nowexactam",
  port: "3307",
});

db.on("error", (err) => {
  console.log("Database connection failed\n" + err);
});

db.on("connect", () => {
  console.log("Database connected");
});

function dbQuery(sql, values = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, values, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    });
  });
}

function getAdminUser() {
  const now = new Date().toISOString();
  return {
    id: "admin-1",
    email: ADMIN_EMAIL,
    name: "Admin",
    role: "admin",
    is_verified: true,
    created_at: now,
    updated_at: now,
  };
}

function signToken() {
  return jwt.sign(
    {
      userId: "admin-1",
      email: ADMIN_EMAIL,
      role: "admin",
    },
    JWT_SECRET,
    { expiresIn: "7d" },
  );
}

function getTokenFromRequest(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.slice(7);
}

function requireAuth(req, res, next) {
  const token = getTokenFromRequest(req);

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

function getDateRange(filter, start, end) {
  const now = new Date();
  const startDate = new Date(now);
  const endDate = new Date(now);

  endDate.setHours(23, 59, 59, 999);

  switch (filter) {
    case "today":
      startDate.setHours(0, 0, 0, 0);
      break;
    case "daily":
      startDate.setDate(startDate.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "weekly":
      startDate.setDate(startDate.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "monthly":
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "yearly":
      startDate.setMonth(0, 1);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "custom":
      if (start) {
        const customStart = new Date(start);
        if (!Number.isNaN(customStart.getTime())) {
          customStart.setHours(0, 0, 0, 0);
          startDate.setTime(customStart.getTime());
        }
      }
      if (end) {
        const customEnd = new Date(end);
        if (!Number.isNaN(customEnd.getTime())) {
          customEnd.setHours(23, 59, 59, 999);
          endDate.setTime(customEnd.getTime());
        }
      }
      break;
    default:
      startDate.setDate(startDate.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      break;
  }

  return { startDate, endDate };
}

function mapReading(reading, fanOn, heaterOn) {
  return {
    id: String(reading.id),
    house_id: null,
    temperature: reading.temperature,
    humidity: reading.humidity,
    air_quality: reading.gaz,
    fan_status: fanOn,
    heater_status: heaterOn,
    created_by: null,
    created_at: reading.added_date,
    updated_at: reading.added_date,
  };
}

async function fetchReadings() {
  return dbQuery("SELECT * FROM tbl_temperature ORDER BY id ASC");
}

async function fetchLatestReading() {
  const rows = await dbQuery(
    "SELECT * FROM tbl_temperature ORDER BY id DESC LIMIT 1",
  );
  return rows[0] || null;
}

async function fetchControls() {
  return dbQuery("SELECT gpio, state FROM outputs");
}

async function setControlState(gpio, state) {
  const rows = await dbQuery("SELECT state FROM outputs WHERE gpio = ?", [
    gpio,
  ]);

  if (!rows.length) {
    return null;
  }

  await dbQuery("UPDATE outputs SET state = ? WHERE gpio = ?", [state, gpio]);
  return state;
}

app.post("/auth/login", (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const user = getAdminUser();
  const token = signToken();

  return res.json({ user, token });
});

app.get("/auth/me", requireAuth, (req, res) => {
  const user = getAdminUser();
  return res.json({ user });
});

app.post("/auth/logout", (_req, res) => {
  return res.json({ success: true });
});

app.post("/auth/signup", (_req, res) => {
  return res.status(400).json({
    error: "Sign-up is disabled. Use the preconfigured admin credentials.",
  });
});

app.get("/houses", requireAuth, (_req, res) => {
  return res.json([DEFAULT_HOUSE]);
});

app.get("/logs", requireAuth, (_req, res) => {
  return res.json([]);
});

app.get("/sensor-readings", requireAuth, async (req, res) => {
  try {
    const filter = req.query.filter || "daily";
    const start = req.query.start || undefined;
    const end = req.query.end || undefined;

    const [readings, controls] = await Promise.all([
      fetchReadings(),
      fetchControls(),
    ]);

    const fanOn =
      controls.find((control) => control.gpio === "19")?.state === 1;
    const heaterOn =
      controls.find((control) => control.gpio === "14")?.state === 1;
    const { startDate, endDate } = getDateRange(filter, start, end);

    const mapped = readings
      .filter((reading) => {
        const readingDate = new Date(reading.added_date);
        return readingDate >= startDate && readingDate <= endDate;
      })
      .map((reading) => mapReading(reading, fanOn, heaterOn));

    return res.json(mapped);
  } catch (err) {
    return res.status(500).json({
      error: err.message || "Failed to fetch sensor data",
    });
  }
});

app.post("/fan/toggle", requireAuth, async (_req, res) => {
  try {
    const latest = await fetchLatestReading();

    if (latest && latest.temperature > 34) {
      return res
        .status(400)
        .json({ error: "Temperature > 34°C — fan auto-forced ON" });
    }

    const controls = await fetchControls();
    const currentState =
      controls.find((control) => control.gpio === "19")?.state ?? 0;
    const nextState = currentState === 1 ? 0 : 1;
    const changed = await setControlState("19", nextState);

    if (changed === null) {
      return res.status(404).json({ error: "Fan control not found" });
    }

    return res.json({ on: changed, gpio: "19" });
  } catch (err) {
    return res.status(500).json({
      error: err.message || "Failed to toggle fan",
    });
  }
});

app.post("/heater/toggle", requireAuth, async (_req, res) => {
  try {
    const latest = await fetchLatestReading();

    if (latest && latest.temperature >= 34) {
      return res
        .status(400)
        .json({ error: "Temperature >= 34°C — heater auto-forced OFF" });
    }

    if (latest && latest.temperature < 30) {
      return res
        .status(400)
        .json({ error: "Temperature < 30°C — heater auto-forced ON" });
    }

    const controls = await fetchControls();
    const currentState =
      controls.find((control) => control.gpio === "14")?.state ?? 0;
    const nextState = currentState === 1 ? 0 : 1;
    const changed = await setControlState("14", nextState);

    if (changed === null) {
      return res.status(404).json({ error: "Heater control not found" });
    }

    return res.json({ on: changed, gpio: "14" });
  } catch (err) {
    return res.status(500).json({
      error: err.message || "Failed to toggle heater",
    });
  }
});

app.get("/data", requireAuth, async (_req, res) => {
  try {
    const data = await fetchReadings();
    return res.json(data);
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch data",
      error: err.message,
    });
  }
});

app.get("/average", requireAuth, async (_req, res) => {
  try {
    const data = await dbQuery(
      "SELECT ROUND(AVG(temperature), 1) as temperature, ROUND(AVG(humidity), 1) as humidity, ROUND(AVG(gaz), 1) as ammonia FROM tbl_temperature",
    );
    return res.json(data);
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch averages",
      error: err.message,
    });
  }
});

app.get("/fetchcontrols", requireAuth, async (_req, res) => {
  try {
    const controls = await fetchControls();
    return res.json(controls);
  } catch (err) {
    return res.status(500).json({
      status: 500,
      msg: "Failed to fetch controls",
      error: err.message,
    });
  }
});

app.get("/controls", requireAuth, async (req, res) => {
  const gpio = req.query.gpio;
  const stateParam = req.query.state;

  if (!gpio) {
    return res
      .status(400)
      .json({ status: 400, msg: "gpio query parameter is required" });
  }

  try {
    const rows = await dbQuery("SELECT state FROM outputs WHERE gpio = ?", [
      gpio,
    ]);

    if (!rows.length) {
      return res
        .status(404)
        .json({ status: 404, msg: `Control '${gpio}' not found` });
    }

    const currentState = rows[0].state;
    const nextState =
      stateParam === "0" || stateParam === "1"
        ? Number(stateParam)
        : currentState === 0
          ? 1
          : 0;

    await dbQuery("UPDATE outputs SET state = ? WHERE gpio = ?", [
      nextState,
      gpio,
    ]);

    return res.json({ status: 200, changed: gpio, on: nextState });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      msg: "Failed to update gpio",
      error: err.message,
    });
  }
});

app.post("/insert", async (req, res) => {
  const { temperature, humidity, airQuality } = req.body || {};

  try {
    await dbQuery(
      "INSERT INTO tbl_temperature(temperature, humidity, gaz) values(?, ?, ?)",
      [temperature, humidity, airQuality],
    );

    return res.status(201).json({
      message: "Recorded data inserted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Unable to insert data",
      error: err.message,
    });
  }
});

app.get("/", (_req, res) => {
  res.json({ msg: "Api working well" });
});

app.listen(port, () => {
  console.log("server running on: " + port);
});
