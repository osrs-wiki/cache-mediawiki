/**
 * Formats the given bonus value.
 * @param bonus The bonus to format. Can be a string or a number.
 * @returns A formatted string representing the bonus.
 */
export const formatBonus = (bonus: string | number) => {
  const numberBonus = typeof bonus === "string" ? parseInt(bonus) : bonus;
  return numberBonus > 0 ? `+${bonus}` : numberBonus < 0 ? `-${bonus}` : "0";
};
