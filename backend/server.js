require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

const ordersRoutes = require("./routes/orders.routes");
const productsRoutes = require("./routes/products.routes");
const authRoutes = require("./routes/auth.routes");
const customerRoutes = require("./routes/customer.routes");
const chatRoutes = require("./routes/chat.routes");
const uploadRoutes = require("./routes/upload.routes");

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

const PORT = process.env.PORT || 4000;

app.get("/", (req, res) => {
  res.send("God Works Company backend is running!");
});

app.use("/api/products", productsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/upload", uploadRoutes)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});