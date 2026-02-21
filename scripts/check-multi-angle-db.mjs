import mysql from "mysql2/promise";

const connection = await mysql.createConnection(process.env.DATABASE_URL);

const [images] = await connection.execute(`
  SELECT id, jobId, angleName, status, taskId, 
         LEFT(generatedImageUrl, 80) as imageUrl, 
         errorMessage 
  FROM multiAngleImages 
  ORDER BY id DESC 
  LIMIT 15
`);

console.log("Multi-Angle Images:");
console.table(images);

const [jobs] = await connection.execute(`
  SELECT id, status, totalImages, completedImages, createdAt 
  FROM multiAngleJobs 
  ORDER BY id DESC 
  LIMIT 5
`);

console.log("\nMulti-Angle Jobs:");
console.table(jobs);

await connection.end();
