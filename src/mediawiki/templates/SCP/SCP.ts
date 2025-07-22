import { MediaWikiTemplate } from "@osrs-wiki/mediawiki-builder";

import { SCPProps } from "./SCP.types";

const SCP = (props: SCPProps): MediaWikiTemplate => {
  const params: Record<string, string | number | boolean | undefined> = {
    "1": props.skill,
    "2": props.level !== undefined ? props.level : props.experience,
    "link": props.link !== undefined ? (props.link ? "yes" : "no") : undefined,
    "name": props.name || undefined,
    "txt": props.txt || undefined,
  };

  return new MediaWikiTemplate("SCP", params);
};

export default SCP;
