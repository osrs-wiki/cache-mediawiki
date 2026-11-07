type EntityBucket = "item_id" | "npc_id" | "object_id";

export const bucketIdLink = (
  bucket: EntityBucket,
  id: number,
  label = id.toString()
) =>
  `[https://oldschool.runescape.wiki/w/Special:Bucket?bucket=${bucket}&select=*&where=%27id%27%2C+${id} ${label}]`;
