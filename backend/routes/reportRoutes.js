const express = require("express");

const router = express.Router();

const { createReport, getReports, resolveReport } = require("../controllers/reportController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createReport);

router.get("/", protect, getReports);

router.put("/:id/resolve", protect, resolveReport);

module.exports = router;
