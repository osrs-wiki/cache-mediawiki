import { BaseVarType } from "@/utils/cache2/ScriptVarType";
import { DBRowID, DBTableID, ScriptVarID } from "@/utils/cache2/types";

export type DBTableCSVRow = {
  row_id: DBRowID;
  row_name?: string;
  [columnName: string]: string | number | boolean | undefined;
};

export type DBTableInfo = {
  id: DBTableID;
  name: string;
  columnNames: Map<number, string>;
  rowCount: number;
};

export type DBTableExportResult = {
  tableId: DBTableID;
  tableName: string;
  filename: string;
  rowCount: number;
  error?: string;
};

export type SerializedDBValue = string | number | bigint;

export type DBTableCatalogType = {
  id: ScriptVarID;
  name?: string;
  jagexName?: string;
  typeName?: string;
  baseType?: BaseVarType;
};

export type DBTableCatalogColumn = {
  index: number;
  name: string;
  types: DBTableCatalogType[];
  defaultValues: SerializedDBValue[];
};

export type DBTableCatalogRow = {
  id: DBRowID;
  name?: string;
  values: (SerializedDBValue[] | null)[];
  effectiveValues: (SerializedDBValue[] | null)[];
  typeIds: (ScriptVarID[] | null)[];
};

export type DBTableCatalogTable = {
  id: DBTableID;
  name: string;
  schemaLight: boolean;
  identification?: DBTableIdentification;
  rowCount: number;
  columns: DBTableCatalogColumn[];
  rows: DBTableCatalogRow[];
};

export type DBTableIdentification = {
  domain: string;
  use: "page" | "enrichment" | "feature-data" | "temporary" | "technical";
  confidence: "high" | "medium" | "low";
  wikiUse: string;
  notes?: string;
};

export type DBTableCatalog = {
  schemaVersion: 1;
  cacheVersion: string;
  tableCount: number;
  rowCount: number;
  schemaTableCount: number;
  schemaLightTableCount: number;
  tables: DBTableCatalogTable[];
};
