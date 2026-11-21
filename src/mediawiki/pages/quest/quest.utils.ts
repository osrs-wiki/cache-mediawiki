import {
  questDifficultyEnumId,
  questLengthEnumId,
  questLocationEnumId,
  questSeriesEnumId,
  questSkillEnumId,
} from "./quest.constants";

import {
  BoostableTemplate,
  QuestreqstartTemplate,
  SCPTemplate,
} from "@/mediawiki/templates";
import { Quest, QuestPrerequisite, QuestStatRequirement } from "@/types/quest";
import {
  CacheProvider,
  DBRow,
  DBTable,
  Enum,
  NPC,
  Obj,
  Position,
} from "@/utils/cache2";

type Value = string | number | bigint | undefined;

const valueFor = (table: DBTable, row: DBRow, column: number): Value[] =>
  row.values[column] ?? table.defaultValues[column] ?? [];

const numberFor = (table: DBTable, row: DBRow, column: number): number => {
  const value = valueFor(table, row, column)[0];
  return typeof value === "number" ? value : 0;
};

const stringFor = (table: DBTable, row: DBRow, column: number): string => {
  const value = valueFor(table, row, column)[0];
  return typeof value === "string" ? value : "";
};

export const cacheXpToWikiXp = (cacheXp: number): number =>
  Math.floor(cacheXp / 10);

const statRequirementsFor = (
  table: DBTable,
  row: DBRow,
  column: number,
  skillNames: Map<string | number | bigint, string | number | bigint>
): QuestStatRequirement[] => {
  const values = valueFor(table, row, column);
  const requirements: QuestStatRequirement[] = [];

  for (let index = 0; index < values.length; index += 2) {
    const skill = values[index];
    const level = values[index + 1];
    if (typeof skill === "number" && typeof level === "number") {
      requirements.push({
        skill,
        level,
        skillName: `${skillNames.get(skill) ?? `Skill ${skill}`}`,
      });
    }
  }

  return requirements;
};

const dbRowsFor = (table: DBTable, row: DBRow, column: number): number[] =>
  valueFor(table, row, column).filter(
    (value): value is number => typeof value === "number"
  );

const loadPrerequisite = async (
  cache: Promise<CacheProvider>,
  table: DBTable,
  rowId: number,
  ancestors: Set<number>
): Promise<QuestPrerequisite | undefined> => {
  if (ancestors.has(rowId)) return undefined;

  const row = await DBRow.load(cache, rowId);
  if (!row || row.table !== 0) return undefined;

  const branch = new Set(ancestors);
  branch.add(rowId);

  const prerequisiteIds = dbRowsFor(table, row, 25);
  const prerequisites = (
    await Promise.all(
      prerequisiteIds.map((id) => loadPrerequisite(cache, table, id, branch))
    )
  ).filter((quest): quest is QuestPrerequisite => quest !== undefined);

  return {
    rowId,
    name: stringFor(table, row, 2) || stringFor(table, row, 1),
    prerequisites,
  };
};

export const dbRowToQuest = async (
  cache: Promise<CacheProvider>,
  row: DBRow
): Promise<Quest> => {
  const table = await DBTable.load(cache, 0);
  if (!table) {
    throw new Error("Quest DBTable 0 could not be loaded.");
  }
  const [skillNames, difficultyNames, lengthNames, locationNames, seriesNames] =
    await Promise.all([
      Enum.load(cache, questSkillEnumId).then(
        (value) => value?.map ?? new Map()
      ),
      Enum.load(cache, questDifficultyEnumId).then(
        (value) => value?.map ?? new Map()
      ),
      Enum.load(cache, questLengthEnumId).then(
        (value) => value?.map ?? new Map()
      ),
      Enum.load(cache, questLocationEnumId).then(
        (value) => value?.map ?? new Map()
      ),
      Enum.load(cache, questSeriesEnumId).then(
        (value) => value?.map ?? new Map()
      ),
    ]);

  const releaseValues = valueFor(table, row, 9);
  const startPacked = numberFor(table, row, 13);
  const startCoordinate =
    startPacked > 0 ? Position.fromPacked(startPacked) : undefined;
  const startNpcIds = dbRowsFor(table, row, 14);
  const startNpc = startNpcIds.length
    ? await Promise.all(
        startNpcIds.map(async (id) => {
          const npc = await NPC.load(cache, id);
          return npc ? npc.getName(cache) : undefined;
        })
      )
    : [];
  const startObjectIds = dbRowsFor(table, row, 15);
  const startObjectNames = startObjectIds.length
    ? (await Promise.all(startObjectIds.map((id) => Obj.load(cache, id))))
        .filter((object): object is Obj => object !== undefined)
        .map((object) => object.name)
    : [];
  const questPointsOverride = numberFor(table, row, 17);
  const questType = numberFor(table, row, 4);
  const prerequisiteIds = dbRowsFor(table, row, 25);
  const questRequirements = (
    await Promise.all(
      prerequisiteIds.map((id) =>
        loadPrerequisite(cache, table, id, new Set([row.id]))
      )
    )
  ).filter((quest): quest is QuestPrerequisite => quest !== undefined);
  const releaseDate =
    releaseValues.length === 3 &&
    releaseValues.every(
      (value): value is number => typeof value === "number" && value > 0
    )
      ? new Date(releaseValues[2], releaseValues[1] - 1, releaseValues[0])
      : undefined;
  const series = numberFor(table, row, 10);
  const seriesNumberOverride = valueFor(table, row, 12);

  return {
    rowId: row.id,
    id: numberFor(table, row, 0),
    sortName: stringFor(table, row, 1),
    name: stringFor(table, row, 2) || stringFor(table, row, 1),
    releaseType: numberFor(table, row, 3),
    type: questType,
    members: numberFor(table, row, 5) === 1,
    difficulty: numberFor(table, row, 6),
    difficultyName: `${difficultyNames.get(numberFor(table, row, 6)) ?? ""}`,
    length: numberFor(table, row, 7),
    lengthName: `${lengthNames.get(numberFor(table, row, 7)) ?? ""}`,
    releaseDate,
    series: series >= 0 ? series : undefined,
    seriesName:
      series >= 0
        ? `${seriesNames.get(series) ?? `Series ${series}`}`
        : undefined,
    seriesNumber: numberFor(table, row, 11),
    seriesNumberOverride:
      seriesNumberOverride[0] === 1 &&
      typeof seriesNumberOverride[1] === "string"
        ? seriesNumberOverride[1]
        : undefined,
    startCoordinate: startCoordinate
      ? {
          x: startCoordinate.x,
          y: startCoordinate.y,
          plane: startCoordinate.z,
        }
      : undefined,
    startNpcName: startNpc.find((name) => name && name !== "null"),
    startObjectName: startObjectNames.find(
      (name) => name.length > 0 && name !== "null"
    ),
    startAreaName:
      `${locationNames.get(numberFor(table, row, 8)) ?? ""}` || undefined,
    questPoints:
      questPointsOverride >= 0 ? questPointsOverride : questType === 0 ? 1 : 0,
    requiredStats: statRequirementsFor(table, row, 23, skillNames),
    recommendedStats: statRequirementsFor(table, row, 24, skillNames),
    questRequirements,
    requiredQuestPoints: numberFor(table, row, 26),
    requiredCombatLevel: numberFor(table, row, 27),
    recommendedCombatLevel: numberFor(table, row, 28),
    requirementsBoostable: numberFor(table, row, 30) === 1,
    requirementCheckSkillsOnStart: numberFor(table, row, 29) === 1,
    description: stringFor(table, row, 40) || undefined,
    awardedStats: statRequirementsFor(table, row, 33, skillNames).map(
      (reward) => ({
        ...reward,
        level: cacheXpToWikiXp(reward.level),
      })
    ),
  };
};

export const formatSCP = (skill: string, level?: number, link = true): string =>
  new SCPTemplate({ skill, level, link }).build().build().replace(/\n$/, "");

export const formatSeries = (quest: Quest): string => {
  if (quest.series === undefined) return "None";

  const series = quest.seriesName ?? `Series ${quest.series}`;
  const number = quest.seriesNumberOverride || quest.seriesNumber?.toString();
  return `[[Quests/Series#${series}|${series}]]${number ? `, #${number}` : ""}`;
};

export const formatQuestRequirements = (quest: Quest): string => {
  const lines: string[] = [];

  quest.requiredStats.forEach(({ skillName, level }) => {
    const boostable = new BoostableTemplate({
      boostable: quest.requirementsBoostable,
    })
      .build()
      .build()
      .trimEnd();
    const requiredAtStart = new QuestreqstartTemplate({
      required: quest.requirementCheckSkillsOnStart,
    })
      .build()
      .build()
      .trimEnd();
    lines.push(
      `* ${formatSCP(skillName, level)} ${boostable} ${requiredAtStart}`
    );
  });

  if (quest.requiredCombatLevel > 3) {
    lines.push(`*${formatSCP("Combat", quest.requiredCombatLevel)}`);
  }

  if (quest.requiredQuestPoints > 0) {
    lines.push(
      `*${formatSCP("Quest", quest.requiredQuestPoints)} [[Quest points]]`
    );
  }

  if (quest.questRequirements.length > 0) {
    lines.push("*Completion of the following quests:");
    const appendQuest = (prerequisite: QuestPrerequisite, depth: number) => {
      lines.push(`${"*".repeat(depth + 2)}[[${prerequisite.name}]]`);
      prerequisite.prerequisites.forEach((child) =>
        appendQuest(child, depth + 1)
      );
    };
    quest.questRequirements.forEach((prerequisite) =>
      appendQuest(prerequisite, 0)
    );
  }

  return lines.join("\n");
};

export const formatQuestRecommendations = (quest: Quest): string => {
  const lines = quest.recommendedStats.map(
    ({ skillName, level }) => `*${formatSCP(skillName, level)}`
  );
  if (quest.recommendedCombatLevel > 3) {
    lines.push(`*${formatSCP("Combat", quest.recommendedCombatLevel)}`);
  }
  return lines.join("\n");
};

export const formatQuestRewards = (quest: Quest): string =>
  quest.awardedStats
    .map(
      ({ skillName, level }) =>
        `*${formatSCP(skillName, level, false)} [[${skillName}]] [[experience]]`
    )
    .join("\n");
