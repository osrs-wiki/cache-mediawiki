import { DBRowID, DBTableID } from "@/utils/cache2/types";

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
