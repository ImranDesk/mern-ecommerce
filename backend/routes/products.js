const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const multer = require("multer");
const { protect, admin } = require("../middleware/authMiddleware");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Get all products (public)
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// Get single product (public)
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// Admin: Add product
router.post("/", protect, admin, upload.single("image"), async (req, res) => {
  const { name, shortDescription, fullDescription, price } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : "";
  const product = new Product({
    name,
    shortDescription,
    fullDescription,
    price,
    image,
  });
  await product.save();
  res.json(product);
});

// Admin: Update product
router.put("/:id", protect, admin, upload.single("image"), async (req, res) => {
  const { name, shortDescription, fullDescription, price } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ msg: "Product not found" });
  product.name = name || product.name;
  product.shortDescription = shortDescription || product.shortDescription;
  product.fullDescription = fullDescription || product.fullDescription;
  product.price = price || product.price;
  if (req.file) product.image = `/uploads/${req.file.filename}`;
  await product.save();
  res.json(product);
});

// Admin: Delete product
router.delete("/:id", protect, admin, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ msg: "Product deleted" });
});

module.exports = router;
