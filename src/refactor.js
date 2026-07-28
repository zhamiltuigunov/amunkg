const fs = require('fs');
const content = fs.readFileSync('src/components/UserCabinet.tsx', 'utf-8');
const lines = content.split('\n');

const startIndex = 1664;
const endIndex = 1838;

console.log("Start line:", lines[startIndex]);
console.log("End line:", lines[endIndex]);
console.log("Line 3624:", lines[3623]);
