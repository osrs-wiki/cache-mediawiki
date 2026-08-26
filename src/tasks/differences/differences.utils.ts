import { ArchiveDifferences, CacheDifferences, DATABASE_COLUMNS_ARCHIVE, Result } from "./differences.types";

import { ConfigType, GameValType, IndexType } from "@/utils/cache2";

export const configArchiveGameValMap = new Map<number, GameValType>([
  [ConfigType.DbTable, GameValType.DBTables],
  [ConfigType.VarBit, GameValType.VarBits],
  [ConfigType.VarPlayer, GameValType.Varps],
]);

export function isEqualBytes(bytes1: Uint8Array, bytes2: Uint8Array): boolean {
  if (bytes1.length !== bytes2.length) {
    return false;
  }

  for (let i = 0; i < bytes1.length; i++) {
    if (bytes1[i] !== bytes2[i]) {
      return false;
    }
  }

  return true;
}

export const addDatabaseColumnDifferences = (
  differences: CacheDifferences
): void => {
  const configDifferences = differences[IndexType.Configs];
  if (!configDifferences) {
    return;
  }

  const tableDifferences = configDifferences[ConfigType.DbTable];
  if (!tableDifferences) {
    return;
  }

  const columnDifferences: ArchiveDifferences = {};
  let resultId = 0;

  Object.values(tableDifferences).forEach((difference) => {
    const changed = difference.changed;

    if (!changed?.columns) {
      return;
    }

    const columns = changed.columns;

    const oldColumns =
      (columns.oldValue ?? {}) as Record<string, string>;

    const newColumns =
      (columns.newValue ?? {}) as Record<string, string>;

    Object.entries(newColumns).forEach(([column, name]) => {
      if (column in oldColumns) {
        return;
      }

      const result: Result = {
        table: changed.id?.newValue,
        tableName: changed.gameVal?.newValue,
        column: Number(column),
        name,
      };

      columnDifferences[resultId++] = {
        added: result,
      };
    });

    delete changed.columns;
  });

  if (Object.keys(columnDifferences).length > 0) {
    configDifferences[DATABASE_COLUMNS_ARCHIVE] = columnDifferences;
  }
};
