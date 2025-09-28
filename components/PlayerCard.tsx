import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';


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
      <View style={[styles.photoContainer]}>
  {playerImages[player.playerName] ? (
    <Image
      source={playerImages[player.playerName]}
      style={styles.playerPhoto}
    />
  ) : (
    <View style={styles.playerPhoto} /> // fallback if image doesn't exist
  )}
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
  photoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 4,              // make the border thicker to show team color
    borderColor: 'transparent',  // will override in JSX dynamically
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  playerPhoto: {  
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    backgroundColor: '#1f2937',  // fallback if no image
  },
  
  
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
