/**
 * Multi-Angle Photo Generator için kapak görseli oluşturma scripti
 * Nano Banana Pro API kullanarak
 */

const API_BASE_URL = "https://api.kie.ai/api/v1";
const API_KEY = process.env.NANO_BANANA_API_KEY || process.env.KIE_AI_API_KEY;

if (!API_KEY) {
  console.error(
    "API key not found. Set NANO_BANANA_API_KEY or KIE_AI_API_KEY environment variable."
  );
  process.exit(1);
}

// Multi-Angle konseptini gösteren prompt
const prompt = `Professional photography studio setup showing multiple camera angles concept. 
A beautiful female model photographed from 9 different angles displayed in a creative grid layout.
Each angle shows: front view, side profile, three-quarter view, back view, looking up, looking down.
Modern minimalist studio with soft lighting, clean white background.
Professional fashion photography, high-end commercial quality.
The composition shows the concept of "multi-angle photography" in an artistic way.
Ultra high quality, 4K resolution, sharp details, professional lighting.`;

async function createTask() {
  console.log("Creating generation task...");
  console.log("Prompt:", prompt);

  const payload = {
    model: "nano-banana-pro",
    input: {
      prompt: prompt,
      aspect_ratio: "16:9",
      resolution: "4K",
      output_format: "png",
    },
  };

  const response = await fetch(`${API_BASE_URL}/jobs/createTask`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  console.log("Create task response:", JSON.stringify(data, null, 2));

  if (data.code === 200 && data.data?.taskId) {
    return data.data.taskId;
  }

  throw new Error(`Failed to create task: ${JSON.stringify(data)}`);
}

async function pollTaskStatus(taskId) {
  console.log(`Polling task status for: ${taskId}`);

  const maxAttempts = 60;
  const pollInterval = 5000; // 5 seconds

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await fetch(
      `${API_BASE_URL}/jobs/getTaskStatus?taskId=${taskId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );

    const data = await response.json();
    console.log(`Attempt ${attempt + 1}: State = ${data.data?.state}`);

    if (data.data?.state === "success") {
      const resultJson = data.data.resultJson;
      if (resultJson) {
        const result = JSON.parse(resultJson);
        const imageUrl = result.images?.[0]?.url || result.url;
        console.log("\n✅ Generation successful!");
        console.log("Image URL:", imageUrl);
        return imageUrl;
      }
    } else if (data.data?.state === "fail") {
      throw new Error(`Generation failed: ${data.data.failMsg}`);
    }

    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  throw new Error("Timeout waiting for generation");
}

async function downloadImage(url, filename) {
  console.log(`Downloading image to ${filename}...`);

  const response = await fetch(url);
  const buffer = await response.arrayBuffer();

  const fs = await import("fs");
  fs.writeFileSync(filename, Buffer.from(buffer));

  console.log(`✅ Image saved to ${filename}`);
}

async function main() {
  try {
    const taskId = await createTask();
    const imageUrl = await pollTaskStatus(taskId);

    // Download to covers folder
    const outputPath =
      "/home/ubuntu/nano-influencer/client/public/covers/multi-angle.jpg";
    await downloadImage(imageUrl, outputPath);

    console.log("\n🎉 Multi-Angle cover image generated successfully!");
    console.log("Path:", outputPath);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

main();
