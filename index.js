import express from "express";
import boqsRouter from "./api/boq-router.js";
import boqcatagoryRouter from "./api/boqcatagory-roter.js";
import boqitemRouter from "./api/boqitem-router.js";

const router = express.Router(); // ✅ Correct router creation

router.get("/", (req, res) => {
  res.send("Welcome to the ESM Node.js App with Router!");
});

// ✅ Clean route mounting
router.use("/api/boq", boqsRouter);
router.use("/api/boqcatagory", boqcatagoryRouter);
router.use("/api/boqitem", boqitemRouter);

export default router;
