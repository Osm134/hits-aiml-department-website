import express from "express";
import { Pool } from "pg";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import cloudinary from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// ================= MIDDLEWARE =================
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
// ================= CLOUDINARY CONFIG =================
// Use CLOUDINARY_URL from .env automatically
cloudinary.v2.config();
const cloud = cloudinary.v2;

// ================= DATABASE =================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.connect()
  .then(() => console.log("✅ PostgreSQL Connected"))
  .catch((err) => console.error("❌ PostgreSQL Connection Error:", err));


  const eventStorage = new CloudinaryStorage({
  cloudinary: cloud,
  params: {
    folder: "events",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 900, height: 600, crop: "limit" }],
  },
});

const uploadEventImage = multer({ storage: eventStorage });

app.post("/events", uploadEventImage.single("image"), async (req, res) => {
  try {
    const { title, description, date } = req.body;
    const image_url = req.file?.path || null;

    const result = await pool.query(
      `INSERT INTO events(title, description, date, image_url)
       VALUES($1,$2,$3,$4) RETURNING *`,
      [title, description, date, image_url]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create event" });
  }
});


app.get("/events", async (_, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM events ORDER BY date DESC"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch events" });
  }
});

app.put("/events/:id", uploadEventImage.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date } = req.body;

    const old = await pool.query(
      "SELECT image_url FROM events WHERE id=$1",
      [id]
    );

    if (!old.rows.length) {
      return res.status(404).json({ message: "Event not found" });
    }

    let image_url = old.rows[0].image_url;

    if (req.file) {
      const publicId = getPublicId(image_url);
      if (publicId) {
        await cloud.uploader.destroy(publicId);
      }
      image_url = req.file.path;
    }

    const result = await pool.query(
      `UPDATE events
       SET title=$1, description=$2, date=$3, image_url=$4
       WHERE id=$5 RETURNING *`,
      [title, description, date, image_url, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update event" });
  }
});


app.delete("/events/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const old = await pool.query(
      "SELECT image_url FROM events WHERE id=$1",
      [id]
    );

    if (!old.rows.length) {
      return res.status(404).json({ message: "Event not found" });
    }

    const publicId = getPublicId(old.rows[0].image_url);
    if (publicId) {
      await cloud.uploader.destroy(publicId);
    }

    await pool.query("DELETE FROM events WHERE id=$1", [id]);

    res.json({ message: "Event deleted ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete event" });
  }
});





// ---------- EVENTS ----------
app.post("/events", uploadImage("events").single("image"), async (req, res) => {
  try {
    const { title, description, date } = req.body;
    const image_url = req.file?.path || null;
    const result = await pool.query(
      "INSERT INTO events(title, description, date, image_url) VALUES($1,$2,$3,$4) RETURNING *",
      [title, description, date, image_url]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create event." });
  }
});

app.get("/events", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM events ORDER BY date DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch events." });
  }
});
  
// ---------------- CLOUDINARY STORAGE ----------------

// ==================================================
// CLOUDINARY + MULTER SETUP
// ==================================================


// Storage Configuration
const academicStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const semester = req.body.semester || "unknown";
    const title = req.body.title || "image";

    const safeName = `${semester}_${title}`
      .replace(/[^a-zA-Z0-9]/g, "_")
      .substring(0, 40);

    return {
      folder: "academics",
      public_id: safeName,
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [
        { width: 1000, height: 1000, crop: "limit" },
        { quality: "auto", fetch_format: "auto" }
      ],
    };
  },
});

const upload = multer({ storage: academicStorage });


// ==================================================
// GET ALL IMAGES
// ==================================================
app.get("/academics", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM academics_new ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch academics" });
  }
});


// ==================================================
// UPLOAD IMAGE
// ==================================================
app.post("/academics", upload.single("file"), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "No image uploaded" });

    const { title, semester, subject, type } = req.body;

    if (!title || !semester || !subject || !type) {
      return res.status(400).json({ message: "All fields required" });
    }

    const image_url = req.file.path;
    const cloud_public_id = req.file.filename;

    const { rows } = await pool.query(
      `INSERT INTO academics_new
       (title, semester, subject, type, image_url, cloud_public_id)
       VALUES($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [title, semester, subject, type, image_url, cloud_public_id]
    );

    res.status(201).json(rows[0]);

  } catch (err) {
    console.error("Upload failed:", err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
});


// ==================================================
// UPDATE IMAGE (OPTIONAL BUT PROFESSIONAL)
// ==================================================
app.put("/academics/:id", upload.single("file"), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, semester, subject, type } = req.body;

    const existing = await pool.query(
      "SELECT cloud_public_id FROM academics_new WHERE id=$1",
      [id]
    );

    if (!existing.rows.length) {
      return res.status(404).json({ message: "Not found" });
    }

    let image_url, cloud_public_id;

    // If new image uploaded
    if (req.file) {
      const oldPublicId = existing.rows[0].cloud_public_id;

      // Delete old image
      if (oldPublicId) {
        await cloudinary.uploader.destroy(`academics/${oldPublicId}`);
      }

      image_url = req.file.path;
      cloud_public_id = req.file.filename;
    } else {
      const current = await pool.query(
        "SELECT image_url, cloud_public_id FROM academics_new WHERE id=$1",
        [id]
      );
      image_url = current.rows[0].image_url;
      cloud_public_id = current.rows[0].cloud_public_id;
    }

    const { rows } = await pool.query(
      `UPDATE academics_new
       SET title=$1, semester=$2, subject=$3, type=$4,
           image_url=$5, cloud_public_id=$6
       WHERE id=$7 RETURNING *`,
      [title, semester, subject, type, image_url, cloud_public_id, id]
    );

    res.json(rows[0]);

  } catch (err) {
    console.error("Update failed:", err);
    res.status(500).json({ message: "Update failed" });
  }
});


// ==================================================
// DELETE IMAGE
// ==================================================
app.delete("/academics/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { rows } = await pool.query(
      "SELECT cloud_public_id FROM academics_new WHERE id=$1",
      [id]
    );

    if (!rows.length)
      return res.status(404).json({ message: "Not found" });

    const publicId = rows[0].cloud_public_id;

    if (publicId) {
      await cloudinary.uploader.destroy(`academics/${publicId}`);
    }

    await pool.query("DELETE FROM academics_new WHERE id=$1", [id]);

    res.json({ message: "Deleted successfully ✅" });

  } catch (err) {
    console.error("Delete failed:", err);
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
});









/* ================= DAILY UPDATES ================= */
app.post("/updates", async (req, res) => {
  const { title, description, image_url } = req.body;
  const result = await pool.query(
    "INSERT INTO daily_updates(title,description,image_url) VALUES($1,$2,$3) RETURNING *",
    [title, description, image_url]
  );
  res.json(result.rows[0]);
});

app.get("/updates", async (_, res) => {
  const result = await pool.query("SELECT * FROM daily_updates ORDER BY created_at DESC");
  res.json(result.rows);
});

app.put("/updates/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const result = await pool.query(
      "UPDATE daily_updates SET title=$1, description=$2 WHERE id=$3 RETURNING *",
      [title, description, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
});

app.delete("/updates/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM daily_updates WHERE id=$1", [id]);
    res.json({ message: "Update deleted ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Delete failed" });
  }
});

/* ================= NOTES / PAPERS / SYLLABUS / EXAM ================= */
// Factory for update endpoints with file replacement











  
/* ========== EVENTS MODULE ========== */
const activityStorage = new CloudinaryStorage({
  cloudinary: cloud,
  params: {
    folder: "dept_activities",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 800, height: 800, crop: "limit" }],
  },
});

const uploadActivityImage = multer({ storage: activityStorage });


// ================= ROUTES =================
// GET all dept activities
app.get("/api/deptactivities", async (_, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM deptactivities ORDER BY event_date DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching dept activities" });
  }
});
// CREATE activity
app.post("/api/deptactivities", uploadActivityImage.single("image"), async (req, res) => {
  try {
    const { title, description, category, event_date } = req.body;
    const image_url = req.file?.path || null;
    const result = await pool.query(
      `INSERT INTO deptactivities(title, description, category, event_date, image_url)
       VALUES($1,$2,$3,$4,$5) RETURNING *`,
      [title, description, category, event_date, image_url]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error creating dept activity" });
  }
});

// UPDATE activity
app.put("/api/deptactivities/:id", uploadActivityImage.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, event_date } = req.body;
    let image_url = req.file?.path || null;

    // delete old image if new one uploaded
    if (req.file) {
      const old = await pool.query("SELECT image_url FROM deptactivities WHERE id=$1", [id]);
      if (old.rows[0]?.image_url) {
        const publicId = old.rows[0].image_url.split("/").slice(-1)[0].split(".")[0];
        await cloud.uploader.destroy(`dept_activities/${publicId}`);
      }
    }

    const result = await pool.query(
      `UPDATE deptactivities
       SET title=$1, description=$2, category=$3, event_date=$4, image_url=COALESCE($5,image_url)
       WHERE id=$6 RETURNING *`,
      [title, description, category, event_date, image_url, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error updating dept activity" });
  }
});

// DELETE activity
app.delete("/api/deptactivities/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const old = await pool.query("SELECT image_url FROM deptactivities WHERE id=$1", [id]);
    if (old.rows[0]?.image_url) {
      const publicId = old.rows[0].image_url.split("/").slice(-1)[0].split(".")[0];
      await cloud.uploader.destroy(`dept_activities/${publicId}`);
    }
    await pool.query("DELETE FROM deptactivities WHERE id=$1", [id]);
    res.json({ message: "Dept activity deleted ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error deleting dept activity" });
  }
});


// ================= MULTER + CLOUDINARY STORAGE =================
// ================= CLOUDINARY STORAGE HELPERS =================
const createCloudinaryStorage = (folder) =>
  new CloudinaryStorage({
    cloudinary: cloud,
    params: {
      folder,
      allowed_formats: ["jpg", "jpeg", "png", "pdf"],
      transformation: [{ width: 800, height: 800, crop: "limit" }],
    },
  });

const uploadImage = (folder) => multer({ storage: createCloudinaryStorage(folder) });

// ====================== ROUTES ======================
// ---------- STUDENT REPRESENTATIVES ----------
app.post("/students-rep", uploadImage("student_reps").single("image"), async (req, res) => {
  try {
    const { name, email, class: className } = req.body;
    const image_url = req.file?.path || null;
    const result = await pool.query(
      "INSERT INTO student_representatives(name, email, class, image_url) VALUES($1,$2,$3,$4) RETURNING *",
      [name, email, className, image_url]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create student representative." });
  }
});

app.get("/students-rep", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM student_representatives ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch student representatives." });
  }
});

app.put("/students-rep/:id", uploadImage("student_reps").single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, class: className } = req.body;
    const image_url = req.file?.path || null;
    const result = await pool.query(
      "UPDATE student_representatives SET name=$1, email=$2, class=$3, image_url=COALESCE($4,image_url) WHERE id=$5 RETURNING *",
      [name, email, className, image_url, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update student representative." });
  }
});

app.delete("/students-rep/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM student_representatives WHERE id=$1", [id]);
    res.json({ message: "Student representative deleted ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete student representative." });
  }
});

// ---------- INTERNSHIPS ----------
// ================= INTERNSHIPS =================
app.get("/internships", async (_, res) => {
  try {
    const result = await pool.query("SELECT * FROM internships ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch internships." });
  }
});

// ✅ Correct
app.post("/internships", uploadImage("internships").single("certificate"), async (req, res) => {
  try {
    const { name, roll_no, class: className, company } = req.body;
    const certificate_url = req.file?.path || null;
    const result = await pool.query(
      "INSERT INTO internships(name,roll_no,class,company,certificate_url) VALUES($1,$2,$3,$4,$5) RETURNING *",
      [name, roll_no, className, company, certificate_url]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create internship." });
  }
});

app.delete("/internships/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM internships WHERE id=$1", [id]);
    res.json({ message: "Internship deleted ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete internship." });
  }
});


// ---------- CLUBS ----------


// ================= CLUBS =================

// ================= CLUBS =================

// GET all clubs
app.get("/clubs", async (_, res) => {
  try {
    const result = await pool.query("SELECT * FROM clubs ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch clubs." });
  }
});

// CREATE club
app.post("/clubs", async (req, res) => {
  try {
    const { name, description } = req.body;
    const result = await pool.query(
      "INSERT INTO clubs(name,description) VALUES($1,$2) RETURNING *",
      [name, description]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create club." });
  }
});

// DELETE club
app.delete("/clubs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM clubs WHERE id=$1", [id]);
    res.json({ message: "Club deleted ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete club." });
  }
});

// GET members of a club
app.get("/clubs/:id/members", async (req, res) => {
  try {
    const { id } = req.params;
    const club = await pool.query("SELECT * FROM clubs WHERE id=$1", [id]);
    if (club.rows.length === 0) return res.status(404).json({ error: "Club not found" });

    const result = await pool.query(
      "SELECT * FROM club_members WHERE club_id=$1 ORDER BY created_at DESC",
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch club members." });
  }
});

// JOIN a club
app.post("/clubs/:id/join", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, roll_no, class: className, email } = req.body;

    const club = await pool.query("SELECT * FROM clubs WHERE id=$1", [id]);
    if (club.rows.length === 0) return res.status(404).json({ error: "Club not found" });

    const result = await pool.query(
      "INSERT INTO club_members(club_id,name,roll_no,class,email) VALUES($1,$2,$3,$4,$5) RETURNING *",
      [id, name, roll_no, className, email]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to join club." });
  }
});



// ---------- DAILY UPDATES ----------
app.post("/updates", uploadImage("updates").single("image"), async (req, res) => {
  try {
    const { title, description } = req.body;
    const image_url = req.file?.path || null;
    const result = await pool.query(
      "INSERT INTO daily_updates(title, description, image_url) VALUES($1,$2,$3) RETURNING *",
      [title, description, image_url]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create update." });
  }
});

app.get("/updates", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM daily_updates ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch updates." });
  }
});


// ---------- ROOT ----------

// ================= MULTER + CLOUDINARY faculty  =================
const facultyStorage = new CloudinaryStorage({
  cloudinary: cloud,
  params: {
    folder: "faculty",
    allowed_formats: ["jpg", "jpeg", "png"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

const uploadFacultyImage = multer({
  storage: facultyStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// ================= FACULTY MODULE =================

// CREATE Faculty
app.post("/faculty", uploadFacultyImage.single("image"), async (req, res) => {
  try {
    const { name, designation, subject } = req.body;
    const image_url = req.file ? req.file.path : null;

    console.log("☁️ Cloudinary Upload Success:", image_url);

    const result = await pool.query(
      `INSERT INTO faculty (name, designation, subject, image_url)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, designation, subject, image_url]
    );

    res.status(201).json({
      message: "Faculty added successfully ✅",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error in /faculty POST:", err);
    res.status(500).json({ message: "Failed to add faculty", error: err.message });
  }
});

// READ Faculty
app.get("/faculty", async (_, res) => {
  try {
    const result = await pool.query("SELECT * FROM faculty ORDER BY name");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error in /faculty GET:", err);
    res.status(500).json({ message: "Failed to fetch faculty", error: err.message });
  }
});

// UPDATE Faculty
app.put("/faculty/:id", uploadFacultyImage.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, designation, subject } = req.body;

    let image_url = null;

    if (req.file) {
      const old = await pool.query("SELECT image_url FROM faculty WHERE id=$1", [id]);
      if (old.rows[0]?.image_url) {
        const publicId = old.rows[0].image_url.split("/").slice(-1)[0].split(".")[0];
        try {
          await cloud.uploader.destroy(`faculty/${publicId}`);
          console.log(`🗑️ Old Cloudinary image deleted: faculty/${publicId}`);
        } catch (err) {
          console.error("❌ Cloudinary delete failed (update):", err);
        }
      }
      image_url = req.file.path;
      console.log("☁️ New Cloudinary image uploaded:", image_url);
    }

    const result = await pool.query(
      `UPDATE faculty SET
        name=$1,
        designation=$2,
        subject=$3,
        image_url=COALESCE($4, image_url)
       WHERE id=$5
       RETURNING *`,
      [name, designation, subject, image_url, id]
    );

    res.json({
      message: "Faculty updated successfully ✅",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error in /faculty PUT:", err);
    res.status(500).json({ message: "Failed to update faculty", error: err.message });
  }
});

// DELETE Faculty
app.delete("/faculty/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const old = await pool.query("SELECT image_url FROM faculty WHERE id=$1", [id]);

    if (old.rows[0]?.image_url) {
      const publicId = old.rows[0].image_url.split("/").slice(-1)[0].split(".")[0];
      try {
        await cloud.uploader.destroy(`faculty/${publicId}`);
        console.log(`🗑️ Cloudinary image deleted: faculty/${publicId}`);
      } catch (err) {
        console.error("❌ Cloudinary delete failed (delete route):", err);
      }
    }

    await pool.query("DELETE FROM faculty WHERE id=$1", [id]);
    res.json({ message: "Faculty deleted successfully ✅" });
  } catch (err) {
    console.error("❌ Error in /faculty DELETE:", err);
    res.status(500).json({ message: "Failed to delete faculty", error: err.message });
  }
});

// Start server
// ---------- ALIAS ROUTES ----------
app.get("/students", (_, res) => res.redirect("/students-rep"));


/* ================= ACADEMIC HIGHLIGHTS ================= */

// GET all academic highlights
app.get("/academic-highlights", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM academic_highlights ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Failed to fetch academic highlights:", err);
    res.status(500).json({ message: "Failed to fetch academic highlights" });
  }
});

// CREATE new academic highlight
app.post("/academic-highlights", async (req, res) => {
  try {
    const { title, description, link } = req.body;
    const { rows } = await pool.query(
      "INSERT INTO academic_highlights(title, description, link) VALUES($1, $2, $3) RETURNING *",
      [title, description, link]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("❌ Failed to create academic highlight:", err);
    res.status(500).json({ message: "Failed to create academic highlight" });
  }
});

// UPDATE an academic highlight
app.put("/academic-highlights/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, link } = req.body;
    const { rows } = await pool.query(
      "UPDATE academic_highlights SET title=$1, description=$2, link=$3 WHERE id=$4 RETURNING *",
      [title, description, link, id]
    );
    if (!rows.length) return res.status(404).json({ message: "Highlight not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("❌ Failed to update academic highlight:", err);
    res.status(500).json({ message: "Failed to update academic highlight" });
  }
});

// DELETE an academic highlight
app.delete("/academic-highlights/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM academic_highlights WHERE id=$1", [id]);
    res.json({ message: "Academic highlight deleted ✅" });
  } catch (err) {
    console.error("❌ Failed to delete academic highlight:", err);
    res.status(500).json({ message: "Failed to delete academic highlight" });
  }
});


/* ================= HEALTH ================= */
app.get("/health", async (_, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "OK", pool: "Connected" });
  } catch {
    res.status(500).json({ status: "pool Error" });
  }
});

/* ================= SERVER ================= */
app.get("/", (_, res) => res.send("HITS AIML API running 🚀"));
app.listen(port, () => console.log(`✅ Server running on http://localhost:${port}`));
