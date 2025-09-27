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
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NavigationBar from "../components/NavigationBar";
import { PlayerArticle } from "../types/news";

// require mock data
const mockNews: PlayerArticle[] = require("../data/processedNewsSample.json").articles;

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

const NewsScreen: React.FC<any> = ({ csvData, setCsvData, onHomePress, onBookPress, onEyePress, onNavigateToHome }) => {
  const [articles, setArticles] = useState<PlayerArticle[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [summaries, setSummaries] = useState<Record<string, string[]>>({});
  const [loadingSummaries, setLoadingSummaries] = useState<Record<string, boolean>>({});
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const [myPlayers, setMyPlayers] = useState<string[]>([]);

  const filterOptions = ["All", "My Players", "QB", "RB", "WR", "TE", "K", "DEF", "FLEX"];

  // load "My Players"
  useEffect(() => {
    loadMyPlayers();
  }, [csvData]);

  // fetch news every launch
  useEffect(() => {
  const fetchNews = async () => {
    try {
      const response = await fetch(
        "https://raw.githubusercontent.com/your-repo/your-branch/processedNewsSample.json"
      );
      const data = await response.json();

      // map the JSON structure to PlayerArticle type
      const mappedArticles: PlayerArticle[] = (data.articles || []).map((a: any) => ({
        playerName: a.playerName,
        teamName: a.teamName,
        headline: a.articleTitle,      // map articleTitle -> headline
        content: a.bodyText,           // map bodyText -> content
        articleImage: a.articleImage || "https://via.placeholder.com/400", // placeholder if missing
        playerImage: a.playerImage || "https://via.placeholder.com/50",     // placeholder if missing
        availability: a.availability || "available",
        sourceLink: a.sourceURL,       // map sourceURL -> sourceLink
        sourceHost: a.sourceHost,
        source: a.sourceHost,          // can reuse
      }));

      setArticles(mappedArticles.length ? mappedArticles : mockNews);
    } catch {
      setArticles(mockNews);
    }
  };
  fetchNews();
}, []);


  const loadMyPlayers = async () => {
    try {
      let playersData: any[] | undefined = csvData;

      if (!playersData || playersData.length === 0) {
        const savedData = await AsyncStorage.getItem("rosterData");
        if (savedData) {
          playersData = JSON.parse(savedData);
          if (setCsvData && playersData) setCsvData(playersData);
        }
      }

      if (playersData && playersData.length > 0) {
        const playerNames = playersData
          .map((player: any) => player.playerName || player.Player || "")
          .filter(Boolean);
        setMyPlayers(playerNames);
      }
    } catch (error) {
      console.error("Error loading my players:", error);
    }
  };

  const handleImportRoster = () => {
    if (onNavigateToHome) onNavigateToHome();
  };

  const handleClearData = async () => {
    Alert.alert("Clear Roster", "Are you sure you want to clear all roster data?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.removeItem("rosterData");
            await AsyncStorage.removeItem("rosterFileName");
            if (setCsvData) setCsvData([]);
            setMyPlayers([]);
          } catch (error) {
            console.error("Error clearing data:", error);
          }
        },
      },
    ]);
  };

  const getPlayerPosition = (playerName: string): string => {
    if (playerName.includes("Mahomes")) return "QB";
    if (playerName.includes("McCaffrey")) return "RB";
    if (playerName.includes("Jefferson")) return "WR";
    if (playerName.includes("Kelce")) return "TE";
    return "QB";
  };

  const getTimeAgo = (dateString: string): string => {
    const articleDate = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - articleDate.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const generateSummaryBullets = (article: PlayerArticle) => {
    const bullets: string[] = [];
    bullets.push(`${article.playerName} (${article.teamName})`);
    const majorKeywords = ["injury", "trade", "questionable", "out", "suspended", "activated"];
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

  const filteredArticles = articles.filter((article) => {
    if (selectedFilter === "All") return true;
    if (selectedFilter === "My Players") return myPlayers.includes(article.playerName);
    return getPlayerPosition(article.playerName) === selectedFilter;
  });

  const renderFilterChip = (filter: string) => (
    <TouchableOpacity
      key={filter}
      style={[styles.filterChip, selectedFilter === filter && styles.activeFilterChip]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text style={[styles.filterChipText, selectedFilter === filter && styles.activeFilterChipText]}>
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
      {/* Star sparkle */}
      <Image
        source={require("../assets/summarize.png")}
        style={styles.summarize}
      />

      {isMyPlayer && (
        <View style={styles.myPlayerBadge}>
          <Text style={styles.myPlayerBadgeText}>MY PLAYER</Text>
        </View>
      )}
      <View style={styles.headerRow}>
        <View style={styles.playerSection}>
          <View
            style={[
              styles.profileWrapper,
              { borderColor: availabilityColors[item.availability] || "#6b7280" },
            ]}
          >
            <Image source={{ uri: item.playerImage }} style={styles.profileImage} />
            <View
              style={[
                styles.positionBadge,
                { backgroundColor: positionColors[playerPosition] || "#374151" },
              ]}
            >
              <Text style={styles.positionText}>{playerPosition}</Text>
            </View>
          </View>
          <View style={styles.playerInfo}>
            <Text style={styles.playerName}>{item.playerName}</Text>
            <Text style={styles.teamName}>{item.teamName}</Text>
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: availabilityColors[item.availability] },
                ]}
              />
              <Text style={styles.statusText}>
                {item.availability === "available" && "Active"}
                {item.availability === "questionable" && "Monitor lineup"}
                {item.availability === "out" && "Replace in lineup"}
              </Text>
            </View>
          </View>
        </View>
        <Text style={styles.timeStamp}>{timeAgo}</Text>
      </View>
      <Image source={{ uri: item.articleImage }} style={styles.articleImage} />
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
        <TouchableOpacity
          onPress={() => Linking.openURL(item.sourceLink)}
          style={styles.sourceContainer}
        >
          <Text style={styles.sourceLink}>
            {item.sourceHost} →
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require("../assets/Logo.png")} style={styles.logo} />
        <Text style={styles.headerTitle}>Fantasy News</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {filterOptions.map(renderFilterChip)}
      </ScrollView>

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
      {/* Navigation Bar */}
      <NavigationBar onHomePress={onHomePress} onBookPress={onBookPress} onEyePress={onEyePress} />
    </View>

  );
};

export default NewsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f23" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 24, paddingBottom: 16 },
  logo: { width: 40, height: 40, resizeMode: "contain" },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#ffffff", marginLeft: 12, flex: 1 },
  filterContainer: { paddingHorizontal: 20, marginBottom: 20, maxHeight: 44 },
  filterChip: { backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, alignItems: "center", borderColor: "rgba(255,255,255,0.2)" },
  activeFilterChip: { backgroundColor: "#4f46e5", borderColor: "#4f46e5" },
  filterChipText: { color: "rgba(255,255,255,0.8)", fontSize: 14, fontWeight: "500" },
  activeFilterChipText: { color: "#ffffff" },
  listContainer: { paddingHorizontal: 16, paddingBottom: 120 },
  card: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 20, marginBottom: 16, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  myPlayerCard: { borderColor: "rgba(16,185,129,0.4)", backgroundColor: "rgba(16,185,129,0.05)" },
  myPlayerBadge: { position: "absolute", top: 0, right: 0, backgroundColor: "#10b981", paddingHorizontal: 8, paddingVertical: 4, borderBottomLeftRadius: 12, zIndex: 10 },
  myPlayerBadgeText: { color: "#ffffff", fontSize: 9, fontWeight: "700" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", padding: 16 },
  playerSection: { flexDirection: "row", alignItems: "center", flex: 1 },
  profileWrapper: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, justifyContent: "center", alignItems: "center", marginRight: 12, position: "relative" },
  profileImage: { width: 46, height: 46, borderRadius: 23, backgroundColor: "#374151" },
  positionBadge: { position: "absolute", bottom: -2, right: -2, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, borderWidth: 2, borderColor: "#0f0f23" },
  positionText: { color: "#ffffff", fontSize: 10, fontWeight: "700" },
  playerInfo: { flex: 1 },
  playerName: { fontSize: 16, fontWeight: "600", color: "#ffffff", marginBottom: 2 },
  teamName: { fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 4 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, color: "rgba(255,255,255,0.8)", fontWeight: "500" },
  timeStamp: { fontSize: 12, marginTop: 5, color: "rgba(255,255,255,0.5)" },
  articleImage: { width: "100%", height: width * 0.4, backgroundColor: "#374151" },
  contentSection: { padding: 16 },
  headline: { fontSize: 18, fontWeight: "600", color: "#ffffff", marginBottom: 12, lineHeight: 24 },
  content: { fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 20, marginBottom: 12 },
  readMore: { color: "#06b6d4", fontSize: 14, fontWeight: "500", marginBottom: 8 },
  sourceContainer: { marginBottom: 16 },
  sourceLink: { color: "#06b6d4", fontSize: 14, fontWeight: "500" },
  emptyText: { color: "rgba(255,255,255,0.5)", textAlign: "center", marginTop: 40, fontSize: 16 },

  summarize: {
  position: "absolute",
  bottom: 10,
  left: 10,
  width: 24,
  height: 24,
  zIndex: 10,
},
});
