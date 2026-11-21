/**
 * The type of article a transcript belongs to, as documented at
 * https://oldschool.runescape.wiki/w/Template:Hastranscript/doc
 *
 * - `npc` also links to a list of other transcripts the NPC speaks in.
 * - `speaksin` only shows the list of other transcripts the NPC speaks in,
 *   for NPCs that only speak during quests.
 */
export type HastranscriptType =
  | "npc"
  | "speaksin"
  | "pet"
  | "skill"
  | "quest"
  | "miniquest"
  | "event"
  | "item"
  | "scenery";

/**
 * Link-box mode `type`/`link` parameters. `link` overrides the dialogue
 * page if it is not at Transcript:{{PAGENAME}}, but per the docs it is only
 * valid alongside a `type` - this union makes that combination a type error.
 */
type HastranscriptLinkBoxParams =
  | { type?: HastranscriptType; link?: undefined }
  | { type: HastranscriptType; link?: string };

export type HastranscriptParams = HastranscriptLinkBoxParams & {
  /**
   * Switches the template into transclusion mode, directly transcluding the
   * contents of the transcript page(s) onto the current page. Generally
   * used for shorter transcripts. `type` and `link` are ignored in this
   * mode.
   */
  transclude?: boolean;
  /**
   * Transclusion mode: the transcript page(s) to transclude (without the
   * "Transcript:" prefix). Defaults to {{PAGENAME}} when omitted. Provide
   * multiple entries to transclude more than one page.
   */
  pages?: string | string[];
};
