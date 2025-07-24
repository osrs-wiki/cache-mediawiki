export const capitalize = (word: string) =>
  word.charAt(0).toUpperCase() + word.slice(1);

export const lowerCaseFirst = (value: string) =>
  value.charAt(0).toLowerCase() + value.slice(1);

export const vowel = (noun: string) => {
  const vowels = ["a", "e", "i", "o", "u"];
  const startsWith = vowels.filter((vowel) =>
    noun
      .toLocaleLowerCase()
      .replaceAll(/[^a-z]/g, "")
      .startsWith(vowel)
  );
  return startsWith.length > 0 ? "an" : "a";
};

/**
 * Strip HTML tags from a string for display purposes.
 * @param text The text that may contain HTML tags
 * @returns The text with HTML tags removed
 */
export const stripHtmlTags = (text: string): string => {
  return text.replaceAll(/<[^>]*>/g, "");
};
