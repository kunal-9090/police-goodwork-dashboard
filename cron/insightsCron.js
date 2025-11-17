const cron = require("node-cron");
const axios = require("axios");

// simple example: call summary endpoint daily at 1:00 AM
cron.schedule("0 1 * * *", async () => {
  try {
    await axios.get("http://localhost:5000/api/ai/summary");
    console.log("Daily summary saved");
  } catch (err) {
    console.error("Cron error", err.message);
  }
});
