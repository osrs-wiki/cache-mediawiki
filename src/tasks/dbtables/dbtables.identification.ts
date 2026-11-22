import { readFile } from "fs/promises";

import { DBTableIdentification } from "./dbtables.types";

type DBTableIdentificationRule = DBTableIdentification & {
  match: "exact" | "prefix";
  value: string;
};

export type DBTableIdentificationFile = {
  schemaVersion: number;
  rules: DBTableIdentificationRule[];
};

export const loadDBTableIdentifications = async (
  path: string
): Promise<DBTableIdentificationFile> => {
  const parsed: unknown = JSON.parse(await readFile(path, "utf8"));
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("schemaVersion" in parsed) ||
    !("rules" in parsed) ||
    !Array.isArray(parsed.rules)
  ) {
    throw new Error(`Invalid DBTable identification file: ${path}`);
  }

  const file = parsed as DBTableIdentificationFile;
  if (file.schemaVersion !== 1) {
    throw new Error(
      `Unsupported DBTable identification schema ${file.schemaVersion} in ${path}`
    );
  }

  const validUses = new Set([
    "page",
    "enrichment",
    "feature-data",
    "temporary",
    "technical",
  ]);
  const validConfidences = new Set(["high", "medium", "low"]);
  file.rules.forEach((rule, index) => {
    if (
      typeof rule !== "object" ||
      rule === null ||
      (rule.match !== "exact" && rule.match !== "prefix") ||
      typeof rule.value !== "string" ||
      typeof rule.domain !== "string" ||
      !validUses.has(rule.use) ||
      !validConfidences.has(rule.confidence) ||
      typeof rule.wikiUse !== "string" ||
      (rule.notes !== undefined && typeof rule.notes !== "string")
    ) {
      throw new Error(
        `Invalid DBTable identification rule ${index} in ${path}`
      );
    }
  });

  return file;
};

export const identifyDBTable = (
  file: DBTableIdentificationFile,
  tableName: string
): DBTableIdentification | undefined => {
  const exact = file.rules.find(
    (rule) => rule.match === "exact" && rule.value === tableName
  );
  const prefix = file.rules
    .filter(
      (rule) => rule.match === "prefix" && tableName.startsWith(rule.value)
    )
    .sort((left, right) => right.value.length - left.value.length)[0];
  const rule = exact ?? prefix;
  if (!rule) {
    return undefined;
  }

  return {
    domain: rule.domain,
    use: rule.use,
    confidence: rule.confidence,
    wikiUse: rule.wikiUse,
    notes: rule.notes,
  };
};
