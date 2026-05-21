/**
 * Zone-based shipping rates (like Flipkart/Amazon India).
 *
 * India is divided into 5 zones from the warehouse origin.
 * Set WAREHOUSE_PINCODE in .env to your fulfillment center's pincode.
 *
 * Zone definitions by first 2 digits of pincode (rough state-level grouping):
 *   Zone A (Local)    — same state as warehouse          → ₹0   extra
 *   Zone B (Regional) — neighboring states               → ₹20  extra
 *   Zone C (National) — rest of India                    → ₹40  extra
 *   Zone D (Remote)   — J&K, NE states, Andaman, Lakshadweep → ₹80 extra
 *
 * This is a simplified model. For production, integrate Shiprocket's
 * rate-card API or Delhivery's serviceability API for accurate rates.
 */

const ZONE_EXTRA_CHARGE = {
  A: 0,   // local / same state
  B: 20,  // regional
  C: 40,  // national
  D: 80,  // remote / difficult
};

// Pincode prefix → zone mapping (first 2 digits of 6-digit pincode)
// Customize based on your warehouse location
const PIN_PREFIX_ZONE = {
  // Maharashtra (warehouse state example — adjust for your state)
  "40": "A", "41": "A", "42": "A", "43": "A", "44": "A",  // Maharashtra
  // Neighboring states → Zone B
  "36": "B", "37": "B", "38": "B", "39": "B",  // Gujarat
  "56": "B", "57": "B", "58": "B", "59": "B",  // Karnataka
  "40": "B", "41": "B",                         // Goa
  // Remote / difficult areas → Zone D
  "19": "D",  // J&K
  "17": "D",  // Himachal
  "74": "D",  // Assam / NE
  "78": "D",  // Assam
  "79": "D",  // Arunachal
  "79": "D",  // Manipur/Nagaland/Mizoram
  "74": "D",  // Meghalaya
  "79": "D",  // Tripura
  "74": "D",  // Sikkim
  "74": "D",  // Andaman & Nicobar
  "68": "D",  // Lakshadweep/Kerala islands
  // Everything else → Zone C (national)
};

/**
 * Returns the extra charge for delivering to a given pincode.
 * Falls back to Zone C (₹40) if pincode is unknown.
 */
function getZoneCharge(pincode) {
  if (!pincode || !/^\d{6}$/.test(String(pincode))) return ZONE_EXTRA_CHARGE.C;
  const prefix = String(pincode).slice(0, 2);
  const zone = PIN_PREFIX_ZONE[prefix] || "C";
  return ZONE_EXTRA_CHARGE[zone] || 0;
}

function getZoneName(pincode) {
  if (!pincode || !/^\d{6}$/.test(String(pincode))) return "National";
  const prefix = String(pincode).slice(0, 2);
  const zone = PIN_PREFIX_ZONE[prefix] || "C";
  return { A: "Local", B: "Regional", C: "National", D: "Remote" }[zone] || "National";
}

module.exports = { getZoneCharge, getZoneName, ZONE_EXTRA_CHARGE };
