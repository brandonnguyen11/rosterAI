export interface NewsItem {
  title: string;
  source: string;
  snippet: string;
  url?: string;
}

export type InjuryStatus = "Available" | "Questionable" | "Out" | "Probable";

export interface PlayerNewsData {
  news: NewsItem[];
  injury: InjuryStatus;
}

// async function that returns PlayerNewsData
export const mockFetchNewsForPlayer = async (
  playerName: string
): Promise<PlayerNewsData> => {
  return new Promise<PlayerNewsData>((resolve) => {
    // mock delay
    setTimeout(() => {
      const news: NewsItem[] = [
        {
          title: playerName + " has a favorable matchup this week", // use concatenation to be safe
          source: "NFL.com",
          snippet:
            "Expected to have a strong performance against the upcoming opponent this week...",
        },
      ];

      const injury: InjuryStatus =
        Math.random() > 0.7 ? "Questionable" : "Available";

      resolve({
        news,
        injury,
      });
    }, 200);
  });
};
