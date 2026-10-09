// Fake database. You don't need to modify this file.
// It simulates a slow DB (1 second delay) and a DB failure.

const SHIPMENTS = {
  "SWX-1001": { trackingNumber: "SWX-1001", status: "Pending",    lastUpdate: "2026-10-01T09:00:00Z" },
  "SWX-1002": { trackingNumber: "SWX-1002", status: "In Transit", lastUpdate: "2026-10-02T14:30:00Z" },
  "SWX-1003": { trackingNumber: "SWX-1003", status: "Delivered",  lastUpdate: "2026-10-03T18:45:00Z" },
};

export async function getShipment(trackingNumber) {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (trackingNumber === "SWX-9999") {
    throw new Error("Database connection lost"); // simulated DB failure
  }

  return SHIPMENTS[trackingNumber] ?? null; // null = not found
}
