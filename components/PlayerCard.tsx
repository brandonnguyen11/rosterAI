import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export interface PlayerInsight {
  icon: string; // Ionicons name
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
}

export interface PlayerCardData {
  playerName: string;
  team: string;
  position: string;
  opponent: string;
  gameTime: string;
  recommendation: 'START' | 'SIT';
  confidence: number;
  teamColor: string;
  insights: PlayerInsight[];
}

interface PlayerCardProps {
  player: PlayerCardData;
  onStartPress?: (player: PlayerCardData) => void;
  onSitPress?: (player: PlayerCardData) => void;
}

export default function PlayerCard({ player, onStartPress, onSitPress }: PlayerCardProps) {
  const getInsightColor = (impact: string) => {
    switch (impact) {
      case 'positive':
        return '#22c55e'; // green
      case 'negative':
        return '#ef4444'; // red
      default:
        return '#eab308'; // yellow
    }
  };

  const getRecommendationStyle = (rec: string, isSelected: boolean) => {
    if (!isSelected) {
      return {
        backgroundColor: '#374151',
        borderColor: '#4b5563',
        textColor: '#9ca3af'
      };
    }
    
    return rec === 'START' 
      ? {
          backgroundColor: 'rgba(34, 197, 94, 0.2)',
          borderColor: 'rgba(34, 197, 94, 0.3)',
          textColor: '#22c55e'
        }
      : {
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          borderColor: 'rgba(239, 68, 68, 0.3)',
          textColor: '#ef4444'
        };
  };

  return (
    <View style={styles.card}>
      {/* Header Section */}
      <View style={styles.header}>
        {/* Player Photo */}
        <View style={styles.photoContainer}>
          <View style={styles.playerPhoto} />
          {/* Team Badge */}
          <View style={styles.teamBadge}>
            <View style={[styles.teamDot, { backgroundColor: player.teamColor }]} />
            <Text style={styles.teamText}>{player.team} · {player.position}</Text>
          </View>
        </View>

        {/* Player Name */}
        <Text style={styles.playerName}>{player.playerName}</Text>

        {/* Matchup Info */}
        <View style={styles.matchupContainer}>
          <Ionicons name="calendar-outline" size={14} color="#9ca3af" />
          <Text style={styles.matchupText}>vs {player.opponent} {player.gameTime}</Text>
        </View>
      </View>

      {/* Insights Section */}
      <View style={styles.insightsContainer}>
        {player.insights.slice(0, 3).map((insight, index) => (
          <View key={index} style={styles.insightCard}>
            <View style={[styles.insightIcon, { backgroundColor: getInsightColor(insight.impact) + '20' }]}>
              <Ionicons 
                name={insight.icon as any} 
                size={16} 
                color={getInsightColor(insight.impact)} 
              />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>{insight.title}</Text>
              <Text style={styles.insightDescription}>{insight.description}</Text>
            </View>
          </View>
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
            <Text style={[
              styles.actionButtonText,
              { color: getRecommendationStyle('START', player.recommendation === 'START').textColor }
            ]}>
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
            <Text style={[
              styles.actionButtonText,
              { color: getRecommendationStyle('SIT', player.recommendation === 'SIT').textColor }
            ]}>
              SIT
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recommendation Badge */}
        <View style={styles.recommendationContainer}>
          <View style={[
            styles.recommendationBadge,
            {
              backgroundColor: player.recommendation === 'START' 
                ? 'rgba(34, 197, 94, 0.2)' 
                : 'rgba(239, 68, 68, 0.2)',
              borderColor: player.recommendation === 'START' 
                ? 'rgba(34, 197, 94, 0.3)' 
                : 'rgba(239, 68, 68, 0.3)',
            }
          ]}>
            <View style={[
              styles.recommendationDot,
              { 
                backgroundColor: player.recommendation === 'START' ? '#22c55e' : '#ef4444' 
              }
            ]} />
            <Text style={[
              styles.recommendationText,
              { 
                color: player.recommendation === 'START' ? '#22c55e' : '#ef4444' 
              }
            ]}>
              Recommended: {player.recommendation}
            </Text>
            <Text style={styles.confidenceText}>({player.confidence}% confidence)</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#374151',
    margin: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
    alignItems: 'center',
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  playerPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#22c55e',
  },
  teamBadge: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    transform: [{ translateX: -40 }],
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4b5563',
  },
  teamDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  teamText: {
    color: '#d1d5db',
    fontSize: 10,
    fontWeight: '500',
  },
  playerName: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 8,
  },
  matchupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  matchupText: {
    color: '#9ca3af',
    fontSize: 12,
  },
  insightsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.5)',
    gap: 12,
  },
  insightIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  insightDescription: {
    color: '#9ca3af',
    fontSize: 11,
    lineHeight: 16,
  },
  actionSection: {
    padding: 20,
    paddingTop: 0,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  recommendationContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  recommendationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  recommendationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  recommendationText: {
    fontSize: 12,
    fontWeight: '500',
  },
  confidenceText: {
    fontSize: 12,
    color: '#9ca3af',
  },
});