const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const { protect } = require("../middleware/authMiddleware");

// Place order
router.post("/", protect, async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id }).populate(
    "items.product"
  );
  if (!cart || cart.items.length === 0)
    return res.status(400).json({ msg: "Cart empty" });

  const total = cart.items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );
  const order = new Order({ user: req.user.id, items: cart.items, total });
  await order.save();

  // Clear cart
  cart.items = [];
  await cart.save();

  // Send email
  const user = await User.findById(req.user.id);
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  const mailOptions = {
    to: user.email,
    from: process.env.EMAIL_USER,
    subject: "Order Confirmation",
    text: `Your order #${order._id} has been placed. Total: $${total}. Thank you!`,
  };
  await transporter.sendMail(mailOptions);

  res.json({ msg: "Order placed", order });
});

// Get user orders
router.get("/", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("items.product")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// Get single order
router.get("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id })
      .populate("items.product");
    if (!order) return res.status(404).json({ msg: "Order not found" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

module.exports = router;
