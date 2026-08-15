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
  const content = builder.build();
  await mkdir(`./out/pages/${type}`, { recursive: true });
  await writeFile(`./out/pages/${type}/${id}.txt`, content);

  if (isMultiChildren) {
    await mkdir(`./out/pages/${type}/named/multiChildren`, { recursive: true });
    await writeFile(
      formatFileName(
        `./out/pages/${type}/named/multiChildren/${name}-${id}.txt`
      ),
      content
    );
  } else {
    await mkdir(`./out/pages/${type}/named`, { recursive: true });
    await writeFile(
      formatFileName(`./out/pages/${type}/named/${name}-${id}.txt`),
      content
    );
  }
};
