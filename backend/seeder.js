// /**
//  * ═══════════════════════════════════════════════════════════
//  *  Raphaaa — Database Seeder
//  * ═══════════════════════════════════════════════════════════
//  *
//  *  USAGE (from the /backend directory):
//  *
//  *    Seed sample data:
//  *      npm run seed          →  node seeder.js --seed
//  *
//  *    Destroy ALL data:
//  *      node seeder.js --destroy
//  *
//  *    Seed WITHOUT deleting existing data:
//  *      node seeder.js --append
//  *
//  * ═══════════════════════════════════════════════════════════
//  */

// const mongoose  = require("mongoose");
// const dotenv    = require("dotenv");

// // ── Models ───────────────────────────────────────────────
// const Product    = require("./models/Product");
// const User       = require("./models/User");
// const Cart       = require("./models/Cart");
// const Order      = require("./models/Order");

// // ── Sample product data ───────────────────────────────────
// const rawProducts = require("./data/products");

// dotenv.config();

// // ── Connect ───────────────────────────────────────────────
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log("\n✅  MongoDB connected"))
//   .catch((err) => { console.error("❌  MongoDB connection failed:", err.message); process.exit(1); });

// // ══════════════════════════════════════════════════════════
// //  SEED USERS
// // ══════════════════════════════════════════════════════════
// const usersToSeed = [
//   {
//     name:     "Admin User",
//     email:    "admin@raphaaa.com",
//     password: "Admin@1234",          // plain — hashed below
//     role:     "admin",
//     mobile:   "9999999999",
//   },
//   {
//     name:     "Merchandise Manager",
//     email:    "merch@raphaaa.com",
//     password: "Merch@1234",
//     role:     "merchantise",
//     mobile:   "8888888888",
//   },
//   {
//     name:     "Demo Customer",
//     email:    "customer@raphaaa.com",
//     password: "Customer@1234",
//     role:     "customer",
//     mobile:   "7777777777",
//   },
// ];

// // ══════════════════════════════════════════════════════════
// //  DESTROY ALL DATA
// // ══════════════════════════════════════════════════════════
// const destroyData = async () => {
//   try {
//     console.log("\n🗑️   Deleting all data…");
//     await Promise.all([
//       Product.deleteMany(),
//       User.deleteMany(),
//       Cart.deleteMany(),
//       Order.deleteMany(),
//     ]);
//     console.log("✅  All data deleted successfully!\n");
//     process.exit();
//   } catch (err) {
//     console.error("❌  Destroy failed:", err.message);
//     process.exit(1);
//   }
// };

// // ══════════════════════════════════════════════════════════
// //  SEED DATA
// // ══════════════════════════════════════════════════════════
// const seedData = async (append = false) => {
//   try {
//     if (!append) {
//       console.log("\n🗑️   Clearing existing data…");
//       await Promise.all([
//         Product.deleteMany(),
//         User.deleteMany(),
//         Cart.deleteMany(),
//         Order.deleteMany(),
//       ]);
//       console.log("✅  Cleared.");
//     } else {
//       console.log("\n➕  Append mode — existing data will NOT be deleted.");
//     }

//     // ── Create users ─────────────────────────────────────
//     // NOTE: Pass PLAIN TEXT passwords — User model's pre-save hook hashes them.
//     //       Do NOT pre-hash here; doing so would cause double-hashing and break login.
//     console.log("\n👤  Creating users…");
//     const createdUsers = await Promise.all(
//       usersToSeed.map((u) => User.create(u))   // pre-save hook handles hashing
//     );

//     const adminUser = createdUsers.find((u) => u.role === "admin");
//     console.log(`   ✅  ${createdUsers.length} users created`);
//     console.log(`   📧  Admin → ${adminUser.email}  |  Password → Admin@1234`);

//     // ── Create products (assigned to admin) ──────────────
//     console.log("\n📦  Seeding products…");
//     const productsWithUser = rawProducts.map((p) => ({
//       ...p,
//       user: adminUser._id,
//       // Ensure required fields have defaults
//       sku:          p.sku          || `SKU-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
//       collections:  p.collections  || "General",
//       countInStock: p.countInStock ?? 10,
//       variants:     p.variants     || [],
//       colorVariants:p.colorVariants|| [],
//     }));

//     const inserted = await Product.insertMany(productsWithUser);
//     console.log(`   ✅  ${inserted.length} products seeded`);

//     // ── Summary ──────────────────────────────────────────
//     console.log("\n══════════════════════════════════════════════");
//     console.log("  🎉  Database seeded successfully!");
//     console.log("══════════════════════════════════════════════");
//     console.log("\n  Accounts created:");
//     usersToSeed.forEach((u) => {
//       console.log(`    • [${u.role.padEnd(12)}]  ${u.email.padEnd(30)}  pw: ${u.password}`);
//     });
//     console.log("\n  Products inserted:", inserted.length);
//     console.log("\n  Run your server with:  npm run dev\n");

//     process.exit();
//   } catch (err) {
//     console.error("\n❌  Seeding failed:", err.message);
//     if (err.errors) {
//       Object.values(err.errors).forEach((e) => console.error("   →", e.message));
//     }
//     process.exit(1);
//   }
// };

// // ══════════════════════════════════════════════════════════
// //  ENTRY POINT — read CLI flag
// // ══════════════════════════════════════════════════════════
// const flag = process.argv[2]; // e.g. "--seed" | "--destroy" | "--append"

// if (flag === "--destroy") {
//   destroyData();
// } else if (flag === "--append") {
//   seedData(true);   // seed without clearing
// } else {
//   seedData(false);  // default: clear then seed
// }
