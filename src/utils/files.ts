export const formatFileName = (name: string) => {
  return name
    .replaceAll(":", "-")
    .replaceAll("?", "")
    .replaceAll(/<[^>]*>/g, "");
};
