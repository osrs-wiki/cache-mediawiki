import { exec } from "child_process";
import { promisify } from "util";
import { readFile, rm } from "fs/promises";
import { existsSync } from "fs";

const execAsync = promisify(exec);

export interface CLITestOptions {
  command: string;
  args: string[];
  expectedOutputFile?: string;
  timeout?: number;
}

export interface CLITestResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  outputContent?: string;
}

/**
 * Runs a CLI command and optionally reads output file content
 */
export async function runCLICommand(options: CLITestOptions): Promise<CLITestResult> {
  const { command, args, expectedOutputFile, timeout = 30000 } = options;
  
  // Clean up any existing output files before running
  if (expectedOutputFile && existsSync(expectedOutputFile)) {
    await rm(expectedOutputFile, { force: true });
  }

  const fullCommand = `${command} ${args.join(" ")}`;
  
  try {
    const { stdout, stderr } = await execAsync(fullCommand, {
      timeout,
      cwd: process.cwd(),
    });

    let outputContent: string | undefined;
    
    // Read output file if specified and exists
    if (expectedOutputFile && existsSync(expectedOutputFile)) {
      outputContent = await readFile(expectedOutputFile, "utf-8");
    }

    return {
      stdout,
      stderr,
      exitCode: 0,
      outputContent,
    };
  } catch (error: any) {
    return {
      stdout: error.stdout || "",
      stderr: error.stderr || "",
      exitCode: error.code || 1,
      outputContent: undefined,
    };
  }
}

/**
 * Clean up output directory after tests
 */
export async function cleanupOutput(): Promise<void> {
  const outDir = "./out";
  if (existsSync(outDir)) {
    await rm(outDir, { recursive: true, force: true });
  }
}