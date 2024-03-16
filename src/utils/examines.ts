export const getExamines = async (
  name: string
): Promise<{ [key: string]: string }> => {
  const examines: { [key: string]: string } = {};
  const req = await fetch(
    `https://raw.githubusercontent.com/Joshua-F/osrs-examines/master/${name}.csv`
  );
  if (!req.ok) {
    return;
  }
  const fetchedExamines = await req.text();
  fetchedExamines.split("\n").forEach((line) => {
    const parsedLine = line.split(",");
    const id = parsedLine[0];
    const examine = parsedLine[1];
    if (id) {
      examines[id] = examine;
    }
  });
  return examines;
};
