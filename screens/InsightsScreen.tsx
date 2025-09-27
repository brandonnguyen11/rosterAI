import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image,
  ActivityIndicator,
  Alert,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NavigationBar from '../components/NavigationBar';
import PlayerCard, { PlayerCardData, PlayerInsight } from '../components/PlayerCard';
import { SafeAreaView } from 'react-native';

interface InsightsScreenProps {
  csvData: any[];
  setCsvData: (data: any[]) => void;
  onHomePress: () => void;
  onBookPress: () => void;
  onEyePress: () => void;
  onNavigateToHome?: () => void;
}

// This is where your teammate will integrate their AI insights
class AIInsightsService {
  // Mock function - your teammate will replace this with actual AI integration
  static async generateInsights(playerData: any): Promise<{
    recommendation: 'START' | 'SIT';
    confidence: number;
    insights: PlayerInsight[];
  }> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock AI insights - your teammate will replace this with real AI logic
    const mockInsights: PlayerInsight[] = [
      {
        icon: 'trending-up-outline',
        title: 'Recent Form',
        description: 'Strong performance in last 3 games with consistent touches',
        impact: 'positive'
      },
      {
        icon: 'shield-outline',
        title: 'Matchup Analysis',
        description: 'Favorable matchup against bottom-ranked defense',
        impact: 'positive'
      },
      {
        icon: 'fitness-outline',
        title: 'Health Status',
        description: 'Listed as questionable with minor injury concern',
        impact: 'negative'
      }
    ];

    return {
      recommendation: Math.random() > 0.5 ? 'START' : 'SIT',
      confidence: Math.floor(Math.random() * 30) + 70, // 70-100%
      insights: mockInsights
    };
  }
}

export default function InsightsScreen({ 
  csvData, 
  setCsvData,
  onHomePress, 
  onBookPress, 
  onEyePress,
  onNavigateToHome 
}: InsightsScreenProps) {
  const [playerCards, setPlayerCards] = useState<PlayerCardData[]>([]);
  const [loading, setLoading] = useState(false);

  // Team colors mapping - extend this as needed
  const teamColors: { [key: string]: string } = {
    'SF': '#AA0000',   // 49ers
    'KC': '#E31837',   // Chiefs  
    'DAL': '#003594',  // Cowboys
    'GB': '#203731',   // Packers
    'NE': '#002244',   // Patriots
    'PIT': '#FFB612',  // Steelers
    'BAL': '#241773',  // Ravens
    'CIN': '#FB4F14',  // Bengals
    'CLE': '#311D00',  // Browns
    'TEN': '#0C2340',  // Titans
    'IND': '#002C5F',  // Colts
    'HOU': '#03202F',  // Texans
    'JAX': '#006778',  // Jaguars
    'DEN': '#FB4F14',  // Broncos
    'LV': '#000000',   // Raiders
    'LAC': '#0080C6',  // Chargers
    'BUF': '#00338D',  // Bills
    'MIA': '#008E97',  // Dolphins
    'NYJ': '#125740',  // Jets
    'LAR': '#003594',  // Rams
    'SEA': '#002244',  // Seahawks
    'ARI': '#97233F',  // Cardinals
    'ATL': '#A71930',  // Falcons
    'CAR': '#0085CA',  // Panthers
    'NO': '#D3BC8D',   // Saints
    'TB': '#D50A0A',   // Buccaneers
    'WAS': '#773141',  // Commanders
    'NYG': '#0B2265',  // Giants
    'PHI': '#004C54',  // Eagles
    'MIN': '#4F2683',  // Vikings
    'DET': '#0076B6',  // Lions
    'CHI': '#0B162A',  // Bears
    // Add more teams as needed
  };

  // Check for data on mount and when csvData changes
  useEffect(() => {
    checkAndLoadData();
  }, []);

  useEffect(() => {
    if (csvData && csvData.length > 0) {
      processPlayersWithAI();
    }
  }, [csvData]);

  const checkAndLoadData = async () => {
    try {
      if (!csvData || csvData.length === 0) {
        // Try to load from AsyncStorage
        const savedData = await AsyncStorage.getItem('rosterData');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          setCsvData(parsedData);
        }
      } else {
        processPlayersWithAI();
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  };

  const handleImportRoster = () => {
    if (onNavigateToHome) {
      onNavigateToHome();
    }
  };

  const handleClearData = async () => {
    Alert.alert(
      'Clear Roster',
      'Are you sure you want to clear all roster data?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('rosterData');
              await AsyncStorage.removeItem('rosterFileName');
              setCsvData([]);
              setPlayerCards([]);
            } catch (error) {
              console.error('Error clearing data:', error);
            }
          },
        },
      ]
    );
  };

  // Convert CSV data to player cards with AI insights
  const processPlayersWithAI = async () => {
    if (!csvData || csvData.length === 0) return;

    setLoading(true);
    try {
      const processedPlayers: PlayerCardData[] = [];

      for (const player of csvData) {
        // Get AI insights for each player
        const aiResult = await AIInsightsService.generateInsights(player);
        
        const playerCard: PlayerCardData = {
          playerName: player.playerName || player.Player || 'Unknown Player',
          team: player.team || player.Team || 'UNK',
          position: player.position || player.POS || 'FLEX',
          opponent: player.opponent || player.Opponent || 'TBD',
          gameTime: player.gameTime || 'TBD',
          recommendation: aiResult.recommendation,
          confidence: aiResult.confidence,
          teamColor: teamColors[player.team || player.Team] || '#6b7280', // default gray
          insights: aiResult.insights
        };

        processedPlayers.push(playerCard);
      }

      setPlayerCards(processedPlayers);
    } catch (error) {
      console.error('Error processing players:', error);
      Alert.alert('Error', 'Failed to generate insights for players');
    } finally {
      setLoading(false);
    }
  };

  const handleStartPress = (player: PlayerCardData) => {
    console.log(`START selected for ${player.playerName}`);
    // Add your logic here (e.g., update lineup, analytics)
  };

  const handleSitPress = (player: PlayerCardData) => {
    console.log(`SIT selected for ${player.playerName}`);
    // Add your logic here (e.g., update lineup, analytics)
  };

  const renderPlayerCard = ({ item }: { item: PlayerCardData }) => (
    <View style={styles.cardContainer}>
      <PlayerCard 
        player={item}
        onStartPress={handleStartPress}
        onSitPress={handleSitPress}
      />
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="analytics-outline" size={80} color="#9ca3af" />
      <Text style={styles.emptyTitle}>No Players Found</Text>
      <Text style={styles.emptySubtitle}>
        Import your CSV roster to see player insights and recommendations
      </Text>
      
      <TouchableOpacity 
        style={styles.importButton}
        onPress={handleImportRoster}
      >
        <Ionicons name="download-outline" size={20} color="#fff" />
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image 
          source={require('../assets/Logo.png')}
          style={styles.logo} 
        />
        <Text style={styles.headerTitle}>Player Insights</Text>
        
        {/* Header Actions */}
        {csvData && csvData.length > 0 && (
          <View style={styles.headerActions}>
            <TouchableOpacity 
              onPress={handleImportRoster}
              style={styles.headerButton}
            >
              <Ionicons name="download-outline" size={20} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleClearData}
              style={styles.headerButton}
            >
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {loading ? (
          renderLoadingState()
        ) : playerCards.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={playerCards}
            renderItem={renderPlayerCard}
            keyExtractor={(item, index) => `${item.playerName}-${index}`}
            numColumns={2}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Navigation Bar */}
      <NavigationBar
        onHomePress={onHomePress}
        onBookPress={onBookPress}
        onEyePress={onEyePress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 12,
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  content: {
    flex: 1,
    paddingBottom: 80, // Space for navigation bar
  },
  listContainer: {
    padding: 8,
  },
  cardContainer: {
    flex: 1,
    maxWidth: '50%',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0093D5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  importButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#9ca3af',
    marginTop: 16,
  },
});