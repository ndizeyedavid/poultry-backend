import express from "express";
import cors from "cors";
import mysql from "mysql2";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 8081);
const JWT_SECRET =
  process.env.JWT_SECRET || "poultry-backend-dev-secret-change-in-production";
// Used only to seed the admin row on first boot, when the users table has no
// admin yet. After that the database is the sole source of truth — changing
// these will not alter an admin that already exists.
const ADMIN_SEED_EMAIL = process.env.ADMIN_EMAIL || "admin@poultry.com";
const ADMIN_SEED_PASSWORD = process.env.ADMIN_PASSWORD || "123";
const ADMIN_SEED_NAME = process.env.ADMIN_NAME || "Admin";
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

const BCRYPT_ROUNDS = 10;

function hashPassword(plain) {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

// bcrypt hashes always start with $2a$ / $2b$ / $2y$ and are 60 chars long.
// Rows predating hashing hold the password verbatim, so detect and handle both.
function isHashed(stored) {
  return typeof stored === "string" && /^\$2[aby]\$/.test(stored);
}

// Returns true when `plain` matches `stored`, whether stored is a bcrypt hash
// or a legacy plaintext value.
async function verifyPassword(plain, stored) {
  if (typeof stored !== "string" || stored.length === 0) return false;
  if (isHashed(stored)) return bcrypt.compare(plain, stored);
  return stored === plain;
}

function signToken(userId, email, role) {
  return jwt.sign(
    { userId, email, role },
    JWT_SECRET,
    { expiresIn: "7d" },
  );
}

function mapUserRow(row) {
  if (!row) return null;
  return {
    id: String(row.id),
    email: row.email,
    name: row.name,
    role: row.role === "admin" ? "admin" : "farmer",
    is_verified: !!row.is_verified,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function findUserByEmail(email) {
  const rows = await dbQuery("SELECT * FROM users WHERE email = ?", [email]);
  return mapUserRow(rows[0]);
}

async function findUserById(id) {
  const rows = await dbQuery("SELECT * FROM users WHERE id = ?", [id]);
  return mapUserRow(rows[0]);
}

async function ensureSchema() {
  await dbQuery(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'farmer',
      is_verified TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
}

// Creates the admin row the first time the app runs against an empty users
// table. Idempotent: once any admin exists this is a no-op, so the seed values
// never overwrite a password changed later in the database.
async function seedAdmin() {
  const admins = await dbQuery(
    "SELECT id FROM users WHERE role = 'admin' LIMIT 1",
  );
  if (admins.length > 0) return;

  // The seed email may already exist as a farmer (email is UNIQUE, so a plain
  // INSERT would fail). Promote that row instead of creating a second one.
  const existing = await dbQuery(
    "SELECT id FROM users WHERE email = ? LIMIT 1",
    [ADMIN_SEED_EMAIL],
  );
  if (existing.length > 0) {
    await dbQuery(
      "UPDATE users SET role = 'admin', is_verified = 1 WHERE id = ?",
      [existing[0].id],
    );
    console.log(`Promoted existing user to admin: ${ADMIN_SEED_EMAIL}`);
    return;
  }

  await dbQuery(
    "INSERT INTO users (id, email, password, name, role, is_verified) VALUES (?, ?, ?, ?, 'admin', 1)",
    [
      `admin-${Date.now()}`,
      ADMIN_SEED_EMAIL,
      await hashPassword(ADMIN_SEED_PASSWORD),
      ADMIN_SEED_NAME,
    ],
  );
  console.log(`Seeded admin account: ${ADMIN_SEED_EMAIL}`);
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

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden: insufficient permissions" });
    }
    next();
  };
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

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    // Admins and farmers authenticate through the same path — role comes from
    // the database row, not from a hardcoded check.
    const account = await findUserByEmail(email);
    if (!account) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const rows = await dbQuery("SELECT password FROM users WHERE id = ?", [
      account.id,
    ]);
    const storedPassword = rows[0]?.password;
    if (!(await verifyPassword(password, storedPassword))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Legacy plaintext row: upgrade it to a hash now that we know the password.
    if (!isHashed(storedPassword)) {
      await dbQuery("UPDATE users SET password = ? WHERE id = ?", [
        await hashPassword(password),
        account.id,
      ]);
    }

    if (!account.is_verified) {
      return res.status(403).json({ error: "Account pending admin approval" });
    }

    const token = signToken(account.id, account.email, account.role);
    return res.json({ user: account, token });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Login failed" });
  }
});

app.get("/auth/me", requireAuth, async (req, res) => {
  const user = await findUserById(req.user.userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  return res.json({ user });
});

app.post("/auth/logout", (_req, res) => {
  return res.json({ success: true });
});

app.post("/auth/signup", async (req, res) => {
  const { email, password, name } = req.body || {};

  if (!email || !password || !name) {
    return res.status(400).json({ error: "Email, password, and name are required" });
  }

  try {
    // Covers the admin address too, now that admin is an ordinary row.
    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    const id = `farmer-${Date.now()}`;
    await dbQuery(
      "INSERT INTO users (id, email, password, name, role, is_verified) VALUES (?, ?, ?, ?, 'farmer', 0)",
      [id, email, await hashPassword(password), name],
    );

    return res.status(201).json({
      message: "Account created. Awaiting admin approval.",
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "An account with this email already exists" });
    }
    return res.status(500).json({ error: err.message || "Sign-up failed" });
  }
});

// ── Admin-only: list pending farmers ──
app.get("/auth/pending", requireAuth, requireRole("admin"), async (_req, res) => {
  try {
    const rows = await dbQuery(
      "SELECT id, email, name, role, is_verified, created_at, updated_at FROM users WHERE role = 'farmer' AND is_verified = 0 ORDER BY created_at ASC",
    );
    const pending = rows.map(mapUserRow);
    return res.json(pending);
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to load pending farmers" });
  }
});

// ── Admin-only: approve a farmer ──
app.post("/auth/approve/:userId", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const result = await dbQuery("UPDATE users SET is_verified = 1 WHERE id = ?", [
      req.params.userId,
    ]);
    if (!result.affectedRows) {
      return res.status(404).json({ error: "Farmer not found" });
    }
    const farmer = await findUserById(req.params.userId);
    return res.json({ message: `Farmer ${farmer.email} approved` });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to approve farmer" });
  }
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

app.post("/fan/toggle", requireAuth, requireRole("admin"), async (_req, res) => {
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

app.post("/heater/toggle", requireAuth, requireRole("admin"), async (_req, res) => {
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

app.get("/fetchcontrols", async (_req, res) => {
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

app.get("/controls", requireAuth, requireRole("admin"), async (req, res) => {
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

ensureSchema()
  .then(seedAdmin)
  .then(() => {
    app.listen(port, () => {
      console.log("server running on: " + port);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database schema:\n" + err);
    app.listen(port, () => {
      console.log("server running on: " + port);
    });
  });
