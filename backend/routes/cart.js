const express = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { authenticateJWT } = require("../middleware/auth");

const router = express.Router();

// Add item to cart
router.post("/", authenticateJWT, async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.userId;

  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, products: [] });
    }

    const productIndex = cart.products.findIndex(
      (p) => p.productId.toString() === productId
    );

    if (productIndex > -1) {
      cart.products[productIndex].quantity += quantity;
    } else {
      cart.products.push({ productId, quantity });
    }

    await cart.save();
    res.status(200).json({ message: "Item added to cart", cart });
  } catch (error) {
    res.status(500).json({ error: "Error adding item to cart" });
  }
});

// Update item quantity in cart
router.put("/", authenticateJWT, async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.userId;

  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    const productIndex = cart.products.findIndex(
      (p) => p.productId.toString() === productId
    );

    if (productIndex > -1) {
      cart.products[productIndex].quantity = quantity;
      await cart.save();
      res.status(200).json({ message: "Cart updated", cart });
    } else {
      res.status(404).json({ error: "Product not found in cart" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error updating cart" });
  }
});

// Remove item from cart
router.delete("/:productId", authenticateJWT, async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.userId;

  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    cart.products = cart.products.filter(
      (p) => p.productId.toString() !== productId
    );
    await cart.save();
    res.status(200).json({ message: "Item removed from cart", cart });
  } catch (error) {
    res.status(500).json({ error: "Error removing item from cart" });
  }
});

// Checkout
router.post("/checkout", authenticateJWT, async (req, res) => {
  const userId = req.user.userId;

  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    let totalPrice = 0;

    for (const item of cart.products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res
          .status(404)
          .json({ error: `Product not found: ${item.productId}` });
      }

      if (product.stockQuantity < item.quantity) {
        return res
          .status(400)
          .json({ error: `Insufficient stock for product: ${product.name}` });
      }

      product.stockQuantity -= item.quantity;
      await product.save();

      totalPrice += product.price * item.quantity;
    }

    const order = new Order({ userId, products: cart.products, totalPrice });
    await order.save();

    cart.products = [];
    await cart.save();

    res.status(200).json({ message: "Checkout successful", order });
  } catch (error) {
    res.status(500).json({ error: "Error during checkout" });
  }
});

module.exports = router;
