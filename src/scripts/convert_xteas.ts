import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

/**
 * Converts XTEA keys from text format to JSON format.
 *
 * Input format:
 * 15_32 [1854092003] [-1577713282] [-1129932690] [-1368605209]
 * 15_33 [-1143763779] [-487682602] [-1771881584] [1992595329]
 *
 * Output format:
 * [
 *   {"region": 10794, "keys": [-1326980744, 1301347657, 2140854312, 605693161]},
 *   ...
 * ]
 *
 * Where region = ((x << 8) | y)
 */

interface XteaEntry {
  region: number;
  keys: number[];
}

function convertXteas(inputPath: string, outputPath: string): void {
  const content = readFileSync(inputPath, "utf-8");
  const lines = content.split("\n").filter((line) => line.trim());

  const entries: XteaEntry[] = [];

  for (const line of lines) {
    // Parse line format: "15_32 [1854092003] [-1577713282] [-1129932690] [-1368605209]"
    const match = line.match(
      /^(\d+)_(\d+)\s+\[([^\]]+)\]\s+\[([^\]]+)\]\s+\[([^\]]+)\]\s+\[([^\]]+)\]$/
    );

    if (!match) {
      console.warn(`Skipping invalid line: ${line}`);
      continue;
    }

    const x = parseInt(match[1], 10);
    const y = parseInt(match[2], 10);
    const key1 = parseInt(match[3], 10);
    const key2 = parseInt(match[4], 10);
    const key3 = parseInt(match[5], 10);
    const key4 = parseInt(match[6], 10);

    // Calculate region ID: ((x << 8) | y)
    const region = (x << 8) | y;

    entries.push({
      region,
      keys: [key1, key2, key3, key4],
    });
  }

  // Write JSON output
  const json = JSON.stringify(entries, null, 2);
  writeFileSync(outputPath, json, "utf-8");

  console.log(`Converted ${entries.length} XTEA entries`);
  console.log(`Output written to: ${outputPath}`);
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error("Usage: ts-node convert_xteas.ts <input-file> <output-file>");
    console.error("Example: ts-node convert_xteas.ts xteas.txt xteas.json");
    process.exit(1);
  }

  const inputPath = resolve(args[0]);
  const outputPath = resolve(args[1]);

  try {
    convertXteas(inputPath, outputPath);
  } catch (error) {
    console.error("Error converting XTEAs:", error);
    process.exit(1);
  }
}

export { convertXteas };
