const express = require("express");
const Order = require("../models/Order");
const { authenticateJWT, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

// Get order history for authenticated user
router.get("/", authenticateJWT, async (req, res) => {
  const userId = req.user.userId;

  try {
    const orders = await Order.find({ userId });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Error fetching order history" });
  }
});

// Get all orders (Admin only)
router.get(
  "/all",
  authenticateJWT,
  authorizeRoles("Admin"),
  async (req, res) => {
    try {
      const orders = await Order.find();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Error fetching orders" });
    }
  }
);

// Filter orders by user (Admin only)
router.get(
  "/user/:userId",
  authenticateJWT,
  authorizeRoles("Admin"),
  async (req, res) => {
    const { userId } = req.params;

    try {
      const orders = await Order.find({ userId });
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Error fetching orders for user" });
    }
  }
);

module.exports = router;
