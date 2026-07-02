const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

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

// Chat API
app.post("/api/chat", async (req, res) => {
    const { messages, model } = req.body;

    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ success: false, message: "Invalid messages array" });
    }

    const systemPrompt = `You are the AI assistant for Ritupurna Samal's professional portfolio website. 
Ritupurna is a highly motivated Web Developer & AI/ML Enthusiast based in Bhubaneswar, Odisha. 
She is currently pursuing a Master of Computer Applications (MCA) at GITA Autonomous College, focusing on advanced computing and software architecture. 
She holds a BCA from NC Autonomous College (2022-2025) with an 8.87 CGPA. 
Currently, she is a Junior Developer Intern (AI/ML) at Infophy Technology Pvt. Ltd., gaining hands-on experience and contributing to AI/ML solutions.
Her technical skills include programming languages (Java, C, Python, C++), Frontend Development (HTML), and Backend Database Management. 
Contact her at samalritupurna201@gmail.com or 8144187710, or via LinkedIn. 

ROLE & BEHAVIOR:
- You must analyze the above portfolio information clearly and give real, accurate answers.
- If asked about "projects", explain that while her specific portfolio projects are still being updated, she has strong skills in Web Development and AI/ML.
- Keep your answers concise, friendly, and highly professional. Use markdown for formatting. 
- CRITICAL RULE: If a user asks a question completely unrelated to Ritupurna (like general coding help, recipes, or random facts), politely decline and guide them back to her portfolio. However, you MUST answer ANY question related to her skills, career, education, contact info, or projects.`;

    const apiMessages = [
        { role: "system", content: systemPrompt },
        ...messages
    ];

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: model || "google/gemini-2.5-pro:free",
                messages: apiMessages
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error("OpenRouter Error:", data);
            return res.status(response.status).json({ success: false, message: data.error?.message || "AI Provider Error" });
        }

        res.json({ success: true, reply: data.choices[0].message.content });
    } catch (err) {
        console.error("Chat API Error:", err);
        res.status(500).json({ success: false, message: "Failed to connect to AI provider" });
    }
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("Global Error Handler caught:", err);
    res.status(500).json({
        success: false,
        message: "Internal Error Debug",
        error_message: err.message,
        stack: err.stack
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});