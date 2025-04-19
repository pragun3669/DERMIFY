const express = require("express");
const Report = require("../models/Report");
const router = express.Router();

// GET all reports for logged-in user
router.get("/", async (req, res) => {
    try {
        const reports = await Report.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(reports);
    } catch (error) {
        console.error("Error fetching reports:", error);
        res.status(500).json({ error: "Could not fetch reports" });
    }
});

module.exports = router;
