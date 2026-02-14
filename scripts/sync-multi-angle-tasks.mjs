// Sync completed Kie API tasks to database
import mysql from 'mysql2/promise';

const API_BASE_URL = "https://api.kie.ai/api/v1";
const API_KEY = process.env.NANO_BANANA_API_KEY || process.env.KIE_AI_API_KEY;

if (!API_KEY) {
  console.error("API key not found");
  process.exit(1);
}

async function checkTaskStatus(taskId) {
  const url = `${API_BASE_URL}/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
    },
  });

  return await response.json();
}

async function downloadAndUploadToS3(imageUrl, fileName) {
  // For now, just return the original URL
  // In production, this would download and upload to S3
  return imageUrl;
}

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  // Get all processing images
  const [images] = await connection.execute(`
    SELECT id, jobId, angleName, taskId 
    FROM multiAngleImages 
    WHERE status = 'processing' AND taskId IS NOT NULL
  `);
  
  console.log(`Found ${images.length} processing images to check\n`);
  
  let completedCount = 0;
  let failedCount = 0;
  
  for (const img of images) {
    console.log(`Checking task ${img.taskId} for ${img.angleName}...`);
    
    const status = await checkTaskStatus(img.taskId);
    
    if (status.code === 200 && status.data) {
      if (status.data.state === "success") {
        // Parse resultJson
        let imageUrl = null;
        if (status.data.resultJson) {
          try {
            const result = JSON.parse(status.data.resultJson);
            if (result.resultUrls && result.resultUrls.length > 0) {
              imageUrl = result.resultUrls[0];
            }
          } catch (e) {
            console.error("Failed to parse resultJson:", e);
          }
        }
        
        if (imageUrl) {
          // Update database
          await connection.execute(`
            UPDATE multiAngleImages 
            SET status = 'completed', 
                generatedImageUrl = ?, 
                completedAt = NOW() 
            WHERE id = ?
          `, [imageUrl, img.id]);
          
          // Update job completed count
          await connection.execute(`
            UPDATE multiAngleJobs 
            SET completedImages = completedImages + 1 
            WHERE id = ?
          `, [img.jobId]);
          
          console.log(`✅ ${img.angleName} completed: ${imageUrl.substring(0, 60)}...`);
          completedCount++;
        }
      } else if (status.data.state === "fail") {
        await connection.execute(`
          UPDATE multiAngleImages 
          SET status = 'failed', 
              errorMessage = ? 
          WHERE id = ?
        `, [status.data.failMsg || "Unknown error", img.id]);
        
        console.log(`❌ ${img.angleName} failed: ${status.data.failMsg}`);
        failedCount++;
      } else {
        console.log(`⏳ ${img.angleName} still ${status.data.state}`);
      }
    }
  }
  
  // Check if job is complete
  const [jobs] = await connection.execute(`
    SELECT id, totalImages, completedImages 
    FROM multiAngleJobs 
    WHERE status = 'processing'
  `);
  
  for (const job of jobs) {
    if (job.completedImages >= job.totalImages) {
      await connection.execute(`
        UPDATE multiAngleJobs 
        SET status = 'completed', completedAt = NOW() 
        WHERE id = ?
      `, [job.id]);
      console.log(`\n🎉 Job ${job.id} marked as completed!`);
    }
  }
  
  console.log(`\n--- Summary ---`);
  console.log(`Completed: ${completedCount}`);
  console.log(`Failed: ${failedCount}`);
  
  await connection.end();
}

main().catch(console.error);
