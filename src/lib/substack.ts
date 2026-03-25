import Parser from "rss-parser";

export interface SubstackPost {
  title: string;
  excerpt: string;
  date: string;
  url: string;
}

const parser = new Parser({
  timeout: 3000,
});

export async function getSubstackPosts(limit = 6): Promise<SubstackPost[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const feed = await parser.parseURL("https://flickman.substack.com/feed");
    clearTimeout(timeoutId);

    return (feed.items || []).slice(0, limit).map((item) => {
      // Strip HTML tags for excerpt
      const plainText = (item.contentSnippet || item.content || "")
        .replace(/<[^>]*>/g, "")
        .trim();
      const excerpt =
        plainText.length > 160 ? plainText.slice(0, 160) + "..." : plainText;

      return {
        title: item.title || "Untitled",
        excerpt,
        date: item.pubDate
          ? new Date(item.pubDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "",
        url: item.link || "https://flickman.substack.com",
      };
    });
  } catch (error) {
    console.error("Failed to fetch Substack feed:", error);
    return [];
  }
}
