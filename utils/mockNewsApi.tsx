export interface NewsItem {
  title: string;
  source: string;
  url: string;
}

export const mockFetchNewsForPlayer = async (playerName: string): Promise<NewsItem[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          title: `${playerName} has a favorable matchup this week`,
          source: "NFL.com",
          url: "#"
        },
        {
          title: `${playerName} injury status updated`,
          source: "ESPN",
          url: "#"
        }
      ]);
    }, 200);
  });
};
