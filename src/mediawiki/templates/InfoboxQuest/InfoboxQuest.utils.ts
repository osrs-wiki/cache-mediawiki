import { Quest } from "@/types/quest";

/**
 * Formats a quest series string with series number
 */
export const formatQuestSeries = (quest: Quest): string | undefined => {
  if (!quest.series) {
    return undefined;
  }

  let formattedSeries = quest.series;

  if (quest.seriesno > 0) {
    formattedSeries += `, #${quest.seriesno}`;
  } else if (quest.seriesnoOverride > 0) {
    formattedSeries += `, #${quest.seriesnoOverride}`;
  }

  return formattedSeries;
};

/**
 * Formats the quest release date
 */
export const formatReleaseDate = (releasedate: string): string | undefined => {
  if (!releasedate) {
    return undefined;
  }

  // If it's already in a wiki format, return as is
  if (releasedate.includes("[[") && releasedate.includes("]]")) {
    return releasedate;
  }

  // Try to parse and format date
  try {
    const date = new Date(releasedate);
    if (isNaN(date.getTime())) {
      return releasedate; // Return original if not parseable
    }

    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `[[${day} ${month}]] [[${year}]]`;
  } catch {
    return releasedate; // Return original if parsing fails
  }
};

/**
 * Formats quest image filename
 */
export const formatQuestImage = (quest: Quest): string | undefined => {
  if (!quest.displayname) {
    return undefined;
  }

  return `[[File:${quest.displayname}.png|300px]]`;
};
