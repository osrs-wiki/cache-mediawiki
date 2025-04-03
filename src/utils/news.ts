import Parser from "rss-parser";

const NEWS_RSS_FEED =
  "https://secure.runescape.com/m=news/latest_news.rss?oldschool=true";

export const getLatestNewsTitle = async (): Promise<
  | {
      title: string;
      date: string;
    }
  | undefined
> => {
  try {
    const parser = new Parser();
    const feed = await parser.parseURL(NEWS_RSS_FEED);

    const latestNews = feed.items
      .filter((item) => item.categories.includes("Game Updates"))
      .sort(
        (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
      )?.[0];

    return latestNews
      ? {
          title: latestNews.title,
          date: new Date(latestNews.pubDate).toISOString(),
        }
      : undefined;
  } catch (error) {
    console.error(error);
  }
};
