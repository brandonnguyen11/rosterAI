import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Linking,
  Dimensions,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { PlayerArticle } from "../types/news";
const mockNews: PlayerArticle[] = require("../data/MockNews.json");

const { width } = Dimensions.get("window");

// Enhanced availability colors
const availabilityColors: Record<string, string> = {
  available: "#10b981",
  questionable: "#f59e0b",
  out: "#ef4444",
};

// Position colors for badges
const positionColors: Record<string, string> = {
  QB: "#4f46e5",
  RB: "#059669",
  WR: "#dc2626",
  TE: "#7c3aed",
  K: "#0891b2",
  DST: "#374151",
};

// Mock list of your fantasy players - UPDATE THIS WITH YOUR ACTUAL PLAYERS
const myPlayers = ["Patrick Mahomes", "Christian McCaffrey"];

// SMMRY API configuration
const SMMRY_API_KEY = "sk-smmry-4ed8bf901315e9f1990f6526220daf644db599f6b9944bf88adc4650d411a39f";
const SMMRY_BASE_URL = "https://smmry.com";

const NewsScreen: React.FC = () => {
  const [articles, setArticles] = useState<PlayerArticle[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [summaries, setSummaries] = useState<Record<string, string[]>>({});
  const [loadingSummaries, setLoadingSummaries] = useState<Record<string, boolean>>({});
  const [selectedFilter, setSelectedFilter] = useState<string>("All");

  // Filter options
 const filterOptions = ["All", "My Players", "QB", "RB", "WR", "TE", "K", "DEF", "FLEX"];

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(
          "https://raw.githubusercontent.com/your-repo/your-branch/mockNews.json"
        );
        const data: PlayerArticle[] = await response.json();
        setArticles(data);
      } catch (error) {
        console.warn("Fetch failed, using mock data:", error);
        setArticles(mockNews);
      }
    };
    fetchNews();
  }, []);

  // Helper function to get player position
  const getPlayerPosition = (playerName: string): string => {
    // You can expand this logic based on your actual data
    if (playerName.includes("Mahomes")) return "QB";
    if (playerName.includes("McCaffrey")) return "RB";
    if (playerName.includes("Jefferson")) return "WR";
    if (playerName.includes("Kelce")) return "TE";
    // Default fallback - you'd implement proper position detection
    return "QB";
  };

  // above is sample code need to implement a json search or sort

  // Helper function to calculate time ago
  const getTimeAgo = (dateString: string): string => {
    const articleDate = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - articleDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Rule-based instant summary
  const generateSummaryBullets = (article: PlayerArticle) => {
    const bullets: string[] = [];
    bullets.push(`${article.playerName} (${article.teamName})`);

    const majorKeywords = [
      "injury", "trade", "questionable", "out", "suspended", "activated",
    ];
    const sentences = article.content.split(". ");
    const majorSentence = sentences.find((s) =>
      majorKeywords.some((kw) => s.toLowerCase().includes(kw))
    );
    if (majorSentence) bullets.push(majorSentence.trim());

    let impact = "No impact on your team";
    if (article.availability === "questionable") impact = "Monitor for lineup";
    else if (article.availability === "out") impact = "Replace in lineup";
    bullets.push(impact);

    return bullets;
  };

  // SMMRY API call
  const fetchSummaryFromAPI = async (content: string, headline: string) => {
    console.log("🔹 Summarize button clicked for:", headline);
    
    setLoadingSummaries(prev => ({ ...prev, [headline]: true }));

    try {
      console.log("🔹 Sending content to SMMRY API:", content.slice(0, 100));

      const submitResponse = await fetch(`${SMMRY_BASE_URL}/api/process-summarize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": SMMRY_API_KEY,
        },
        body: JSON.stringify({ raw_text: content }),
      });

      if (!submitResponse.ok) {
        throw new Error(`Failed to submit: ${submitResponse.status}`);
      }

      const { request_id } = await submitResponse.json();
      console.log("🔹 Received request_id from SMMRY API:", request_id);

      const summaryResponse = await fetch(
        `${SMMRY_BASE_URL}/api/get-summary?request_id=${request_id}`,
        { headers: { "x-api-key": SMMRY_API_KEY } }
      );

      if (!summaryResponse.ok) {
        throw new Error(`Failed to get summary: ${summaryResponse.status}`);
      }

      const jsonResponse = await summaryResponse.json();
      const summaryText: string = jsonResponse.summary || "";
      const bullets = summaryText
        .split(/[.!?]+/)
        .filter((s: string) => s.trim().length > 0)
        .map((s: string) => s.trim());

      console.log("🔹 Summary bullets:", bullets);
      setSummaries(prev => ({ ...prev, [headline]: bullets }));
    } catch (error) {
      console.error("❌ SMMRY API error:", error);
      const fallbackBullets = generateSummaryBullets({
        playerName: "",
        teamName: "",
        content,
        availability: "available",
        headline,
        date: "",
        playerImage: "",
        articleImage: "",
        sourceLink: "",
        source: "",
      } as PlayerArticle);
      setSummaries(prev => ({ ...prev, [headline]: fallbackBullets }));
    } finally {
      setLoadingSummaries(prev => ({ ...prev, [headline]: false }));
    }
  };

  // Filter articles
  const filteredArticles = articles.filter(article => {
    if (selectedFilter === "All") return true;
    if (selectedFilter === "My Players") return myPlayers.includes(article.playerName);
    return getPlayerPosition(article.playerName) === selectedFilter;
  });

  // Render filter chip
  const renderFilterChip = (filter: string) => (
    <TouchableOpacity
      key={filter}
      style={[
        styles.filterChip,
        selectedFilter === filter && styles.activeFilterChip
      ]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text style={[
        styles.filterChipText,
        selectedFilter === filter && styles.activeFilterChipText
      ]}>
        {filter}
      </Text>
    </TouchableOpacity>
  );

  const renderArticle = ({ item }: { item: PlayerArticle }) => {
    const isExpanded = expanded === item.headline;
    const bulletSummary = summaries[item.headline] || [];
    const isLoadingSummary = loadingSummaries[item.headline] || false;
    const isMyPlayer = myPlayers.includes(item.playerName);
    const playerPosition = getPlayerPosition(item.playerName);
    const timeAgo = getTimeAgo(item.date);

    return (
      <View style={[styles.card, isMyPlayer && styles.myPlayerCard]}>
        {/* My Player Badge */}
        {isMyPlayer && (
          <View style={styles.myPlayerBadge}>
            <Text style={styles.myPlayerBadgeText}>MY PLAYER</Text>
          </View>
        )}

        {/* Header Row */}
        <View style={styles.headerRow}>
          <View style={styles.playerSection}>
            {/* Player Avatar with Status Ring */}
            <View
              style={[
                styles.profileWrapper,
                { borderColor: availabilityColors[item.availability] || "#6b7280" },
              ]}
            >
              <Image source={{ uri: item.playerImage }} style={styles.profileImage} />
              {/* Position Badge */}
              <View style={[
                styles.positionBadge,
                { backgroundColor: positionColors[playerPosition] || "#374151" }
              ]}>
                <Text style={styles.positionText}>{playerPosition}</Text>
              </View>
            </View>

            {/* Player Info */}
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>{item.playerName}</Text>
              <Text style={styles.teamName}>{item.teamName}</Text>
              {/* Status Indicator */}
              <View style={styles.statusRow}>
                <View style={[
                  styles.statusDot,
                  { backgroundColor: availabilityColors[item.availability] }
                ]} />
                <Text style={styles.statusText}>
                  {item.availability === "available" && "Active"}
                  {item.availability === "questionable" && "Monitor lineup"}
                  {item.availability === "out" && "Replace in lineup"}
                </Text>
              </View>
            </View>
          </View>
          
          {/* Time Stamp */}
          <Text style={styles.timeStamp}>{timeAgo}</Text>
        </View>

        {/* Article Image */}
        <Image source={{ uri: item.articleImage }} style={styles.articleImage} />

        {/* Content Section */}
        <View style={styles.contentSection}>
          <Text style={styles.headline}>{item.headline}</Text>
          
          <Text numberOfLines={isExpanded ? undefined : 3} style={styles.content}>
            {item.content}
          </Text>

          <TouchableOpacity
            onPress={() => setExpanded(isExpanded ? null : item.headline)}
          >
            <Text style={styles.readMore}>
              {isExpanded ? "Show Less" : "Read More"}
            </Text>
          </TouchableOpacity>

          {/* Source Link with Arrow */}
          <TouchableOpacity 
            onPress={() => Linking.openURL(item.sourceLink)}
            style={styles.sourceContainer}
          >
            <Text style={styles.sourceLink}>{item.source} →</Text>
          </TouchableOpacity>

          {/* Action Bar */}
          <View style={styles.actionBar}>
            <View style={styles.quickActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>📊 Stats</Text>
              </TouchableOpacity>
              {isMyPlayer && (
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>🔄 Swap</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Summarize Button */}
            <TouchableOpacity
              style={[styles.summarizeButton, isLoadingSummary && styles.summarizeButtonLoading]}
              disabled={isLoadingSummary}
              onPress={() => fetchSummaryFromAPI(item.content, item.headline)}
            >
              <Text style={styles.summarizeText}>
                {isLoadingSummary ? "..." : "✨"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Summary Bullets */}
          {bulletSummary.length > 0 && (
            <View style={styles.summaryContainer}>
              {bulletSummary.map((line, index) => (
                <Text key={index} style={styles.summaryBullet}>
                  • {line}
                </Text>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Fantasy News</Text>
        <Text style={styles.updateCount}>{articles.length} updates</Text>
      </View>

      {/* Filter Chips */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {filterOptions.map(renderFilterChip)}
      </ScrollView>

      {/* News List */}
      {filteredArticles.length === 0 ? (
        <Text style={styles.emptyText}>No news available for this filter</Text>
      ) : (
        <FlatList
          data={filteredArticles}
          keyExtractor={(item) => item.headline}
          renderItem={renderArticle}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default NewsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f23",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
  },
  updateCount: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
  },
  filterContainer: {
  paddingHorizontal: 20,
  marginBottom: 20,
  maxHeight: 44, // NEW - Fixed height to prevent extension
},
filterContent: {
  gap: 12,
  paddingVertical: 0, // NEW - Remove vertical padding
},
  filterChip: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    alignItems: 'center',
    borderColor: "rgba(255,255,255,0.2)",
  },
  activeFilterChip: {
    backgroundColor: "#4f46e5",
    borderColor: "#4f46e5",
  },
  filterChipText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontWeight: "500",
  },
  activeFilterChipText: {
    color: "#ffffff",
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    position: "relative",
  },
  myPlayerCard: {
    borderColor: "rgba(16,185,129,0.4)",
    backgroundColor: "rgba(16,185,129,0.05)",
  },
  myPlayerBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#10b981",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomLeftRadius: 12,
    zIndex: 10,
  },
  myPlayerBadgeText: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "700",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 16,
  },
  playerSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  profileWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    position: "relative",
  },
  profileImage: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#374151",
  },
  positionBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#0f0f23",
  },
  positionText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "700",
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 2,
  },
  teamName: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
  },
  timeStamp: {
    fontSize: 12,
    marginTop: 5,
    color: "rgba(255,255,255,0.5)",
  },
  articleImage: {
    width: "100%",
    height: width * 0.4,
    backgroundColor: "#374151",
  },
  contentSection: {
    padding: 16,
  },
  headline: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 12,
    lineHeight: 24,
  },
  content: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    lineHeight: 20,
    marginBottom: 12,
  },
  readMore: {
    color: "#06b6d4",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  sourceContainer: {
    marginBottom: 16,
  },
  sourceLink: {
    color: "#06b6d4",
    fontSize: 14,
    fontWeight: "500",
  },
  actionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  actionButtonText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    fontWeight: "500",
  },
  summarizeButton: {
    backgroundColor: "rgba(6,182,212,0.2)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(6,182,212,0.3)",
  },
  summarizeButtonLoading: {
    opacity: 0.5,
  },
  summarizeText: {
    fontSize: 16,
  },
  summaryContainer: {
    marginTop: 12,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 12,
    padding: 12,
  },
  summaryBullet: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  emptyText: {
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
  },
});