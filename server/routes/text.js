const express = require("express");
const router = express.Router();
const Text = require("../models/Text");

// POST /api/text – Save text
router.post("/text", async (req, res) => {
  const { content, email } = req.body;

  try {
    const newText = new Text({ content, email });
    await newText.save();

    res.json({
      message: "Text saved successfully!",
      _id: newText._id, // ← נוספה שורה זו
      preview: content.slice(0, 50) + "...",
    });
  } catch (err) {
    console.error("Error saving text:", err);
    res.status(500).json({ error: "Failed to save text" });
  }
});

// GET /api/texts?email=... – Get user's texts
router.get("/texts", async (req, res) => {
  const email = req.query.email;

  if (!email) {
    return res.status(400).json({ error: "Missing email" });
  }

  try {
    const texts = await Text.find({ email }).sort({ createdAt: -1 });
    res.json({ texts });
  } catch (err) {
    console.error("Error fetching texts:", err);
    res.status(500).json({ error: "Failed to fetch texts" });
  }
});

module.exports = router;
