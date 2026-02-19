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
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ================= DATABASE =================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.connect()
  .then(() => console.log("✅ PostgreSQL Connected"))
  .catch(err => console.error("❌ PostgreSQL Error:", err));

// ================= MULTER (CLOUDINARY) =================
const facultyStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "faculty",
    allowed_formats: ["jpg", "jpeg", "png"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

const uploadFacultyImage = multer({
  storage: facultyStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
});


// ================= AUTH =================
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const exists = await pool.query(
      "SELECT id FROM users WHERE email=$1",
      [email]
    );
    if (exists.rows.length)
      return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users(name,email,password,role)
       VALUES($1,$2,$3,$4)
       RETURNING id,name,email,role`,
      [name, email, hashed, role]
    );

    res.json({ message: "Registered ✅", user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration failed" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
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
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
});

// ================= FACULTY MODULE =================

// CREATE
app.post("/faculty", uploadFacultyImage.single("image"), async (req, res) => {
  try {
    const { name, designation, subject, email } = req.body;

    const image_url = req.file?.path || null;
    const image_public_id = req.file?.filename || null;

    console.log("☁️ Uploaded to Cloudinary:", image_url);

    const result = await pool.query(
      `INSERT INTO faculty(name,designation,subject,email,image_url,image_public_id)
       VALUES($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [name, designation, subject, email, image_url, image_public_id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add faculty" });
  }
});

// READ
app.get("/faculty", async (_, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM faculty ORDER BY name"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch faculty" });
  }
});

// UPDATE
app.put("/faculty/:id", uploadFacultyImage.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, designation, subject, email } = req.body;

    let image_url = null;
    let image_public_id = null;

    if (req.file) {
      const old = await pool.query(
        "SELECT image_public_id FROM faculty WHERE id=$1",
        [id]
      );

      if (old.rows[0]?.image_public_id) {
        await cloudinary.uploader.destroy(old.rows[0].image_public_id);
        console.log("🗑️ Old Cloudinary image deleted");
      }

      image_url = req.file.path;
      image_public_id = req.file.filename;
      console.log("☁️ Updated image uploaded:", image_url);
    }

    const result = await pool.query(
      `UPDATE faculty SET
        name=$1,
        designation=$2,
        subject=$3,
        email=$4,
        image_url=COALESCE($5,image_url),
        image_public_id=COALESCE($6,image_public_id)
       WHERE id=$7
       RETURNING *`,
      [name, designation, subject, email, image_url, image_public_id, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update faculty" });
  }
});

// DELETE
app.delete("/faculty/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const old = await pool.query(
      "SELECT image_public_id FROM faculty WHERE id=$1",
      [id]
    );

    if (old.rows[0]?.image_public_id) {
      await cloudinary.uploader.destroy(old.rows[0].image_public_id);
      console.log("🗑️ Cloudinary image deleted");
    }

    await pool.query("DELETE FROM faculty WHERE id=$1", [id]);

    res.json({ message: "Faculty deleted ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete faculty" });
  }
});




// /* ================= DAILY UPDATES ================= */
// app.post("/updates", async (req, res) => {
//   const { title, description, image_url } = req.body;
//   const result = await pool.query(
//     "INSERT INTO daily_updates(title,description,image_url) VALUES($1,$2,$3) RETURNING *",
//     [title, description, image_url]
//   );
//   res.json(result.rows[0]);
// });

// app.get("/updates", async (_, res) => {
//   const result = await pool.query("SELECT * FROM daily_updates ORDER BY created_at DESC");
//   res.json(result.rows);
// });

// app.put("/updates/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { title, description } = req.body;
//     const result = await pool.query(
//       "UPDATE daily_updates SET title=$1, description=$2 WHERE id=$3 RETURNING *",
//       [title, description, id]
//     );
//     res.json(result.rows[0]);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Update failed" });
//   }
// });

// app.delete("/updates/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     await pool.query("DELETE FROM daily_updates WHERE id=$1", [id]);
//     res.json({ message: "Update deleted ✅" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Delete failed" });
//   }
// });

// /* ================= NOTES / PAPERS / SYLLABUS / EXAM ================= */
// // Factory for update endpoints with file replacement
// const updateFileEndpoint = (table, category) => async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { title, semester, subject } = req.body;
//     let file_url = null;

//     if (req.file) {
//       file_url = `/${category}/${req.file.filename}`;

//       // Delete old file
//       const old = await pool.query(`SELECT file_url FROM ${table} WHERE id=$1`, [id]);
//       if (old.rows.length && old.rows[0].file_url) {
//         const oldPath = path.join(UPLOAD_DIR, old.rows[0].file_url);
//         if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
//       }
//     }

//     const result = await pool.query(
//       `UPDATE ${table} 
//        SET title=$1, semester=$2, subject=$3,
//            file_url=COALESCE($4,file_url)
//        WHERE id=$5 RETURNING *`,
//       [title, semester, subject, file_url, id]
//     );

//     res.json(result.rows[0]);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Update failed" });
//   }
// };

// // Notes
// app.post("/notes", uploadPDF("notes").single("file"), async (req, res) => {
//   const { title, semester, subject } = req.body;
//   const file_url = `/notes/${req.file.filename}`;
//   const result = await pool.query(
//     "INSERT INTO notes(title,semester,subject,file_url) VALUES($1,$2,$3,$4) RETURNING *",
//     [title, semester, subject, file_url]
//   );
//   res.json(result.rows[0]);
// });

// app.get("/notes", async (_, res) => {
//   const result = await pool.query("SELECT * FROM notes ORDER BY created_at DESC");
//   res.json(result.rows);
// });

// app.put("/notes/:id", uploadPDF("notes").single("file"), updateFileEndpoint("notes", "notes"));
// app.delete("/notes/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { rows } = await pool.query("SELECT file_url FROM notes WHERE id=$1", [id]);
//     if (rows.length && rows[0].file_url) {
//       const filePath = path.join(UPLOAD_DIR, rows[0].file_url);
//       if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
//     }
//     await pool.query("DELETE FROM notes WHERE id=$1", [id]);
//     res.json({ message: "Note deleted ✅" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Delete failed" });
//   }
// });

// // Question papers
// app.post("/papers", uploadPDF("papers").single("file"), async (req, res) => {
//   const { title, semester, subject } = req.body;
//   const file_url = `/papers/${req.file.filename}`;
//   const result = await pool.query(
//     "INSERT INTO question_papers(title,semester,subject,file_url) VALUES($1,$2,$3,$4) RETURNING *",
//     [title, semester, subject, file_url]
//   );
//   res.json(result.rows[0]);
// });

// app.get("/papers", async (_, res) => {
//   const result = await pool.query("SELECT * FROM question_papers");
//   res.json(result.rows);
// });

// app.put("/papers/:id", uploadPDF("papers").single("file"), updateFileEndpoint("question_papers", "papers"));
// app.delete("/papers/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { rows } = await pool.query("SELECT file_url FROM question_papers WHERE id=$1", [id]);
//     if (rows.length && rows[0].file_url) {
//       const filePath = path.join(UPLOAD_DIR, rows[0].file_url);
//       if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
//     }
//     await pool.query("DELETE FROM question_papers WHERE id=$1", [id]);
//     res.json({ message: "Paper deleted ✅" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Delete failed" });
//   }
// });

// // Syllabus
// app.post("/syllabus", uploadPDF("syllabus").single("file"), async (req, res) => {
//   const { title, semester, subject } = req.body;
//   const file_url = `/syllabus/${req.file.filename}`;
//   const result = await pool.query(
//     "INSERT INTO syllabus(title,semester,subject,file_url) VALUES($1,$2,$3,$4) RETURNING *",
//     [title, semester, subject, file_url]
//   );
//   res.json(result.rows[0]);
// });

// app.get("/syllabus", async (_, res) => {
//   const result = await pool.query("SELECT * FROM syllabus ORDER BY semester");
//   res.json(result.rows);
// });

// app.put("/syllabus/:id", uploadPDF("syllabus").single("file"), updateFileEndpoint("syllabus", "syllabus"));
// app.delete("/syllabus/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { rows } = await pool.query("SELECT file_url FROM syllabus WHERE id=$1", [id]);
//     if (rows.length && rows[0].file_url) {
//       const filePath = path.join(UPLOAD_DIR, rows[0].file_url);
//       if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
//     }
//     await pool.query("DELETE FROM syllabus WHERE id=$1", [id]);
//     res.json({ message: "Syllabus deleted ✅" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Delete failed" });
//   }
// });

// /* ================= DOWNLOAD ENDPOINT ================= */
// app.get("/download/:type/:id", async (req, res) => {
//   try {
//     const { type, id } = req.params;
//     let table;
//     if (type === "notes") table = "notes";
//     else if (type === "papers") table = "question_papers";
//     else if (type === "syllabus") table = "syllabus";
//     else if (type === "exam-timetable") table = "exam_timetable";
//     else return res.status(400).json({ message: "Invalid type" });

//     const data = await pool.query(`SELECT file_url, title FROM ${table} WHERE id=$1`, [id]);
//     if (!data.rows.length) return res.status(404).json({ message: "File not found" });

//     const filePath = path.join(UPLOAD_DIR, data.rows[0].file_url);
//     if (!fs.existsSync(filePath)) return res.status(404).json({ message: "File missing" });

//     res.download(filePath, path.basename(data.rows[0].file_url));
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Download failed" });
//   }
// });

// /* ================= OTHER MODULES ================= */
// /* ================= OTHER MODULES FULLY IMPLEMENTED ================= */


// /* ========== STUDENTS MODULE ========== */
// app.post("/students", uploadImage("students").single("image"), async (req, res) => {
//   const { name, roll_no, email, department } = req.body;
//   const image_url = req.file ? `/students/${req.file.filename}` : null;
//   const result = await pool.query(
//     "INSERT INTO students(name, roll_no, email, department, image_url) VALUES($1,$2,$3,$4,$5) RETURNING *",
//     [name, roll_no, email, department, image_url]
//   );
//   res.json(result.rows[0]);
// });

// app.get("/students", async (_, res) => {
//   const result = await pool.query("SELECT * FROM students ORDER BY roll_no");
//   res.json(result.rows);
// });

// app.put("/students/:id", uploadImage("students").single("image"), async (req, res) => {
//   const { id } = req.params;
//   const { name, roll_no, email, department } = req.body;

//   let image_url = null;
//   if (req.file) {
//     image_url = `/students/${req.file.filename}`;
//     const old = await pool.query("SELECT image_url FROM students WHERE id=$1", [id]);
//     if (old.rows.length && old.rows[0].image_url) {
//       const oldPath = path.join(UPLOAD_DIR, old.rows[0].image_url);
//       if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
//     }
//   }

//   const result = await pool.query(
//     "UPDATE students SET name=$1, roll_no=$2, email=$3, department=$4, image_url=COALESCE($5,image_url) WHERE id=$6 RETURNING *",
//     [name, roll_no, email, department, image_url, id]
//   );
//   res.json(result.rows[0]);
// });

// app.delete("/students/:id", async (req, res) => {
//   const { id } = req.params;
//   const old = await pool.query("SELECT image_url FROM students WHERE id=$1", [id]);
//   if (old.rows.length && old.rows[0].image_url) {
//     const oldPath = path.join(UPLOAD_DIR, old.rows[0].image_url);
//     if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
//   }
//   await pool.query("DELETE FROM students WHERE id=$1", [id]);
//   res.json({ message: "Student deleted ✅" });
// });

// /* ========== EVENTS MODULE ========== */
// app.post("/events", uploadImage("events").single("image"), async (req, res) => {
//   const { title, description, date } = req.body;
//   const image_url = req.file ? `/events/${req.file.filename}` : null;
//   const result = await pool.query(
//     "INSERT INTO events(title, description, date, image_url) VALUES($1,$2,$3,$4) RETURNING *",
//     [title, description, date, image_url]
//   );
//   res.json(result.rows[0]);
// });

// app.get("/events", async (_, res) => {
//   const result = await pool.query("SELECT * FROM events ORDER BY date DESC");
//   res.json(result.rows);
// });

// app.put("/events/:id", uploadImage("events").single("image"), async (req, res) => {
//   const { id } = req.params;
//   const { title, description, date } = req.body;

//   let image_url = null;
//   if (req.file) {
//     image_url = `/events/${req.file.filename}`;
//     const old = await pool.query("SELECT image_url FROM events WHERE id=$1", [id]);
//     if (old.rows.length && old.rows[0].image_url) {
//       const oldPath = path.join(UPLOAD_DIR, old.rows[0].image_url);
//       if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
//     }
//   }

//   const result = await pool.query(
//     "UPDATE events SET title=$1, description=$2, date=$3, image_url=COALESCE($4,image_url) WHERE id=$5 RETURNING *",
//     [title, description, date, image_url, id]
//   );
//   res.json(result.rows[0]);
// });

// app.delete("/events/:id", async (req, res) => {
//   const { id } = req.params;
//   const old = await pool.query("SELECT image_url FROM events WHERE id=$1", [id]);
//   if (old.rows.length && old.rows[0].image_url) {
//     const oldPath = path.join(UPLOAD_DIR, old.rows[0].image_url);
//     if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
//   }
//   await pool.query("DELETE FROM events WHERE id=$1", [id]);
//   res.json({ message: "Event deleted ✅" });
// });

// /* ========== INTERNSHIPS MODULE (Certificates) ========== */
// app.post("/internships", uploadCertificate("internships").single("certificate"), async (req, res) => {
//   const { student_id, company, title } = req.body;
//   const certificate_url = req.file ? `/internships/${req.file.filename}` : null;
//   const result = await pool.query(
//     "INSERT INTO internships(student_id, company, title, certificate_url) VALUES($1,$2,$3,$4) RETURNING *",
//     [student_id, company, title, certificate_url]
//   );
//   res.json(result.rows[0]);
// });

// app.get("/internships", async (_, res) => {
//   const result = await pool.query("SELECT * FROM internships ORDER BY id DESC");
//   res.json(result.rows);
// });

// app.put("/internships/:id", uploadCertificate("internships").single("certificate"), async (req, res) => {
//   const { id } = req.params;
//   const { student_id, company, title } = req.body;

//   let certificate_url = null;
//   if (req.file) {
//     certificate_url = `/internships/${req.file.filename}`;
//     const old = await pool.query("SELECT certificate_url FROM internships WHERE id=$1", [id]);
//     if (old.rows.length && old.rows[0].certificate_url) {
//       const oldPath = path.join(UPLOAD_DIR, old.rows[0].certificate_url);
//       if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
//     }
//   }

//   const result = await pool.query(
//     "UPDATE internships SET student_id=$1, company=$2, title=$3, certificate_url=COALESCE($4,certificate_url) WHERE id=$5 RETURNING *",
//     [student_id, company, title, certificate_url, id]
//   );
//   res.json(result.rows[0]);
// });

// app.delete("/internships/:id", async (req, res) => {
//   const { id } = req.params;
//   const old = await pool.query("SELECT certificate_url FROM internships WHERE id=$1", [id]);
//   if (old.rows.length && old.rows[0].certificate_url) {
//     const oldPath = path.join(UPLOAD_DIR, old.rows[0].certificate_url);
//     if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
//   }
//   await pool.query("DELETE FROM internships WHERE id=$1", [id]);
//   res.json({ message: "Internship deleted ✅" });
// });

// /* ========== CLUBS / ACTIVITIES MODULES ========== */
// app.post("/activities", uploadImage("activities").single("image"), async (req, res) => {
//   const { title, description, date } = req.body;
//   const image_url = req.file ? `/activities/${req.file.filename}` : null;
//   const result = await pool.query(
//     "INSERT INTO activities(title, description, date, image_url) VALUES($1,$2,$3,$4) RETURNING *",
//     [title, description, date, image_url]
//   );
//   res.json(result.rows[0]);
// });

// app.get("/activities", async (_, res) => {
//   const result = await pool.query("SELECT * FROM activities ORDER BY date DESC");
//   res.json(result.rows);
// });

// app.put("/activities/:id", uploadImage("activities").single("image"), async (req, res) => {
//   const { id } = req.params;
//   const { title, description, date } = req.body;

//   let image_url = null;
//   if (req.file) {
//     image_url = `/activities/${req.file.filename}`;
//     const old = await pool.query("SELECT image_url FROM activities WHERE id=$1", [id]);
//     if (old.rows.length && old.rows[0].image_url) {
//       const oldPath = path.join(UPLOAD_DIR, old.rows[0].image_url);
//       if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
//     }
//   }

//   const result = await pool.query(
//     "UPDATE activities SET title=$1, description=$2, date=$3, image_url=COALESCE($4,image_url) WHERE id=$5 RETURNING *",
//     [title, description, date, image_url, id]
//   );
//   res.json(result.rows[0]);
// });

// app.delete("/activities/:id", async (req, res) => {
//   const { id } = req.params;
//   const old = await pool.query("SELECT image_url FROM activities WHERE id=$1", [id]);
//   if (old.rows.length && old.rows[0].image_url) {
//     const oldPath = path.join(UPLOAD_DIR, old.rows[0].image_url);
//     if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
//   }
//   await pool.query("DELETE FROM activities WHERE id=$1", [id]);
//   res.json({ message: "Activity deleted ✅" });
// });

// /* ========== ACADEMIC HIGHLIGHTS MODULE ========== */
// app.post("/highlights", uploadImage("highlights").single("image"), async (req, res) => {
//   const { title, description } = req.body;
//   const image_url = req.file ? `/highlights/${req.file.filename}` : null;
//   const result = await pool.query(
//     "INSERT INTO academic_highlights(title, description, image_url) VALUES($1,$2,$3) RETURNING *",
//     [title, description, image_url]
//   );
//   res.json(result.rows[0]);
// });

// app.get("/highlights", async (_, res) => {
//   const result = await pool.query("SELECT * FROM academic_highlights ORDER BY id DESC");
//   res.json(result.rows);
// });

// app.put("/highlights/:id", uploadImage("highlights").single("image"), async (req, res) => {
//   const { id } = req.params;
//   const { title, description } = req.body;

//   let image_url = null;
//   if (req.file) {
//     image_url = `/highlights/${req.file.filename}`;
//     const old = await pool.query("SELECT image_url FROM academic_highlights WHERE id=$1", [id]);
//     if (old.rows.length && old.rows[0].image_url) {
//       const oldPath = path.join(UPLOAD_DIR, old.rows[0].image_url);
//       if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
//     }
//   }

//   const result = await pool.query(
//     "UPDATE academic_highlights SET title=$1, description=$2, image_url=COALESCE($3,image_url) WHERE id=$4 RETURNING *",
//     [title, description, image_url, id]
//   );
//   res.json(result.rows[0]);
// });

// app.delete("/highlights/:id", async (req, res) => {
//   const { id } = req.params;
//   const old = await pool.query("SELECT image_url FROM academic_highlights WHERE id=$1", [id]);
//   if (old.rows.length && old.rows[0].image_url) {
//     const oldPath = path.join(UPLOAD_DIR, old.rows[0].image_url);
//     if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
//   }
//   await pool.query("DELETE FROM academic_highlights WHERE id=$1", [id]);
//   res.json({ message: "Highlight deleted ✅" });
// });

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
