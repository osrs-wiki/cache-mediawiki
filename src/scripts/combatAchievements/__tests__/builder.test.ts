import combatAchievementPageBuilder from "../builder";

describe("combatAchievementPageBuilder", () => {
  test("it should build with all fields", () => {
    const builder = combatAchievementPageBuilder({
      id: 1,
      title: "Testing",
      description: "Testing a Description",
      monster: "Big Monster",
      type: "Kill Count",
      tier: "Elite",
    });

    expect(builder.build()).toMatchSnapshot();
  });
});
