import { EntityOps } from "./EntityOps";

/**
 * Get the display actions for a given EntityOps map (used by NPCs and Objects/Scenery),
 * including any sub-operations appended in parentheses.
 * @param ops The EntityOps to get actions for.
 * @returns An array of actions, possibly with sub-operations included.
 */
export const getEntityOpsActions = (ops: EntityOps | undefined) => {
  if (!ops) {
    return [];
  }
  return [...ops.values()]
    .map((op) => {
      if (op.text == null || op.text === "null") {
        return undefined;
      }

      const subActions = op.subs
        ? [...op.subs.values()]
            .map((sub) => sub.text)
            .filter(
              (text): text is string => text != null && text !== "null"
            )
        : [];

      return subActions.length > 0
        ? `${op.text} (${subActions.join(", ")})`
        : op.text.trim();
    })
    .filter((action): action is string => action != null && action !== "");
};
