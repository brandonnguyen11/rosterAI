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
} from "react-native";
import { PlayerArticle } from "../types/news";
const mockNews: PlayerArticle[] = require("../data/MockNews.json");

const { width } = Dimensions.get("window");

// availability colors
const availabilityColors: Record<string, string> = {
  available: "green",
  questionable: "yellow",
  out: "red",
};

// 🔹 SMMRY API configuration - Replace with your actual API key
const SMMRY_API_KEY = "sk-smmry-4ed8bf901315e9f1990f6526220daf644db599f6b9944bf88adc4650d411a39f"; // replace with your actual key
const SMMRY_BASE_URL = "https://smmry.com";

const NewsScreen: React.FC = () => {
  const [articles, setArticles] = useState<PlayerArticle[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [summaries, setSummaries] = useState<Record<string, string[]>>({});
  const [loadingSummaries, setLoadingSummaries] = useState<Record<string, boolean>>({});

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

  // 🔹 Rule-based instant summary
  const generateSummaryBullets = (article: PlayerArticle) => {
    const bullets: string[] = [];
    bullets.push(`${article.playerName} (${article.teamName})`);

    const majorKeywords = [
      "injury",
      "trade",
      "questionable",
      "out",
      "suspended",
      "activated",
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

  // 🔹 SMMRY API call with console logs
  const fetchSummaryFromAPI = async (content: string, headline: string) => {
    console.log("🔹 Summarize button clicked for:", headline);
    if (!SMMRY_API_KEY || SMMRY_API_KEY === "sk-smmry-4ed8bf901315e9f1990f6526220daf644db599f6b9944bf88adc4650d411a39f") {
      console.warn("SMMRY API key not configured. Using local summary.");
      const bullets = generateSummaryBullets({
        playerName: "",
        teamName: "",
        content,
        availability: "available",
        headline,
        date: "",
        playerImage: "",
        articleImage: "",
        sourceLink: "",
      } as PlayerArticle);
      setSummaries(prev => ({ ...prev, [headline]: bullets }));
      return;
    }

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

      // small delay to ensure summary is ready
      const summaryResponse = await fetch(
        `${SMMRY_BASE_URL}/api/get-summary?request_id=${request_id}`,
        { headers: { "x-api-key": SMMRY_API_KEY } }
      );

      if (!summaryResponse.ok) {
        throw new Error(`Failed to get summary: ${summaryResponse.status}`);
      }

     const jsonResponse = await summaryResponse.json();
        const summaryText: string = jsonResponse.summary || ""; // ensure it's a string
        const bullets = summaryText
        .split(/[.!?]+/)
        .filter((s) => s.trim().length > 0)
        .map((s) => s.trim());

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
      } as PlayerArticle);
      setSummaries(prev => ({ ...prev, [headline]: fallbackBullets }));
    } finally {
      setLoadingSummaries(prev => ({ ...prev, [headline]: false }));
    }
  };

  const renderArticle = ({ item }: { item: PlayerArticle }) => {
    const isExpanded = expanded === item.headline;
    const bulletSummary = summaries[item.headline] || [];
    const isLoadingSummary = loadingSummaries[item.headline] || false;

    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View
            style={[
              styles.profileWrapper,
              { borderColor: availabilityColors[item.availability] || "gray" },
            ]}
          >
            <Image source={{ uri: item.playerImage }} style={styles.profileImage} />
          </View>

          <View style={styles.textHeader}>
            <View style={styles.nameDateRow}>
              <Text style={styles.playerName}>{item.playerName}</Text>
              <Text style={styles.date}>{item.date}</Text>
            </View>
            <Text style={styles.team}>{item.teamName}</Text>
          </View>
        </View>

        <Image source={{ uri: item.articleImage }} style={styles.image} />

        <View style={styles.textBox}>
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

          <TouchableOpacity onPress={() => Linking.openURL(item.sourceLink)}>
            <Text style={styles.link}>Go to source ↗</Text>
          </TouchableOpacity>

          {/* Summarize Button */}
          <View style={styles.summarizeContainer}>
            <Text style={styles.summarizeText}>
              {isLoadingSummary ? "Summarizing..." : "Summarize"}
            </Text>
            <TouchableOpacity
              style={{ padding: 4 }}
              disabled={isLoadingSummary}
              onPress={() => fetchSummaryFromAPI(item.content, item.headline)}
            >
              <Image
                source={require("../assets/summarize.png")}
                style={[styles.summarizeIcon, isLoadingSummary && { opacity: 0.5 }]}
              />
            </TouchableOpacity>
          </View>

          {/* Bullet summary */}
          {bulletSummary.length > 0 && (
            <View style={{ marginTop: 8 }}>
              {bulletSummary.map((line, index) => (
                <Text key={index} style={styles.bullet}>
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
    <SafeAreaView style={styles.safeArea}>
      {articles.length === 0 ? (
        <Text style={styles.empty}>No news available</Text>
      ) : (
        <FlatList
          data={articles}
          keyExtractor={(item) => item.headline}
          renderItem={renderArticle}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 80, paddingHorizontal: 10 }}
        />
      )}
    </SafeAreaView>
  );
};

export default NewsScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  empty: { color: "#aaa", textAlign: "center", marginTop: 20, fontSize: 16 },
  card: {
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 4,
  },
  headerRow: { flexDirection: "row", alignItems: "center", padding: 10 },
  profileWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  profileImage: { width: 44, height: 44, borderRadius: 22 },
  textHeader: { flex: 1 },
  nameDateRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  playerName: { fontSize: 16, fontWeight: "600", color: "#fff" },
  date: { fontSize: 12, color: "#aaa" },
  team: { fontSize: 13, color: "#aaa", marginTop: 2 },
  image: { width: "100%", height: width * 0.5, backgroundColor: "#000" },
  textBox: { padding: 12 },
  headline: { fontSize: 18, fontWeight: "600", color: "#fff", marginBottom: 4 },
  content: { fontSize: 14, color: "#ddd", marginTop: 8 },
  readMore: { color: "#00bfff", fontSize: 14, marginTop: 6 },
  link: { color: "#ff6b6b", fontSize: 14, marginTop: 4 },
  summarizeContainer: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", marginTop: 10 },
  summarizeText: { color: "#00bfff", fontSize: 14, marginRight: 6, fontWeight: "500" },
  summarizeIcon: { width: 24, height: 24, tintColor: "#00bfff" },
  bullet: { color: "#fff", fontSize: 13, marginTop: 2, marginLeft: 4 },
});
