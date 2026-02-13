import express from "express";
import pg from "pg";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path"; 
dotenv.config();

const port = process.env.PORT || 5000;

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ================= MIDDLEWARE ================= */

app.use(cors({}));

app.use(express.json());
// Serve files from uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ================= DATABASE ================= */
const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password:  String(process.env.PG_PASSWORD),
  port: Number(process.env.PG_PORT),
});

db.connect()
  .then(() => console.log("✅ PostgreSQL Connected"))
  .catch(err => console.error("❌ DB Error:", err));

/* ================= FILE UPLOAD ================= */
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

// PDF upload
const pdfStorage = multer.diskStorage({
  destination: "uploads/",
  filename: (_, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_")),
});

const uploadPDF = multer({
  storage: pdfStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    if (path.extname(file.originalname).toLowerCase() !== ".pdf")
      return cb(new Error("Only PDF files allowed"));
    cb(null, true);
  },
});

// Faculty image upload
const imageStorage = multer.diskStorage({
  destination: "uploads/",
  filename: (_, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_")),
});

const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (![".jpg", ".jpeg", ".png"].includes(ext))
      return cb(new Error("Only JPG, JPEG, PNG allowed"));
    cb(null, true);
  },
});

/* ================= AUTH ================= */
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const exists = await db.query(
      "SELECT id FROM users WHERE email=$1",
      [email]
    );
    if (exists.rows.length)
      return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const result = await db.query(
      "INSERT INTO users(name,email,password,role) VALUES($1,$2,$3,$4) RETURNING id,name,email,role",
      [name, email, hashed, role]
    );

    res.json({ message: "Registered ✅", user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: "Registration failed" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await db.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );
    if (!result.rows.length)
      return res.status(401).json({ message: "User not found" });

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: "Wrong password" });

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({ token, user });
  } catch {
    res.status(500).json({ message: "Login failed" });
  }
});

/* ================= DAILY UPDATES ================= */
app.post("/updates", async (req, res) => {
  const { title, description, image_url } = req.body;
  const result = await db.query(
    "INSERT INTO daily_updates(title,description,image_url) VALUES($1,$2,$3) RETURNING *",
    [title, description, image_url]
  );
  res.json(result.rows[0]);
});

app.get("/updates", async (_, res) => {
  const result = await db.query(
    "SELECT * FROM daily_updates ORDER BY created_at DESC"
  );
  res.json(result.rows);
}); // Update a daily update
app.put("/updates/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const result = await db.query(
      "UPDATE daily_updates SET title=$1, description=$2 WHERE id=$3 RETURNING *",
      [title, description, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
});

// Delete a daily update
app.delete("/updates/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM daily_updates WHERE id=$1", [id]);
    res.json({ message: "Update deleted ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Delete failed" });
  }
});

/* ================= ACADEMIC HIGHLIGHTS ================= */

// Get the latest highlight
app.get("/academic-highlights", async (_, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM academic_highlights ORDER BY created_at DESC LIMIT 1"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch academic highlight" });
  }
});

// Create or update the highlight (only one)
// Create or update the academic highlight (only 1 row)
app.post("/academic-highlights", async (req, res) => {
  try {
    const { title, description } = req.body;

    // Check if highlight exists
    const existing = await db.query("SELECT id FROM academic_highlights LIMIT 1");

    let result;
    if (existing.rows.length) {
      const id = existing.rows[0].id;

      // Update the existing highlight
      result = await db.query(
        "UPDATE academic_highlights SET title=$1, description=$2, created_at=NOW() WHERE id=$3 RETURNING *",
        [title, description, id]
      );
    } else {
      // Insert new highlight if none exists
      result = await db.query(
        "INSERT INTO academic_highlights(title, description) VALUES($1,$2) RETURNING *",
        [title, description]
      );
    }

    res.json(result.rows[0]); // send back the updated/created highlight
  } catch (err) {
    console.error("Academic highlight error:", err);
    res.status(500).json({ message: "Failed to create/update academic highlight" });
  }
});

// Get the latest highlight
app.get("/academic-highlights", async (_, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM academic_highlights ORDER BY created_at DESC LIMIT 1"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch academic highlight" });
  }
});

// Upload event image
const uploadEventImage = multer({
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (![".jpg", ".jpeg", ".png"].includes(ext))
      return cb(new Error("Only JPG, JPEG, PNG allowed"));
    cb(null, true);
  },
});

// Create an event
app.post("/events", uploadEventImage.single("image"), async (req, res) => {
  try {
    const { title, description, date } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;
    const result = await db.query(
      "INSERT INTO events(title, description, date, image_url) VALUES($1,$2,$3,$4) RETURNING *",
      [title, description, date, image_url]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Event creation failed" });
  }
});

// Get all events
app.get("/events", async (_, res) => {
  try {
    const result = await db.query("SELECT * FROM events ORDER BY date ASC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch events" });
  }
});

// Update event
app.put("/events/:id", uploadEventImage.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date } = req.body;
    let image_url = null;
    if (req.file) image_url = `/uploads/${req.file.filename}`;

    // delete old image if new image uploaded
    if (image_url) {
      const old = await db.query("SELECT image_url FROM events WHERE id=$1", [id]);
      if (old.rows.length && old.rows[0].image_url) {
        const oldPath = path.join("uploads", path.basename(old.rows[0].image_url));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
    }

    const result = await db.query(
      `UPDATE events
       SET title=$1, description=$2, date=$3, image_url=COALESCE($4, image_url)
       WHERE id=$5 RETURNING *`,
      [title, description, date, image_url, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Event update failed" });
  }
});

// Delete event
app.delete("/events/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await db.query("SELECT image_url FROM events WHERE id=$1", [id]);
    if (data.rows.length && data.rows[0].image_url) {
      const imgPath = path.join("uploads", path.basename(data.rows[0].image_url));
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }
    await db.query("DELETE FROM events WHERE id=$1", [id]);
    res.json({ message: "Event deleted ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Delete failed" });
  }
});



app.put("/notes/:id", uploadPDF.single("file"), async (req, res) => {
  const { id } = req.params;
  const { title, semester, subject } = req.body;

  let file_url = null;

  if (req.file) {
    file_url = `/uploads/${req.file.filename}`;

    // delete old file
    const old = await db.query(
      "SELECT file_url FROM notes WHERE id=$1",
      [id]
    );
    if (old.rows.length) {
      const oldPath = path.join("uploads", path.basename(old.rows[0].file_url));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
  }

  const result = await db.query(
    `UPDATE notes 
     SET title=$1, semester=$2, subject=$3, 
     file_url=COALESCE($4, file_url)
     WHERE id=$5 RETURNING *`,
    [title, semester, subject, file_url, id]
  );

  res.json(result.rows[0]);
});
app.put("/papers/:id", uploadPDF.single("file"), async (req, res) => {
  const { id } = req.params;
  const { title, semester, subject } = req.body;

  let file_url = null;

  if (req.file) {
    file_url = `/uploads/${req.file.filename}`;

    const old = await db.query(
      "SELECT file_url FROM question_papers WHERE id=$1",
      [id]
    );
    if (old.rows.length) {
      const oldPath = path.join("uploads", path.basename(old.rows[0].file_url));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
  }

  const result = await db.query(
    `UPDATE question_papers 
     SET title=$1, semester=$2, subject=$3,
     file_url=COALESCE($4, file_url)
     WHERE id=$5 RETURNING *`,
    [title, semester, subject, file_url, id]
  );

  res.json(result.rows[0]);
});

/* ================= NOTES ================= */
app.post("/notes", uploadPDF.single("file"), async (req, res) => {
  const { title, semester, subject } = req.body;
  const file_url = `/uploads/${req.file.filename}`;

  const result = await db.query(
    "INSERT INTO notes(title,semester,subject,file_url) VALUES($1,$2,$3,$4) RETURNING *",
    [title, semester, subject, file_url]
  );
  res.json(result.rows[0]);
});

app.get("/notes", async (_, res) => {
  const result = await db.query(
    "SELECT * FROM notes ORDER BY created_at DESC"
  );
  res.json(result.rows);
});

app.delete("/notes/:id", async (req, res) => {
  const { id } = req.params;

  const data = await db.query(
    "SELECT file_url FROM notes WHERE id=$1",
    [id]
  );

  if (data.rows.length) {
    const filePath = path.join("uploads", path.basename(data.rows[0].file_url));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  await db.query("DELETE FROM notes WHERE id=$1", [id]);
  res.json({ message: "Note deleted ✅" });
});app.delete("/papers/:id", async (req, res) => {
  const { id } = req.params;

  const data = await db.query(
    "SELECT file_url FROM question_papers WHERE id=$1",
    [id]
  );

  if (data.rows.length) {
    const filePath = path.join("uploads", path.basename(data.rows[0].file_url));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  await db.query("DELETE FROM question_papers WHERE id=$1", [id]);
  res.json({ message: "Paper deleted ✅" });
});


/* ================= QUESTION PAPERS ================= */
app.post("/papers", uploadPDF.single("file"), async (req, res) => {
  const { title, semester, subject } = req.body;
  const file_url = `/uploads/${req.file.filename}`;

  const result = await db.query(
    "INSERT INTO question_papers(title,semester,subject,file_url) VALUES($1,$2,$3,$4) RETURNING *",
    [title, semester, subject, file_url]
  );
  res.json(result.rows[0]);
});

app.get("/papers", async (_, res) => {
  const result = await db.query("SELECT * FROM question_papers");
  res.json(result.rows);
});
/* ================= SYLLABUS ================= */

// Upload syllabus
app.post("/syllabus", uploadPDF.single("file"), async (req, res) => {
  try {
    const { title, semester, subject } = req.body;
    const file_url = `/uploads/${req.file.filename}`;

    const result = await db.query(
      "INSERT INTO syllabus(title,semester,subject,file_url) VALUES($1,$2,$3,$4) RETURNING *",
      [title, semester, subject, file_url]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Syllabus upload failed" });
  }
});

// Get all syllabus
app.get("/syllabus", async (_, res) => {
  const result = await db.query(
    "SELECT * FROM syllabus ORDER BY semester"
  );
  res.json(result.rows);
});

// Delete syllabus
app.delete("/syllabus/:id", async (req, res) => {
  const { id } = req.params;

  const data = await db.query(
    "SELECT file_url FROM syllabus WHERE id=$1",
    [id]
  );

  if (data.rows.length) {
    const filePath = path.join("uploads", path.basename(data.rows[0].file_url));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  await db.query("DELETE FROM syllabus WHERE id=$1", [id]);
  res.json({ message: "Syllabus deleted ✅" });
});
/* ================= EXAM TIMETABLE ================= */

// Create exam timetable
/* ================= EXAM TIMETABLE (PDF BASED) ================= */

// Upload exam timetable PDF
// Upload exam timetable PDF
/* ================= EXAM TIMETABLE ================= */
app.post("/exam-timetable", uploadPDF.single("file"), async (req, res) => {
  try {
    const { title, semester, uploaded_by } = req.body;
    if (!req.file) return res.status(400).json({ message: "File is required" });

    const file_url = `/uploads/${req.file.filename}`;

    const result = await db.query(
      "INSERT INTO exam_timetable(title, semester, file_url, uploaded_by) VALUES($1,$2,$3,$4) RETURNING *",
      [title, semester, file_url, uploaded_by || null]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Exam timetable upload error:", err);
    res.status(500).json({ message: "Timetable upload failed" });
  }
});

// Get all exam timetables
app.get("/exam-timetable", async (_, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM exam_timetable ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch exam timetables" });
  }
});

// Delete exam timetable
app.delete("/exam-timetable/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const data = await db.query("SELECT file_url FROM exam_timetable WHERE id=$1", [id]);
    if (data.rows.length) {
      const filePath = path.join("uploads", path.basename(data.rows[0].file_url));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await db.query("DELETE FROM exam_timetable WHERE id=$1", [id]);
    res.json({ message: "Exam timetable deleted ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete exam timetable" });
  }
});
 // Download file
app.get("/download/:type/:id", async (req, res) => {
  try {
    const { type, id } = req.params;
    let table;
    if (type === "notes") table = "notes";
    else if (type === "papers") table = "question_papers";
    else if (type === "syllabus") table = "syllabus";
    else if (type === "exam-timetable") table = "exam_timetable";
    else return res.status(400).json({ message: "Invalid type" });

    const data = await db.query(`SELECT file_url, title FROM ${table} WHERE id=$1`, [id]);
    if (!data.rows.length) return res.status(404).json({ message: "File not found" });

    const filePath = path.join("uploads", path.basename(data.rows[0].file_url));
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: "File missing" });

    // Force download
    res.download(filePath, path.basename(data.rows[0].file_url));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Download failed" });
  }
});


/* ================= FACULTY ================= */
app.post("/faculty", uploadImage.single("image"), async (req, res) => {
  const { name, designation, subject } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  const result = await db.query(
    "INSERT INTO faculty(name,designation,subject,image_url) VALUES($1,$2,$3,$4) RETURNING *",
    [name, designation, subject, image_url]
  );
  res.json(result.rows[0]);
});

app.get("/faculty", async (_, res) => {
  const result = await db.query(
    "SELECT * FROM faculty ORDER BY id DESC"
  );
  res.json(result.rows);
});


app.put("/faculty/:id", uploadImage.single("image"), async (req, res) => {
  const { id } = req.params;
  const { name, designation, subject } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  const result = await db.query(
    "UPDATE faculty SET name=$1,designation=$2,subject=$3,image_url=COALESCE($4,image_url) WHERE id=$5 RETURNING *",
    [name, designation, subject, image_url, id]
  );
  res.json(result.rows[0]);
}); 

// Delete faculty
app.delete("/faculty/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const { rows } = await db.query("SELECT * FROM faculty WHERE id=$1", [id]);
    if (!rows.length) return res.status(404).json({ message: "Faculty not found" });

    const faculty = rows[0];
    if (faculty.image_url) {
      const imgPath = path.join("uploads", path.basename(faculty.image_url));
      console.log("Deleting image:", imgPath); // debug
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await db.query("DELETE FROM faculty WHERE id=$1", [id]);
    res.json({ message: "Faculty deleted ✅", deletedId: id });
  } catch (err) {
    console.error("Delete faculty error:", err);
    res.status(500).json({ message: "Failed to delete faculty" });
  }
});
 /* ================= STUDENT REPRESENTATIVES ================= */
app.post("/students-rep", uploadImage.single("image"), async (req, res) => {
  try {
    const { name, email, class: className } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await db.query(
      "INSERT INTO student_representatives(name,email,class,image_url) VALUES($1,$2,$3,$4) RETURNING *",
      [name, email, className, image_url]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create student representative" });
  }
});

app.get("/students-rep", async (_, res) => {
  try {
    const result = await db.query("SELECT * FROM student_representatives ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch student representatives" });
  }
});


app.put("/students-rep/:id", uploadImage.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, class: className } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await db.query(
      `UPDATE student_representatives 
       SET name=$1, email=$2, class=$3, image_url=COALESCE($4, image_url)
       WHERE id=$5 RETURNING *`,
      [name, email, className, image_url, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update student representative" });
  }
});

app.delete("/students-rep/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const { rows } = await db.query("SELECT image_url FROM student_representatives WHERE id=$1", [id]);
    if (!rows.length) return res.status(404).json({ message: "Student not found" });

    const imgUrl = rows[0].image_url;
    if (imgUrl) {
      const imgPath = path.join(__dirname, "uploads", path.basename(imgUrl));
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await db.query("DELETE FROM student_representatives WHERE id=$1", [id]);
    res.json({ message: "Student deleted ✅" });
  } catch (err) {
    console.error("Delete student error:", err);
    res.status(500).json({ message: "Delete failed" });
  }
});
/* ================= INTERNSHIPS ================= */
const internshipStorage = multer.diskStorage({
  destination: "uploads/internships",
  filename: (_, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_"))
});

const uploadInternship = multer({
  storage: internshipStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Get all internships
// Get all internships
app.get("/internships", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, name, roll_no, class, company, certificate_url, created_at FROM internships ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch internships" });
  }
});





// Add a new internship
app.post("/internships", uploadInternship.single("certificate"), async (req, res) => {
  try {
    const { name, roll_no, class: className, company } = req.body;
    let certificate_url = req.file ? `/uploads/internships/${req.file.filename}` : null;

    const result = await db.query(
      "INSERT INTO internships(name, roll_no, class, company, certificate_url) VALUES($1,$2,$3,$4,$5) RETURNING *",
      [name, roll_no, className, company, certificate_url]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add internship" });
  }
});

// download certificate
app.get("/internships/:id/certificate", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { rows } = await db.query(
      "SELECT certificate_url FROM internships WHERE id=$1",
      [id]
    );

    if (!rows.length || !rows[0].certificate_url) {
      return res.status(404).send("Certificate not found");
    }

    const filePath = path.join(__dirname, rows[0].certificate_url);
    if (!fs.existsSync(filePath)) return res.status(404).send("File missing");

    res.download(filePath); // force download
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to download certificate");
  }
});


// Delete an internship
app.delete("/internships/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { rows } = await db.query("SELECT certificate_url FROM internships WHERE id=$1", [id]);
    if (!rows.length) return res.status(404).json({ message: "Internship not found" });

    // delete file
    if (rows[0].certificate_url) {
      const filePath = path.join(__dirname, rows[0].certificate_url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await db.query("DELETE FROM internships WHERE id=$1", [id]);
    res.json({ message: "Internship deleted ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete internship" });
  }
});



/* ================= CLUBS ================= */

// Get all clubs
app.get("/clubs", async (_, res) => {
  try {
    const result = await db.query("SELECT * FROM clubs ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch clubs" });
  }
});

// Create a new club
// Create a new club
app.post("/clubs", async (req, res) => {
  try {
    const { name, description } = req.body; // removed created_by
    const result = await db.query(
      "INSERT INTO clubs(name, description) VALUES($1,$2) RETURNING *",
      [name, description]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create club" });
  }
});


// Delete a club
app.delete("/clubs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM clubs WHERE id=$1", [id]);
    res.json({ message: "Club deleted ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete club" });
  }
});

// Get members of a club
app.get("/clubs/:id/members", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      "SELECT * FROM club_members WHERE club_id=$1 ORDER BY joined_at DESC",
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch members" });
  }
});

// Join a club
app.post("/clubs/:id/join", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, roll_no, class: className, email } = req.body;

    const result = await db.query(
      "INSERT INTO club_members(club_id, name, roll_no, class, email) VALUES($1,$2,$3,$4,$5) RETURNING *",
      [id, name, roll_no, className, email]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to join club" });
  }
});


// ensure uploads folder exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads", { recursive: true });
}

// ================= ACTIVITY IMAGE UPLOAD =================
const activityStorage = multer.diskStorage({
  destination: "uploads/",
  filename: (_, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_")),
});

const uploadActivityImage = multer({
  storage: activityStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (![".jpg", ".jpeg", ".png"].includes(ext)) {
      return cb(new Error("Only JPG, JPEG, PNG allowed"));
    }
    cb(null, true);
  },
});


// ================= GET ACTIVITIES =================
app.get("/api/activities", async (_, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM department_activities ORDER BY event_date DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch activities" });
  }
});


// ================= CREATE ACTIVITY =================
app.post(
  "/api/activities",
  uploadActivityImage.single("image"),
  async (req, res) => {
    try {
      const { title, category, description, event_date } = req.body;
      const image_url = req.file ? `/uploads/${req.file.filename}` : null;

      const result = await db.query(
        `INSERT INTO department_activities
         (title, category, description, image_url, event_date)
         VALUES ($1,$2,$3,$4,$5)
         RETURNING *`,
        [title, category, description, image_url, event_date]
      );

      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create activity" });
    }
  }
);


// ================= UPDATE ACTIVITY =================
app.put(
  "/api/activities/:id",
  uploadActivityImage.single("image"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, category, description, event_date } = req.body;

      let image_url = null;

      // if new image uploaded → delete old image
      if (req.file) {
        image_url = `/uploads/${req.file.filename}`;

        const old = await db.query(
          "SELECT image_url FROM department_activities WHERE id=$1",
          [id]
        );

        if (old.rows.length && old.rows[0].image_url) {
          const oldPath = path.join(
            __dirname,
            "uploads",
            path.basename(old.rows[0].image_url)
          );
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
      }

      const result = await db.query(
        `UPDATE department_activities
         SET title=$1,
             category=$2,
             description=$3,
             event_date=$4,
             image_url=COALESCE($5, image_url)
         WHERE id=$6
         RETURNING *`,
        [title, category, description, event_date, image_url, id]
      );

      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update activity" });
    }
  }
);


// ================= DELETE ACTIVITY =================
app.delete("/api/activities/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      "SELECT image_url FROM department_activities WHERE id=$1",
      [id]
    );

    if (result.rows.length && result.rows[0].image_url) {
      const filePath = path.join(
        __dirname,
        "uploads",
        path.basename(result.rows[0].image_url)
      );
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await db.query("DELETE FROM department_activities WHERE id=$1", [id]);

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete activity" });
  }
});


// ================= HEALTH =================
app.get("/health", async (_, res) => {
  try {
    await db.query("SELECT 1");
    res.json({ status: "OK", db: "Connected" });
  } catch {
    res.status(500).json({ status: "DB Error" });
  }
});


// ================= SERVER =================
app.get("/", (_, res) => res.send("HITS AIML API running 🚀"));
app.listen(port, () =>
  console.log(`✅ Server running on http://localhost:${port}`)
);