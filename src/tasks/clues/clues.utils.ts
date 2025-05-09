import { MediaWikiBuilder } from "@osrs-wiki/mediawiki-builder";
import { mkdir, writeFile } from "fs/promises";

import { ClueAnswer, ClueChallenge, ClueWieldedItems } from "@/types/clue";
import { CacheProvider, DBRow, Item, NPC, Obj } from "@/utils/cache2";
import { vowel } from "@/utils/string";

export const ITEM_PARAM_ID = 623;

export const getTier = (id: any) => {
  const idString = `${id}`;
  switch (idString) {
    case "0":
      return "beginner";
    case "1":
      return "easy";
    case "2":
      return "medium";
    case "3":
      return "hard";
    case "4":
      return "elite";
    case "5":
      return "master";
    case "6":
      return "quest";
  }
};

export const getTblRegion = (id: any) => {
  const idString = `${id}`;
  switch (idString) {
    case "1":
      return "Misthalin";
    case "2":
      return "Karamja";
    case "3":
      return "Asgarnia";
    case "4":
      return "Kandarin";
    case "5":
      return "Morytania";
    case "6":
      return "Desert";
    case "7":
      return "Tirannwn";
    case "8":
      return "Fremennik";
    case "9":
      return "";
    case "10":
      return "Kourend";
    case "11":
      return "Wilderness";
  }
};

export const getWorldPoint = (val: number) => [
  (val >> 14) & 0x3fff,
  val & 0x3fff,
  (val >> 28) & 3,
];

export const getAnswer = async (
  cache: Promise<CacheProvider>,
  answerIds: (string | number | bigint)[],
  typeOverride?: string
): Promise<ClueAnswer[]> => {
  if (answerIds) {
    const answersPromises = answerIds.map(async (value) => {
      const answerRow = await DBRow.load(cache, value as number);
      const answerValues = answerRow.values;
      const coords: number[] = [];
      let answer;
      let entityName;
      let type;
      if (answerRow.table === 15) {
        const npc = await getNpc(cache, answerValues[0][0] as number);
        entityName = npc.name;
        coords.push(answerValues[2][0] as number);
        answer = answerValues[3][0];
        type = "npc";
      } else if (answerRow.table === 16) {
        const object = await Obj.load(
          cache,
          answerValues[1]?.[0] ?? answerValues[0][0]
        );
        entityName = object.name;
        coords.push(answerValues[2][0] as number);
        answer = answerValues[3].join(", ");
        type = "object";
      } else if (answerRow.table === 18) {
        coords.push(answerValues[0][0] as number);
        answer = answerValues[1].join(", ");
        type = "map";
      } else if (answerRow.table === 19) {
        answer = answerValues[7].join(", ");
        coords.push(answerValues[1][0] as number);
        coords.push(answerValues[4][0] as number);
        type = "key";
      } else if (answerRow.table === 20) {
        answer = answerValues[2][0];
      } else if (answerRow.table === 44) {
        answer = answerValues[1].join(", ");
        type = "music";
      }
      return {
        answer,
        entityName,
        type: typeOverride ?? type,
        worldLocs: coords.map((coord) => getWorldPoint(coord)),
      };
    });
    const answers = await Promise.all(answersPromises);
    return answers;
  }
  return [];
};

export const getChallenge = async (
  cache: Promise<CacheProvider>,
  challengeId?: string | number | bigint
): Promise<ClueChallenge> => {
  let challenge;
  let challengeAnswer;
  if (challengeId) {
    const challengeRow = await DBRow.load(cache, challengeId);
    if (challengeRow.table === 25) {
      // Question & answer
      challenge = `Question: ''${challengeRow.values[0][0] as string}''`;
      challengeAnswer = `Answer: '''${challengeRow.values[0][1] as number}'''`;
    } else if (challengeRow.table === 26) {
      // Puzzle/light box
      challenge = challengeRow.values[0][0];
    } else if (challengeRow.table === 27) {
      // Kill an npc
      //challenge = challengeRow.values[0][0];
      const npc = await getNpc(cache, challengeRow.values[1][0] as number);
      if (npc) {
        challengeAnswer = `Kill ${vowel(npc.name)} [[${npc.name}]].`;
      }
    }
  }
  if (challenge || challengeAnswer) {
    return { task: challenge as string, answer: challengeAnswer as string };
  }
};

export const getRequirements = async (
  cache: Promise<CacheProvider>,
  requirementIds: (string | number | bigint)[]
): Promise<string[]> => {
  if (requirementIds) {
    const requirementPromises = requirementIds?.map(async (value) => {
      const requirementRow = await DBRow.load(cache, value as number);
      let requirement;
      const requirementValues = requirementRow.values;
      if (requirementRow.table === 21) {
        // item requirement
        const item = await Item.load(cache, requirementValues[1][0]);
        const amount = requirementValues[3]?.[0];
        if (item) {
          requirement = `${amount ? amount + " " : ""}[[${item.name}]]`;
        }
      } else if (requirementRow.table === 22) {
        // item category requirement
        requirement = requirementValues[0][0];
      } else if (requirementRow.table === 23) {
        // location and/or quest requirement
        let quest;
        if (requirementValues[1][0]) {
          const questRow = await DBRow.load(cache, requirementValues[1][0]);
          quest = questRow.values[0][0];
        }
        requirement =
          requirementValues[0][0] +
          (quest ? `Completion of [[${quest}]].` : "");
      } else if (requirementRow.table === 24) {
        // skill requirement
        const skill = requirementValues[0][0];
        const level = requirementValues[1][0];
        requirement = `{{SCP|${skill}|${level}|link=yes}}`;
      }
      return requirement as string;
    });

    const requirements = await Promise.all(requirementPromises);
    return requirements;
  } else {
    return [];
  }
};

export const getNpc = async (cache: Promise<CacheProvider>, id: number) => {
  let npc = await NPC.load(cache, id);
  if (npc.name === "null" && npc.multiChildren.length > 0) {
    const multiChildren = npc.multiChildren.filter((multi) => multi > 0);
    if (multiChildren.length > 0) {
      npc = await NPC.load(cache, multiChildren[0]);
    }
  }
  return npc;
};

export const getWieldedItems = async (
  cache: Promise<CacheProvider>,
  ids: (string | number | bigint)[]
): Promise<ClueWieldedItems[]> => {
  if (ids) {
    const wieldedItemsPromises = ids.map<Promise<ClueWieldedItems>>(
      async (id) => {
        const wieldedItemsRow = await DBRow.load(cache, id as number);
        const values = wieldedItemsRow.values;
        return { answer: values[0].join(", ") };
      }
    );
    return await Promise.all(wieldedItemsPromises);
  }
};

export const getTblRegions = (values: (string | number | bigint)[]) =>
  values?.map((region) => getTblRegion(region)).join(",");

export const writeClueFile = async (
  type: string,
  itemName: string,
  clue: string,
  builder: MediaWikiBuilder
) => {
  const formattedClue = (
    clue.length > 20 ? clue.split(".")?.[0] : clue
  ).replaceAll("?", "");
  const dir = `./out/clues/${type}`;
  const fileName = `${dir}/${itemName} - ${formattedClue}.txt`;
  try {
    await mkdir(dir, { recursive: true });
    writeFile(fileName, builder.build());
  } catch (e) {
    console.error(`Error creating clue file: ${fileName}`, e);
  }
};
