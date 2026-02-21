// Check Kie API task status for multi-angle images
const API_BASE_URL = "https://api.kie.ai/api/v1";
const API_KEY = process.env.NANO_BANANA_API_KEY || process.env.KIE_AI_API_KEY;

if (!API_KEY) {
  console.error("API key not found");
  process.exit(1);
}

// Task IDs from database
const taskIds = [
  "749f1bde3269391120d5dccc33099cd0", // front facing mid shot
  "5050a78e93c65f56fcac3c8daf0f4ae5", // front close-up portrait
  "3ab780559335ad08f4849d4375fcbd3a", // three quarter angle left
];

async function checkTaskStatus(taskId) {
  const url = `${API_BASE_URL}/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
  });

  const data = await response.json();
  return data;
}

async function main() {
  console.log("Checking Kie API task statuses...\n");

  for (const taskId of taskIds) {
    console.log(`Task: ${taskId}`);
    const status = await checkTaskStatus(taskId);
    console.log("Status:", JSON.stringify(status, null, 2));
    console.log("---");
  }
}

main().catch(console.error);
