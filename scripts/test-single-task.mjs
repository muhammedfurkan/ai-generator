// Test single task status check
const API_BASE_URL = "https://api.kie.ai/api/v1";
const API_KEY = process.env.NANO_BANANA_API_KEY || process.env.KIE_AI_API_KEY;

const taskId = "749f1bde3269391120d5dccc33099cd0";

async function getTaskStatus() {
  const url = `${API_BASE_URL}/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`;
  console.log("Fetching from:", url);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
  });

  console.log("Response status:", response.status);
  console.log("Response ok:", response.ok);

  const data = await response.json();
  console.log("\nFull response:");
  console.log(JSON.stringify(data, null, 2));

  console.log("\nData state:", data.data?.state);
  console.log("ResultJson:", data.data?.resultJson);

  if (data.data?.resultJson) {
    const result = JSON.parse(data.data.resultJson);
    console.log("\nParsed resultJson:");
    console.log(JSON.stringify(result, null, 2));

    if (result.resultUrls) {
      console.log("\nImage URL:", result.resultUrls[0]);
    }
  }
}

getTaskStatus().catch(console.error);
