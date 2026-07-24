require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const products = [
  // Main product
  {
    name: "Aero Velocity Pro Runner",
    price: 160,
    discount: 0,
    stock: 8,
    slug: "aero-velocity-pro-runner",
    seller: "AeroSport Official",
    description:
      "Built for speed and endurance, the Aero Velocity Pro Runner features a full-length carbon plate for explosive energy return. Engineered with a breathable mesh upper and responsive foam midsole.",
    image: "/product-images/shoe1.jpg",
  },

  // Related Products
  {
    name: "Velocity Trail X2",
    price: 110,
    discount: 0,
    stock: 10,
    slug: "velocity-trail-x2",
    seller: "AeroSport",
    description: "Related product: Velocity Trail X2 by AeroSport.",
    image: "/product-images/shoe1.jpg",
  },
  {
    name: "UltraLight 4.0",
    price: 145,
    discount: 0,
    stock: 10,
    slug: "ultralight-4",
    seller: "StrideTech",
    description: "Related product: UltraLight 4.0 by StrideTech.",
    image: "/product-images/shoe2.jpg",
  },
  {
    name: "Carbon Elite Pro",
    price: 200,
    discount: 0,
    stock: 10,
    slug: "carbon-elite-pro",
    seller: "KineticRun",
    description: "Related product: Carbon Elite Pro by KineticRun.",
    image: "/product-images/shoe3.jpg",
  },
  {
    name: "Cloud Cushion 2",
    price: 95,
    discount: 0,
    stock: 10,
    slug: "cloud-cushion-2",
    seller: "AeroSport",
    description: "Related product: Cloud Cushion 2 by AeroSport.",
    image: "/product-images/shoe1.jpg",
  },
  {
    name: "Speedforce V3",
    price: 130,
    discount: 0,
    stock: 10,
    slug: "speedforce-v3",
    seller: "PeakForm",
    description: "Related product: Speedforce V3 by PeakForm.",
    image: "/product-images/shoe2.jpg",
  },

  // Also Bought
  {
    name: "Performance Socks 3-Pack",
    price: 22,
    discount: 0,
    stock: 10,
    slug: "performance-socks-3-pack",
    seller: "RunTech",
    description: "Also bought: Performance Socks 3-Pack by RunTech.",
    image: "/product-images/shoe3.jpg",
  },
  {
    name: "Insole Pro Arch Support",
    price: 35,
    discount: 0,
    stock: 10,
    slug: "insole-pro-arch-support",
    seller: "AeroSport",
    description: "Also bought: Insole Pro Arch Support by AeroSport.",
    image: "/product-images/shoe1.jpg",
  },
  {
    name: "Running GPS Watch S4",
    price: 280,
    discount: 0,
    stock: 10,
    slug: "running-gps-watch-s4",
    seller: "FitBand",
    description: "Also bought: Running GPS Watch S4 by FitBand.",
    image: "/product-images/shoe2.jpg",
  },
  {
    name: "Vest Pack 5L",
    price: 60,
    discount: 0,
    stock: 10,
    slug: "vest-pack-51",
    seller: "HydroRun",
    description: "Also bought: Vest Pack 5L by HydroRun.",
    image: "/product-images/shoe3.jpg",
  },
  {
    name: "Race Singlet V2",
    price: 45,
    discount: 0,
    stock: 10,
    slug: "race-singlet-v2",
    seller: "AeroSport",
    description: "Also bought: Race Singlet V2 by AeroSport.",
    image: "/product-images/shoe1.jpg",
  },
];

async function seed() {
  try {
    for (const p of products) {
      await pool.query(
        `INSERT INTO products (name, price, discount, stock, slug, seller, description, image)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [p.name, p.price, p.discount, p.stock, p.slug, p.seller, p.description, p.image]
      );
    }
    console.log("Products inserted successfully");
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

seed();