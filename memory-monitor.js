// Memory monitoring script for development
const fs = require('fs');

function logMemoryUsage() {
  const used = process.memoryUsage();
  const timestamp = new Date().toISOString();
  
  const memoryInfo = {
    timestamp,
    rss: Math.round(used.rss / 1024 / 1024) + ' MB',
    heapTotal: Math.round(used.heapTotal / 1024 / 1024) + ' MB',
    heapUsed: Math.round(used.heapUsed / 1024 / 1024) + ' MB',
    external: Math.round(used.external / 1024 / 1024) + ' MB',
    arrayBuffers: Math.round(used.arrayBuffers / 1024 / 1024) + ' MB'
  };
  
  console.log('Memory Usage:', memoryInfo);
  
  // Log to file for analysis
  fs.appendFileSync('memory-usage.log', JSON.stringify(memoryInfo) + '\n');
}

// Monitor memory every 30 seconds
setInterval(logMemoryUsage, 30000);

// Log initial memory usage
logMemoryUsage();

console.log('Memory monitoring started. Check memory-usage.log for detailed logs.');
