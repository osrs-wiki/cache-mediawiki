import { cacheListeners } from "./types";
import { FileContext } from "../differences.types";

export const executeListeners = async (
  oldFile?: FileContext,
  newFile?: FileContext
) => {
  const indexId = oldFile?.index?.id ?? newFile?.index?.id;

  // Check for and execute cache change listeners
  try {
    const archiveId = oldFile?.archive?.archive ?? newFile?.archive?.archive;
    const fileId = oldFile?.file?.id ?? newFile?.file?.id;

    const matchingListeners = cacheListeners.filter(
      (listener) =>
        listener.index === indexId &&
        (listener.archive === undefined || listener.archive === archiveId) &&
        (listener.file === undefined || listener.file === fileId)
    );

    if (matchingListeners.length > 0) {
      console.debug(
        `Found ${matchingListeners.length} listener(s) for [index=${indexId}][archive=${archiveId}][file=${fileId}]`
      );

      await Promise.all(
        matchingListeners.map(async (listener) => {
          try {
            console.debug(
              `Executing cache change listener for [index=${indexId}][archive=${archiveId}][file=${fileId}]`
            );
            await listener.handler({ oldFile, newFile });
          } catch (error) {
            console.error(`Error executing listener:`, error);
          }
        })
      );
    }
  } catch (error) {
    console.error("Error executing cache change listeners:", error);
  }
};
