const express = require("express");
const Product = require("../models/Product");
const { authenticateJWT, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

// Create a new product (Admin only)
router.post("/", authenticateJWT, authorizeRoles("Admin"), async (req, res) => {
  const { name, description, price, stockQuantity, category } = req.body;

  try {
    const product = new Product({
      name,
      description,
      price,
      stockQuantity,
      category,
    });
    await product.save();

    res.status(201).json({ message: "Product created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error creating product" });
  }
});

// Get all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Error fetching products" });
  }
});

// Get a single product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Error fetching product" });
  }
});

// Update a product (Admin only)
router.put(
  "/:id",
  authenticateJWT,
  authorizeRoles("Admin"),
  async (req, res) => {
    const { name, description, price, stockQuantity, category } = req.body;

    try {
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { name, description, price, stockQuantity, category },
        { new: true }
      );
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json({ message: "Product updated successfully", product });
    } catch (error) {
      res.status(500).json({ error: "Error updating product" });
    }
  }
);

// Delete a product (Admin only)
router.delete(
  "/:id",
  authenticateJWT,
  authorizeRoles("Admin"),
  async (req, res) => {
    try {
      const product = await Product.findByIdAndDelete(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Error deleting product" });
    }
  }
);

module.exports = router;
