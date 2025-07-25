require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();
const port = process.env.PORT;
const { connect } = require("./database");

// Importing Verifying Token Middleware
const verifyToken = require("./middleware/verify");

// Importing Routes
const authRoutes = require("./routes/auth");
const projectRoutes = require("./routes/project");
const faqRoutes = require("./routes/faq");
const userRoutes = require("./routes/user");
const videoTestimonialRoutes = require("./routes/videoTestimonial");
const staticTestimonialRoutes = require("./routes/staticTestimonial");
const blogRoutes = require("./routes/blog");
const contactRoutes =require("./routes/contact");
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

app.get("/health", (_, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/auth", authRoutes);
app.use("/users", verifyToken, userRoutes);
app.use("/project", projectRoutes);
app.use("/faq", faqRoutes);
app.use("/videoTestimonial", videoTestimonialRoutes);
app.use("/staticTestimonial", staticTestimonialRoutes);
app.use("/blog", blogRoutes);
app.use("/contact",contactRoutes);

// Server Listening
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
