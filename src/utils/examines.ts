export const getExamines = async (
  name: string,
  version = "master"
): Promise<{ [key: string]: string }> => {
  const examines: { [key: string]: string } = {};
  const req = await fetch(
    `https://raw.githubusercontent.com/Joshua-F/osrs-examines/${version}/${name}.csv`
  );
  if (!req.ok) {
    return;
  }
  const fetchedExamines = await req.text();
  fetchedExamines.split("\n").forEach((line) => {
    const id = line.split(",")[0];
    const examine = line.substring(line.indexOf(",") + 1).replaceAll('"', "");
    if (id) {
      examines[id] = examine;
    }
  });
  return examines;
};
