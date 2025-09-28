import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NavigationBar from "../components/NavigationBar";
import PlayerCard, { PlayerCardData } from "../components/PlayerCard";

// -------------------- Team Colors --------------------
const teamColors: Record<string, string> = {
  SF: "#AA0000", KC: "#E31837", DAL: "#003594", GB: "#203731", NE: "#002244",
  PIT: "#FFB612", BAL: "#241773", CIN: "#FB4F14", CLE: "#311D00", TEN: "#0C2340",
  IND: "#002C5F", HOU: "#03202F", JAX: "#006778", DEN: "#FB4F14", LV: "#000000",
  LAC: "#0080C6", BUF: "#00338D", MIA: "#008E97", NYJ: "#125740", LAR: "#003594",
  SEA: "#002244", ARI: "#97233F", ATL: "#A71930", CAR: "#0085CA", NO: "#D3BC8D",
  TB: "#D50A0A", WAS: "#773141", NYG: "#0B2265", PHI: "#004C54", MIN: "#4F2683",
  DET: "#0076B6", CHI: "#0B162A"
};

// -------------------- Component --------------------
const InsightsScreen: React.FC<any> = ({
  csvData,
  setCsvData,
  onHomePress,
  onBookPress,
  onEyePress,
  onNavigateToHome,
}) => {
  const [playerCards, setPlayerCards] = useState<PlayerCardData[]>([]);
  const [loading, setLoading] = useState(false);

  // -------------------- Lifecycle --------------------
  useEffect(() => {
    checkAndLoadData();
  }, []);

  useEffect(() => {
    if (csvData && csvData.length > 0) {
      fetchInsightsPipeline();
    }
  }, [csvData]);

  // -------------------- Data Loading --------------------
  const checkAndLoadData = async () => {
    try {
      if (!csvData || csvData.length === 0) {
        const savedData = await AsyncStorage.getItem("rosterData");
        if (savedData) setCsvData(JSON.parse(savedData));
      }
    } catch (error) {
      console.error("Error loading saved data:", error);
    }
  };

  // -------------------- API Pipeline Call --------------------
  const fetchInsightsPipeline = async () => {
    if (!csvData || csvData.length === 0) return;
    setLoading(true);

    try {
      const playersPayload = csvData.map((p: any) => ({
        name: p.playerName || p.Player || "Unknown Player",
        team: p.team || p.Team || "UNK",
        pos: p.position || p.POS || "FLEX",
        slot: p.Slot || "Unknown",
        opp: p.opponent || p.Opponent || p.Opp || "TBD",
      }));

      console.log("Sending payload to /generate_insights:", playersPayload);

      const response = await fetch("http://10.90.116.164:8000/generate_insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(playersPayload),
      });

      const data = await response.json();
      console.log("Response from /generate_insights:", data);

      if (data.players && Array.isArray(data.players)) {
        const enrichedPlayers: PlayerCardData[] = data.players.map((p: any) => ({
          playerName: p.playerName,
          team: p.team,
          position: p.pos,
          opponent: (p.opp ?? p.Opp ?? p.opponent ?? "TBD"),
          recommendation: p.recommendation,
          confidence: p.confidence,
          teamColor: teamColors[p.team] || "#6b7280",
          insights: p.insights || [],
        }));
        setPlayerCards(enrichedPlayers);
      } else {
        setPlayerCards([]);
      }
    } catch (error) {
      console.error("Error fetching insights pipeline:", error);
      setPlayerCards([]);
      Alert.alert("Error", "Failed to fetch player insights.");
    } finally {
      setLoading(false);
    }
  };

  // -------------------- Handlers --------------------
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
          await AsyncStorage.removeItem("rosterData");
          await AsyncStorage.removeItem("rosterFileName");
          setCsvData([]);
          setPlayerCards([]);
        },
      },
    ]);
  };

  const handleStartPress = (player: PlayerCardData) => {
    console.log(`START selected for ${player.playerName}`);
  };

  const handleSitPress = (player: PlayerCardData) => {
    console.log(`SIT selected for ${player.playerName}`);
  };

  // -------------------- Render Helpers --------------------
  const renderPlayerCard = ({ item }: { item: PlayerCardData }) => (
    <View style={styles.cardContainer}>
      <PlayerCard player={item} onStartPress={handleStartPress} onSitPress={handleSitPress} />
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No Players Found</Text>
      <Text style={styles.emptySubtitle}>
        Import your CSV roster to see player insights and recommendations
      </Text>
      <TouchableOpacity style={styles.importButton} onPress={handleImportRoster}>
        <Text style={styles.importButtonText}>Import Roster</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#0093D5" />
      <Text style={styles.loadingText}>Generating AI Insights...</Text>
    </View>
  );

  // -------------------- JSX --------------------
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={require("../assets/Logo.png")} style={styles.logo} />
        <Text style={styles.headerTitle}>Player Insights</Text>
        <View style={styles.headerActions}>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {loading ? renderLoadingState() : playerCards.length === 0 ? renderEmptyState() : (
          <FlatList
            data={playerCards}
            renderItem={renderPlayerCard}
            keyExtractor={(item, index) => `${item.playerName}-${index}`}
            numColumns={2}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>

      <NavigationBar onHomePress={onHomePress} onBookPress={onBookPress} onEyePress={onEyePress} />
    </SafeAreaView>
  );
};

// -------------------- Styles --------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f23" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 24, paddingBottom: 16 },
  logo: { width: 40, height: 40, resizeMode: "contain" },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#ffffff", marginLeft: 12, flex: 1 },
  headerActions: { flexDirection: "row", gap: 12 },
  headerButton: { padding: 8, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.1)" },
  content: { flex: 1, paddingBottom: 80 },
  listContainer: { padding: 8 },
  cardContainer: { flex: 1, maxWidth: "50%" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 32 },
  emptyTitle: { fontSize: 24, fontWeight: "bold", color: "#ffffff", marginBottom: 8, marginTop: 16 },
  emptySubtitle: { fontSize: 16, color: "#9ca3af", textAlign: "center", lineHeight: 22, marginBottom: 32 },
  importButton: { backgroundColor: "#0093D5", paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  importButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { fontSize: 18, color: "#9ca3af", marginTop: 16 },
});

export default InsightsScreen;
