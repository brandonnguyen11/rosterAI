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
import AsyncStorage from "@react-native-async-storage/async-storage";
import NavigationBar from "../components/NavigationBar";
import { PlayerArticle } from "../types/news";
import { SafeAreaView } from 'react-native';

const { width } = Dimensions.get("window");


const playerImages: Record<string, any> = {
  "Drake Maye": require("../assets/Drake Maye.jpg"),
  "Breece Hall": require("../assets/Breece Hall.jpg"),
  "Nick Chubb": require("../assets/Nick Chubb.jpg"),
  "Zay Flowers": require("../assets/Zay Flowers.jpg"),
  "Emeka Egbuka": require("../assets/Emeka Egbuka.jpg"),
  "Brock Bowers": require("../assets/Brock Bowers.jpg"),
  "Chris Olave": require("../assets/Chris Olave.jpg"),
  "J.K. Dobbins": require("../assets/J.K. Dobbins.jpg"),
  "Broncos": require("../assets/Broncos.png"),
  "Jake Bates": require("../assets/Jake Bates.png"),
  "CeeDee Lamb": require("../assets/CeeDee Lamb.png"),
  "Khalil Shakir": require("../assets/Khalil Shakir.png"),
  "Rhamondre Stevenson": require("../assets/Rhamondre Stevenson.png"),
  "Braelon Allen": require("../assets/Braelon Allen.png"),
  "Matthew Stafford": require("../assets/Matthew Stafford.png"),
  "TreVeyon Henderson": require("../assets/TreVeyon Henderson.png"),
  "Calvin Ridley": require("../assets/Calvin Ridley.png"),
  "Caleb Williams": require("../assets/Caleb Williams.png"),
  "Kenneth Walker III": require("../assets/Kenneth Walker.png"),
  "Trey Benson": require("../assets/Trey Benson.png"),
  "Justin Jefferson": require("../assets/Justin Jefferson.png"),
  "A.J. Brown": require("../assets/A.J. Brown.jpg"),
  "T.J. Hockenson": require("../assets/T.J. Hockenson.png"),
  "Javonte Williams": require("../assets/Javonte Williams.png"),
  "Tre Tucker": require("../assets/Tre Tucker.png"),
  "Lions": require("../assets/Lions.png"),
  "Ka'imi Fairbairn": require("../assets/Ka'imi Fairbairn.png"),
  "Travis Hunter": require("../assets/Travis Hunter.png"),
  "Dak Prescott": require("../assets/Dak Prescott.png"),
  "Chig Okonkwo": require("../assets/Chig Okonkwno.png"),
  "Rashod Bateman": require("../assets/Rashod Bateman.png"),
  "Michael Wilson": require("../assets/Michael Wilson.png"),
  "Jonnu Smith": require("../assets/Jonnu Smith.png"),
  "Jaxson Dart": require("../assets/Jaxson Dart.png"),
};

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
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const [myPlayers, setMyPlayers] = useState<string[]>([]);
  
  // Track which article summaries are shown
  const [summaryVisible, setSummaryVisible] = useState<Record<string, boolean>>({});

  const filterOptions = ["All", "QB", "RB", "WR", "TE", "K", "D/ST", "FLEX"];

  useEffect(() => {
    loadMyPlayers();
  }, [csvData]);

  useEffect(() => {
    const fetchFromPipeline = async () => {
      try {
        const playersPayload = (csvData || [])
          .map((p: { playerName?: string; teamName?: string; Player?: string; Team?: string }) => ({
            name: p.playerName || p.Player || "",
            team: p.teamName || p.Team || "",
          }))
          .filter((p: { name: any; team: any }) => p.name && p.team);

        const response = await fetch("http://10.90.116.164:8000/articles_with_analysis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(playersPayload),
        });

        const data = await response.json();

        if (data.articles && Array.isArray(data.articles)) {
          setArticles(data.articles);
        } else {
          setArticles([]);
        }
      } catch (err) {
        console.error("Error fetching pipeline articles:", err);
        setArticles([]);
      }
    };

    fetchFromPipeline();
  }, [csvData]);

  const loadMyPlayers = async () => {
    try {
      let playersData: any[] | undefined = csvData;
      if (!playersData || playersData.length === 0) {
        const savedData = await AsyncStorage.getItem("rosterData");
        if (savedData) playersData = JSON.parse(savedData);
        if (setCsvData && playersData) setCsvData(playersData);
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

  const getPlayerPosition = (playerName: string): string => {
    if (!csvData || csvData.length === 0) return "UNK";
  
    // Try to find a matching player in CSV
    const match = csvData.find(
      (p: any) =>
        p.playerName === playerName ||
        p.Player === playerName
    );
  
    if (!match) return "UNK";
  
    // Handle different possible field names
    const rawPos =
      match.position ||
      match.POS ||
      match.pos ||
      match.Slot ||
      match.slot ||
      match.Position ||
      "UNK";
  
    // Normalize common variants → QB, RB, WR, TE, K, DEF, FLEX
    const normalized = rawPos.toUpperCase();
    if (["QB", "RB", "WR", "TE", "K", "D/ST", "DEF", "FLEX"].includes(normalized)) {
      return normalized;
    }
  
    return "UNK";
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
    const isExpanded = expanded === item.articleTitle;
    const isMyPlayer = myPlayers.includes(item.playerName);
    const playerPosition = getPlayerPosition(item.playerName);
    const timeAgo = getTimeAgo(item.date);
    const sentimentColor = item.sentiment === "Positive" ? "#10b981" : "#ef4444";
    const sentimentLabel = item.sentiment || "N/A";
    const showSummary = summaryVisible[item.articleTitle] || false;

    return (
      <View style={[styles.card, isMyPlayer && styles.myPlayerCard, { borderColor: sentimentColor }]}>
        {isMyPlayer && (
          <View style={[styles.myPlayerBadge, { backgroundColor: sentimentColor }]}>
            <Text style={styles.myPlayerBadgeText}>{sentimentLabel}</Text>
          </View>
        )}

        <View style={styles.headerRow}>
          <View style={styles.playerSection}>
          <View style={[styles.profileWrapper, { borderColor: "#6b7280" }]}>
              {playerImages[item.playerName] ? (
                <Image
                  source={playerImages[item.playerName]}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.profileImage} /> // fallback if image doesn't exist
              )}

              <View style={[styles.positionBadge, { backgroundColor: positionColors[playerPosition] || "#374151" }]}>
                <Text style={styles.positionText}>{playerPosition}</Text>
              </View>
            </View>

            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>{item.playerName}</Text>
              <Text style={styles.teamName}>{item.teamName}</Text>
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, { backgroundColor: availabilityColors["available"] }]} />
                <Text style={styles.statusText}>Active</Text>
              </View>
            </View>
          </View>
          <Text style={styles.timeStamp}>{timeAgo}</Text>
        </View>

        <View style={styles.contentSection}>
          <Text style={styles.headline}>{item.articleTitle}</Text>
          <Text numberOfLines={isExpanded ? undefined : 3} style={styles.content}>
            {item.bodyText}
          </Text>
          <TouchableOpacity onPress={() => setExpanded(isExpanded ? null : item.articleTitle)}>
            <Text style={styles.readMore}>{isExpanded ? "Show Less" : "Read More"}</Text>
          </TouchableOpacity>

          {item.summary && (
            <>
              <TouchableOpacity
                onPress={() =>
                  setSummaryVisible((prev) => ({
                    ...prev,
                    [item.articleTitle]: !prev[item.articleTitle],
                  }))
                }
              >
                <Text style={[styles.readMore, { color: "#10b981" }]}>
                  {showSummary ? "Hide Summary" : "Show Summary"}
                </Text>
              </TouchableOpacity>
              {showSummary && (
                <View style={{ marginTop: 8 }}>
                  <Text style={{ color: "#ffffff", fontSize: 14, lineHeight: 20 }}>
                    {item.summary}
                  </Text>
                </View>
              )}
            </>
          )}

          <TouchableOpacity onPress={() => Linking.openURL(item.sourceURL)} style={styles.sourceContainer}>
            <Text style={styles.sourceLink}>{item.sourceHost} →</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
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
          keyExtractor={(item) => item.articleTitle}
          renderItem={renderArticle}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      <NavigationBar onHomePress={onHomePress} onBookPress={onBookPress} onEyePress={onEyePress} />
    </SafeAreaView>
  );
};

export default NewsScreen;

// ... styles remain the same


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f23" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 24, paddingBottom: 16 },
  logo: { width: 40, height: 40, resizeMode: "contain" },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#ffffff", marginLeft: 12, flex: 1 },
  filterContainer: { 
    paddingHorizontal: 20, 
    paddingVertical: 6,
    marginBottom: 20, 
    height: 60,  
    maxHeight: 60, 
  },
  
  
  filterChip: { 
    backgroundColor: "rgba(255,255,255,0.1)", 
    borderRadius: 20, 
    paddingHorizontal: 18,   // slightly wider
    paddingVertical: 10,     // taller so text isn’t squished
    borderWidth: 1, 
    maxHeight: 60, 
    justifyContent: "center", // center vertically
    alignItems: "center", 
    borderColor: "rgba(255,255,255,0.2)", 
    marginRight: 10,          // extra spacing
  },
  
    activeFilterChip: { backgroundColor: "#4f46e5", borderColor: "#4f46e5" },
    filterChipText: { 
      color: "rgba(255,255,255,0.8)", 
      fontSize: 15,             // bump font size slightly
      fontWeight: "500", 
      lineHeight: 18,           // keep line height balanced
      flexShrink: 1, 
    },
    
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
