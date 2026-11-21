import { InfoboxQuest } from "./InfoboxQuest.types";
import { InfoboxTemplate } from "../InfoboxTemplate";

export const InfoboxQuestTemplate = (params: InfoboxQuest) =>
  new InfoboxTemplate<InfoboxQuest>("Quest", params);
