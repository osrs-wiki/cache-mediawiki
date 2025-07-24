import { stripHtmlTags } from "./string";

console.log("Testing HTML tag stripping functionality...\n");

// Test the utility function directly
console.log("Testing stripHtmlTags utility:");
const testNames = [
  "<col=00ffff>Tornado</col>",
  "<col=ff0000>Red Chest</col>",
  "Normal Name",
  "<b>Bold</b> and <i>italic</i>",
];

testNames.forEach(name => {
  console.log(`  "${name}" → "${stripHtmlTags(name)}"`);
});

console.log("\nTest completed! HTML tags should be stripped from all outputs.");