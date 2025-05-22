import { MediaWikiBuilder } from "@osrs-wiki/mediawiki-builder";
import { mkdir, writeFile } from "fs/promises";

import { formatFileName } from "@/utils/files";

export const writePageToFile = async (
  builder: MediaWikiBuilder,
  type: string,
  name: string,
  id: string
) => {
  await mkdir(`./out/pages/${type}`, { recursive: true });
  writeFile(`./out/pages/${type}/${id}.txt`, builder.build());

  await mkdir(`./out/pages/${type}/named`, { recursive: true });
  writeFile(
    formatFileName(`./out/pages/${type}/named/${name}.txt`),
    builder.build()
  );
};
