import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export interface PlayerCardData {
  playerName: string;
  team: string;
  position: string;
  opponent: string;
  recommendation: 'START' | 'SIT';
  confidence: number; // 0-100
  teamColor: string;
  insights: string[]; // now just a list of strings
}

interface PlayerCardProps {
  player: PlayerCardData;
  onStartPress?: (player: PlayerCardData) => void;
  onSitPress?: (player: PlayerCardData) => void;
}

export default function PlayerCard({ player, onStartPress, onSitPress }: PlayerCardProps) {
  const getRecommendationStyle = (rec: string, isSelected: boolean) => {
    if (!isSelected) return { backgroundColor: '#374151', borderColor: '#4b5563', textColor: '#9ca3af' };
    return rec === 'START'
      ? { backgroundColor: 'rgba(34, 197, 94, 0.2)', borderColor: 'rgba(34, 197, 94, 0.3)', textColor: '#22c55e' }
      : { backgroundColor: 'rgba(239, 68, 68, 0.2)', borderColor: 'rgba(239, 68, 68, 0.3)', textColor: '#ef4444' };
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.photoContainer}>
          <View style={styles.playerPhoto} />
        </View>
        <Text style={styles.playerName}>{player.playerName}</Text>
        <View style={styles.matchupContainer}>
          <Text style={styles.matchupText}>vs {player.opponent || player.opponent}</Text>
        </View>
      </View>

      {/* Insights Section */}
      <View style={styles.insightsContainer}>
        {player.insights.slice(0, 3).map((insight, index) => (
          <Text key={index} style={styles.insightText}>• {insight}</Text>
        ))}
      </View>

      {/* Action Section */}
      <View style={styles.actionSection}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: getRecommendationStyle('START', player.recommendation === 'START').backgroundColor,
                borderColor: getRecommendationStyle('START', player.recommendation === 'START').borderColor,
              }
            ]}
            onPress={() => onStartPress?.(player)}
          >
            <Text style={[styles.actionButtonText, { color: getRecommendationStyle('START', player.recommendation === 'START').textColor }]}>
              START
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: getRecommendationStyle('SIT', player.recommendation === 'SIT').backgroundColor,
                borderColor: getRecommendationStyle('SIT', player.recommendation === 'SIT').borderColor,
              }
            ]}
            onPress={() => onSitPress?.(player)}
          >
            <Text style={[styles.actionButtonText, { color: getRecommendationStyle('SIT', player.recommendation === 'SIT').textColor }]}>
              SIT
            </Text>
          </TouchableOpacity>
        </View>

        {/* Confidence Meter */}
        <View style={styles.confidenceContainer}>
          <Text style={styles.confidenceLabel}>Confidence</Text>
          <View style={styles.confidenceBarBackground}>
            <View
              style={[
                styles.confidenceBarFill,
                {
                  width: `${player.confidence}%`,
                  backgroundColor: player.recommendation === 'START' ? '#22c55e' : '#ef4444'
                }
              ]}
            />
          </View>
          <Text style={styles.confidencePercent}>{player.confidence}%</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1, // ensures cards in the same row have equal width
    backgroundColor: '#1f2937',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#374151',
    margin: 8,
    overflow: 'hidden',
    justifyContent: 'space-between', // ensures bottom alignment
  },
  header: { padding: 20, paddingBottom: 16, alignItems: 'center' },
  photoContainer: { position: 'relative', marginBottom: 16 },
  playerPhoto: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#22c55e' },
  playerName: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 8, marginTop: 8, textAlign: 'center' },
  matchupContainer: { flexDirection: 'row', alignItems: 'center' },
  matchupText: { color: '#9ca3af', fontSize: 12 }, // "vs" stays gray
  insightsContainer: { paddingHorizontal: 20, paddingBottom: 16, gap: 8 },
  insightText: { color: '#fff', fontSize: 14, lineHeight: 20, marginBottom: 4 }, // bigger white font
  actionSection: { padding: 20, paddingTop: 0 },
  buttonContainer: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  actionButton: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  actionButtonText: { fontSize: 14, fontWeight: '600' },
  confidenceContainer: { alignItems: 'center' },
  confidenceLabel: { color: '#fff', fontSize: 12, marginBottom: 4 },
  confidenceBarBackground: { width: '80%', height: 8, borderRadius: 4, backgroundColor: '#374151', overflow: 'hidden', marginBottom: 4 },
  confidenceBarFill: { height: '100%', borderRadius: 4 },
  confidencePercent: { color: '#fff', fontSize: 12 },
});
