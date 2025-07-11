require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();
const port = process.env.PORT;
const {
    connect
} = require("./database");

// Importing Verifying Token Middleware
const verifyToken = require("./middleware/verify");

// Importing Routes
const authRoutes = require("./routes/auth");
const carRoutes = require("./routes/car");
const userRoutes = require("./routes/user");
const visitRoutes = require("./routes/visit");
const carConfigRoutes = require("./routes/carConfig");
const colorRoutes = require("./routes/color");

// Middleware
app.use(cookieParser());

app.use(
    cors({
        origin: ["http://localhost:5173", "http://localhost:3000"],
        credentials: true,
    })
);

app.use(
    bodyParser.json({
        limit: "50mb",
    })
);

// Starting MongoDB
connect();

app.get('/health', (_, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString()
    });
});

// Routes
app.use("/auth", authRoutes);
app.use("/users", verifyToken, userRoutes);
app.use("/cars", verifyToken, carRoutes);
app.use("/visit", visitRoutes);
app.use("/config", verifyToken, carConfigRoutes);
app.use("/color", verifyToken, colorRoutes);

// Server Listening
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});