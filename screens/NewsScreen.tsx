import React from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet } from 'react-native';

export default function NewsScreen() {
  // mock news items
  const newsItems = [
    'Star QB expected to play this week.',
    'Rookie RB breakout potential.',
    'Fantasy sleepers to watch.',
    'Injury report updates.',
    'Trade rumors shaking up rosters.',
    'Fantasy projections for Week 5.',
    'More news coming soon...',
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Fantasy News</Text>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={true}>
        {newsItems.map((item, index) => (
          <View key={index} style={styles.newsBox}>
            <Text style={styles.newsText}>{item}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  header: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  scrollContent: { paddingBottom: 16 },
  newsBox: {
    backgroundColor: '#0b69ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  newsText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
  },
});
