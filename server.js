const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL Connection Pool
const db = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 4000,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "portfolio_db",
    ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.getConnection((err, connection) => {
    if (err) {
        console.error("Database connection failed:");
        console.error(err);
    } else {
        console.log("MySQL Connected");
        connection.release();
    }
});

const jwt = require("jsonwebtoken");

// Contact API
app.post("/api/contact", (req, res) => {
    console.log("=== INCOMING CONTACT REQUEST ===");
    console.log(req.body);
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
        console.log("Missing fields in request");
        return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const sql = `
        INSERT INTO contacts (name, email, subject, message)
        VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [name, email, subject || "", message], (err, result) => {
        if (err) {
            console.error("Error inserting contact:", err);
            return res.status(500).json({
                success: false,
                message: "Database Error"
            });
        }

        res.json({
            success: true,
            message: "Message sent successfully!"
        });
    });
});

// Admin Login API
app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ success: true, token });
    } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
    }
});

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
    const bearerHeader = req.headers['authorization'];
    if (bearerHeader) {
        const token = bearerHeader.split(' ')[1];
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ success: false, message: "Invalid or expired token" });
            }
            req.user = decoded;
            next();
        });
    } else {
        res.status(401).json({ success: false, message: "Access denied" });
    }
};

// Admin Fetch Messages API
app.get("/api/messages", verifyToken, (req, res) => {
    db.query("SELECT * FROM contacts ORDER BY created_at DESC", (err, results) => {
        if (err) {
            console.error("Error fetching messages:", err);
            return res.status(500).json({ success: false, message: "Database Error" });
        }
        res.json({ success: true, messages: results });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});