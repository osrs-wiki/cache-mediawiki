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
      const actions = [
        ...(op.text != null && op.text !== "null"
          ? [{ text: op.text, conditional: false }]
          : []),
        ...(op.conditionals ?? [])
          .filter(({ text }) => text !== "null" && text.trim() !== "")
          .map(({ text }) => ({ text, conditional: true })),
      ];
      const subActions = op.subs
        ? [...op.subs.values()]
            .flatMap((sub) => [
              ...(sub.text != null && sub.text !== "null" ? [sub.text] : []),
              ...(sub.conditionals ?? [])
                .filter(({ text }) => text !== "null" && text.trim() !== "")
                .map(({ text }) => `${text} (conditional)`),
            ])
            .filter((text) => text.trim() !== "")
        : [];

      if (actions.length === 0) {
        return subActions.length > 0 ? subActions : undefined;
      }

      return actions.map(({ text, conditional }) => {
        const action = conditional ? `${text} (conditional)` : text.trim();
        return subActions.length > 0
          ? `${action} (${subActions.join(", ")})`
          : action;
      });
    })
    .flat()
    .filter((action): action is string => action != null && action !== "");
};
