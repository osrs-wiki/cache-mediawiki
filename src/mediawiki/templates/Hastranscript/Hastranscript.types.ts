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

export type HastranscriptParams = {
  /**
   * Link-box mode: the type of article the transcript belongs to.
   * Optional, but required if `link` is specified. Ignored when
   * `transclude` is set.
   */
  type?: HastranscriptType;
  /**
   * Link-box mode: override link if the dialogue page is not at
   * Transcript:{{PAGENAME}}. Should only be needed in exceptional
   * circumstances. Ignored when `transclude` is set.
   */
  link?: string;
  /**
   * Switches the template into transclusion mode, directly transcluding the
   * contents of the transcript page(s) onto the current page. Generally
   * used for shorter transcripts.
   */
  transclude?: boolean;
  /**
   * Transclusion mode: the transcript page(s) to transclude (without the
   * "Transcript:" prefix). Defaults to {{PAGENAME}} when omitted. Provide
   * multiple entries to transclude more than one page.
   */
  pages?: string | string[];
};
