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
} from "react-native";
import { PlayerArticle } from "../types/news";
const mockNews: PlayerArticle[] = require("../data/MockNews.json");

const { width } = Dimensions.get("window");

const NewsScreen: React.FC = () => {
  const [articles, setArticles] = useState<PlayerArticle[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        // 🔹 replace this URL with your real endpoint later
        const response = await fetch(
          "https://raw.githubusercontent.com/your-repo/your-branch/mockNews.json"
        );
        const data: PlayerArticle[] = await response.json();
        setArticles(data);
      } catch (error) {
        console.warn("Fetch failed, using mock data:", error);
        setArticles(mockNews); // ✅ fallback to mock data
      }
    };

    fetchNews();
  }, []);

  const renderArticle = ({ item }: { item: PlayerArticle }) => {
    const isExpanded = expanded === item.headline;

    return (
      <View style={styles.card}>
        <Image source={{ uri: item.articleImage }} style={styles.image} />

        <View style={styles.textBox}>
          <Text style={styles.headline}>{item.headline}</Text>
          <Text style={styles.meta}>
            {item.playerName} • {item.teamName}
          </Text>
          <Text style={styles.meta}>
            {item.source} • {item.date}
          </Text>

          <Text
            numberOfLines={isExpanded ? undefined : 3}
            style={styles.content}
          >
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
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {articles.length === 0 ? (
        <Text style={styles.empty}>No news available</Text>
      ) : (
        <FlatList
          data={articles}
          keyExtractor={(item) => item.headline}
          renderItem={renderArticle}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

export default NewsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    padding: 10,
  },
  empty: {
    color: "#aaa",
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
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
  image: {
    width: "100%",
    height: width * 0.5,
    backgroundColor: "#000",
  },
  textBox: {
    padding: 12,
  },
  headline: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  meta: {
    fontSize: 12,
    color: "#aaa",
    marginBottom: 2,
  },
  content: {
    fontSize: 14,
    color: "#ddd",
    marginTop: 8,
  },
  readMore: {
    color: "#00bfff",
    fontSize: 14,
    marginTop: 6,
  },
  link: {
    color: "#ff6b6b",
    fontSize: 14,
    marginTop: 4,
  },
});
