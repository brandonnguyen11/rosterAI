import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import sampleTeamData from "../utils/sampleTeam.json";
import { mockFetchNewsForPlayer, NewsItem } from "../utils/mockNewsApi";

type Player = {
  id: string;
  name: string;
  position: "QB" | "RB" | "WR" | "TE" | "K";
  team: string;
};

type PlayerNews = Player & { news: NewsItem[] };

export default function NewsScreen() {
  const [newsData, setNewsData] = useState<Record<string, PlayerNews>>({});
  const [positionFilter, setPositionFilter] = useState<"ALL" | Player["position"]>("ALL");

  const positions: Array<"ALL" | Player["position"]> = ["ALL", "QB", "RB", "WR", "TE", "K"];

  useEffect(() => {
    const fetchAllNews = async () => {
      const data: Record<string, PlayerNews> = {};
      for (let player of sampleTeamData as Player[]) {
        const news = await mockFetchNewsForPlayer(player.name);
        data[player.id] = { ...player, news };
      }
      setNewsData(data);
    };
    fetchAllNews();
  }, []);

  const filteredPlayers = Object.values(newsData).filter(player =>
    positionFilter === "ALL" ? true : player.position === positionFilter
  );

  const renderNewsItem = (newsItems: NewsItem[], player: PlayerNews) => (
    <View style={styles.newsRow}>
      <Ionicons name="person-circle" size={40} color="#0b69ff" style={{ marginRight: 12 }} />
      <View style={styles.newsBox}>
        <Text style={styles.playerName}>{player.name} ({player.position})</Text>
        {newsItems.map((item, index) => (
          <Text key={index} style={styles.newsText}>• {item.title} ({item.source})</Text>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView horizontal style={styles.filterBar} contentContainerStyle={{ paddingHorizontal: 8 }}>
        {positions.map(pos => (
          <TouchableOpacity
            key={pos}
            style={[styles.filterButton, positionFilter === pos && styles.filterActive]}
            onPress={() => setPositionFilter(pos)}
          >
            <Text style={[styles.filterText, positionFilter === pos && styles.filterTextActive]}>{pos}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredPlayers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => renderNewsItem(item.news, item)}
        contentContainerStyle={{ padding: 16 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  filterBar: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "#f9f9f9",
  },
  filterButton: {
    marginRight: 12,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#eee",
  },
  filterActive: {
    backgroundColor: "#0b69ff",
  },
  filterText: { color: "#333", fontWeight: "600" },
  filterTextActive: { color: "#fff" },

  newsRow: { flexDirection: "row", marginBottom: 16, alignItems: "flex-start" },
  newsBox: { flex: 1, backgroundColor: "#f1f1f1", padding: 12, borderRadius: 8 },
  playerName: { fontWeight: "700", marginBottom: 6 },
  newsText: { fontSize: 14, marginBottom: 4 }
});
