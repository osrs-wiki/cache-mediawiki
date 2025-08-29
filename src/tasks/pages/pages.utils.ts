import { MediaWikiBuilder } from "@osrs-wiki/mediawiki-builder";
import { mkdir, writeFile } from "fs/promises";

import { formatFileName } from "@/utils/files";

export const writePageToFile = async (
  builder: MediaWikiBuilder,
  type: string,
  name: string,
  id: string,
  isMultiChildren?: boolean
) => {
  await mkdir(`./out/pages/${type}`, { recursive: true });
  writeFile(`./out/pages/${type}/${id}.txt`, builder.build());

  if (isMultiChildren) {
    await mkdir(`./out/pages/${type}/named/multiChildren`, { recursive: true });
    writeFile(
      formatFileName(
        `./out/pages/${type}/named/multiChildren/${name}-${id}.txt`
      ),
      builder.build()
    );
  } else {
    await mkdir(`./out/pages/${type}/named`, { recursive: true });
    writeFile(
      formatFileName(`./out/pages/${type}/named/${name}-${id}.txt`),
      builder.build()
    );
  }
};
