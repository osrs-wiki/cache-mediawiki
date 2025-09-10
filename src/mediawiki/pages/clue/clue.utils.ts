import { ClueAnswer, ClueChallenge } from "@/types/clue";
import { lowerCaseFirst } from "@/utils/string";

export const getDirections = (
  type: string,
  answerType: string,
  answer: string
) =>
  `The clue reveals ${
    answerType === "npc"
      ? "who to speak to:"
      : answerType === "object"
      ? "where to search:"
      : answerType === "map"
      ? "where to dig:"
      : ""
  }<br><br>${answer}`;

export const formatAnswers = (
  answers: ClueAnswer[],
  emotes?: number[]
): string => {
  const answer = answers.reduce<string>((total, answer) => {
    const answerString = answer.answer as string;
    let formattedAnswer;
    if (answer.type == "npc" && !answerString.startsWith("Speak")) {
      formattedAnswer = `Speak to [[${answer.entityName}]] ${lowerCaseFirst(
        answerString
      )}`;
    } else if (answer.type == "object" && !answerString.startsWith("Search")) {
      formattedAnswer = `Search the ${answer.entityName.toLowerCase()} near ${lowerCaseFirst(
        answerString
      )}`;
    } else if (answer.type == "map") {
      formattedAnswer = `Dig ${formatMapAnswer(answerString)}`;
    } else if (answer.type == "emote") {
      formattedAnswer = `Perform the ${
        emotes?.length > 0
          ? emotes.map((emote) => `[[${getEmotePage(emote)}]]`).join(" and ") +
            `${emotes.length > 1 ? " emotes" : " emote"}`
          : "emote"
      } near ${lowerCaseFirst(answerString)}`;
    } else {
      formattedAnswer = answer.answer;
    }
    return total + formattedAnswer;
  }, "");
  return answer;
};

export const formatMapAnswer = (answer: string) => {
  let result = answer.replaceAll("fairy ring", "[[fairy ring]]");

  const fairyCode = answer.match(/\([A-Z]+\)/g)?.[0];
  if (fairyCode) {
    result = result.replaceAll(
      fairyCode,
      `{{Fairycode|${fairyCode.replace(/[\(\)]+/g, "")}}}`
    );
  }

  return lowerCaseFirst(result);
};

const emotes: { [key: number]: string } = {
  1: "no",
  2: "bow",
  3: "angry",
  4: "think",
  5: "wave",
  6: "shrug",
  8: "beckon",
  7: "cheer",
  9: "laugh",
  10: "jump for joy",
  11: "yawn",
  12: "dance",
  13: "jig",
  14: "spin",
  15: "headbang",
  16: "cry",
  17: "blow kiss",
  18: "panic",
  19: "raspberry",
  20: "clap",
  21: "salute",
  23: "goblin salute",
  30: "flap",
  31: "slap head",
};

export const getEmotePage = (emote: number): string => {
  return emotes[emote];
};

export const formatChallenges = (challenges?: ClueChallenge[]): string => {
  if (!challenges || challenges.length === 0) {
    return "";
  }

  if (challenges.length === 1) {
    return `\nThe clue has an additional challenge:${
      challenges[0].task ? "\n\n" + challenges[0].task : ""
    }${challenges[0].answer ? "\n\n" : ""}${challenges[0].answer || ""}`;
  } else {
    return `\nThe clue will have one of the following challenges:${challenges.map(
      (challenge) => 
        `\n- ${challenge.task ? challenge.task + (challenge.answer ? "\n  " + challenge.answer : "") : challenge.answer || ""}`
    ).join("")}`;
  }
};
