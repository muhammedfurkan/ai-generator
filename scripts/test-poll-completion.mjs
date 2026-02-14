// Test pollTaskCompletion function logic
const API_BASE_URL = "https://api.kie.ai/api/v1";
const API_KEY = process.env.NANO_BANANA_API_KEY || process.env.KIE_AI_API_KEY;

const taskId = "749f1bde3269391120d5dccc33099cd0";

async function getTaskStatus(taskId) {
  const url = `${API_BASE_URL}/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`;
  console.log("[Test] Fetching task status from:", url);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
    },
  });

  if (!response.ok) {
    console.error("[Test] HTTP error:", response.status);
    return null;
  }

  const data = await response.json();
  console.log("[Test] Response code:", data.code);
  console.log("[Test] Data state:", data.data?.state);
  
  return data;
}

async function pollTaskCompletion(taskId) {
  const maxAttempts = 5;
  const delayMs = 2000;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    console.log(`\n--- Attempt ${attempt + 1}/${maxAttempts} ---`);
    
    const status = await getTaskStatus(taskId);
    
    if (!status) {
      console.log("[Test] Failed to get status");
      continue;
    }
    
    if (status.code === 200 && status.data) {
      const taskState = status.data.state;
      console.log(`[Test] Task state: ${taskState}`);
      
      if (taskState === "success") {
        console.log("[Test] Task succeeded!");
        
        if (status.data.resultJson) {
          console.log("[Test] resultJson type:", typeof status.data.resultJson);
          console.log("[Test] resultJson:", status.data.resultJson);
          
          let result;
          if (typeof status.data.resultJson === "string") {
            result = JSON.parse(status.data.resultJson);
          } else {
            result = status.data.resultJson;
          }
          
          console.log("[Test] Parsed result:", JSON.stringify(result, null, 2));
          
          const imageUrls = result.resultUrls || result.images || result.output || result.result;
          if (imageUrls && Array.isArray(imageUrls) && imageUrls.length > 0) {
            console.log("[Test] Found image URL:", imageUrls[0]);
            return imageUrls[0];
          }
          
          const singleUrl = result.url || result.imageUrl || result.output_url;
          if (singleUrl) {
            console.log("[Test] Found single URL:", singleUrl);
            return singleUrl;
          }
          
          console.log("[Test] No image URL found in result!");
        } else {
          console.log("[Test] No resultJson found!");
        }
        return null;
      }
      
      if (taskState === "fail") {
        console.log("[Test] Task failed:", status.data.failMsg);
        return null;
      }
      
      console.log("[Test] Task still processing...");
    }
    
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  
  console.log("[Test] Polling timed out");
  return null;
}

async function main() {
  console.log("Testing pollTaskCompletion logic...\n");
  const result = await pollTaskCompletion(taskId);
  console.log("\n=== Final Result ===");
  console.log("Image URL:", result);
}

main().catch(console.error);
