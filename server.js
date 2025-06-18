import express from "express";
import mainRouter from "./routes/index.js";
import cors from "cors";

const app = express();
const PORT = 3000; // Hardcode for clarity

// ✅ CORS at app level
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true
}));

app.use(express.json());
app.use("/", mainRouter);

// Error handlers remain same
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
