// worker/worker.js
console.log("Worker service started...");

function runTask() {
  console.log(`[${new Date().toISOString()}] Running background task...`);
}

// Run every 10 seconds
setInterval(runTask, 10 * 1000);
