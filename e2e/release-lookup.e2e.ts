import {
  FALLBACK_NEW_CACHE_VERSION,
  FALLBACK_OLD_CACHE_VERSION,
  NEW_CACHE_VERSION,
  OLD_CACHE_VERSION,
} from "./utils/cache-versions";
import { getCacheVersions } from "./utils/release-lookup";

const release = (tag_name: string, draft = false, prerelease = false) => ({
  tag_name,
  draft,
  prerelease,
});

describe("Cache release lookup", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("uses the versions selected by global setup", () => {
    expect(process.env.E2E_NEW_CACHE_VERSION).toBe(NEW_CACHE_VERSION);
    expect(process.env.E2E_OLD_CACHE_VERSION).toBe(OLD_CACHE_VERSION);
  });

  it("selects the newest two published releases without -c...- tags", async () => {
    const fetchSpy = jest
      .spyOn(global, "fetch")
      .mockResolvedValue(
        new Response(
          JSON.stringify([
            release("2026-11-18-c1-rev242"),
            release("2026-11-18-rev242$(printf${IFS}INJECTED)"),
            release("2026-11-18-rev242;echo INJECTED"),
            release("2026-11-18-rev242\n"),
            release("latest"),
            release("2026-11-18-rev242"),
            release("2026-11-17-c12-rev242"),
            release("draft", true),
            release("prerelease", false, true),
            release("2026-11-11-rev242"),
          ])
        )
      );

    await expect(getCacheVersions()).resolves.toEqual({
      newVersion: "2026-11-18-rev242",
      oldVersion: "2026-11-11-rev242",
    });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("continues to the next page when necessary", async () => {
    const fetchSpy = jest
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([
            release("2026-11-18-rev242"),
            ...Array.from({ length: 99 }, (_, i) =>
              release(`2026-11-17-c${i}-rev242`)
            ),
          ])
        )
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify([release("2026-11-11-rev242")]))
      );

    await expect(getCacheVersions()).resolves.toEqual({
      newVersion: "2026-11-18-rev242",
      oldVersion: "2026-11-11-rev242",
    });
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(fetchSpy.mock.calls[1][0]).toContain("page=2");
  });

  it.each([
    ["network failure", () => Promise.reject(new Error("network unavailable"))],
    ["HTTP failure", () => Promise.resolve(new Response("", { status: 403 }))],
    ["invalid response", () => Promise.resolve(new Response("{}"))],
    [
      "too few releases",
      () =>
        Promise.resolve(
          new Response(JSON.stringify([release("2026-11-18-rev242")]))
        ),
    ],
  ])("warns and uses both fallback versions on %s", async (_name, response) => {
    jest.spyOn(global, "fetch").mockImplementation(response);
    const warning = jest.spyOn(console, "warn").mockImplementation();

    await expect(getCacheVersions()).resolves.toEqual({
      oldVersion: FALLBACK_OLD_CACHE_VERSION,
      newVersion: FALLBACK_NEW_CACHE_VERSION,
    });
    expect(warning).toHaveBeenCalledWith(
      expect.stringContaining("using fallback versions")
    );
  });
});
