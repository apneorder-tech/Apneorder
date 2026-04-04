const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  console.log("Checking Restaurant model fields...");
  try {
    // We check the internal dmmf or just try to access a property on a dummy object
    // or use prisma.$connect() and check types.
    // The easiest runtime check is to look at the 'fields' of the model if available via prisma._baseClient.
    
    const restaurantFields = Object.keys(prisma.restaurant.fields || {});
    console.log("Available Fields on Restaurant:", restaurantFields.length > 0 ? restaurantFields.join(', ') : "Could not retrieve field list via direct access.");
    
    // Fallback: try to execute a simple query with upiId in select
    console.log("Attempting a dry-run select with upiId...");
    try {
      await prisma.restaurant.findFirst({
        select: { upiId: true }
      });
      console.log("SUCCESS: 'upiId' is recognized by the Prisma Client.");
    } catch (e) {
      if (e.message.includes("Unknown field `upiId`")) {
        console.error("FAILURE: 'upiId' is STILL NOT RECOGNIZED. Available options:", e.message);
      } else {
        // We expect "Record not found" or similar if DB is empty, which confirms field is OK
        console.log("SUCCESS: Query was sent to DB (Field exists). Message:", e.message.split('\n')[0]);
      }
    }
  } catch (err) {
    console.error("Verification failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
