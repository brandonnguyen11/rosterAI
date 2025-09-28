import React from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NavigationBar from '../components/NavigationBar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getPositionColor } from '../utils/positionColors';

interface RosterScreenProps {
  csvData: any[];
  setCsvData: (data: any[]) => void;
  onHomePress?: () => void;
  onBookPress?: () => void;
  onEyePress?: () => void;
  onNavigateToHome?: () => void;
}

export default function RosterScreen({ 
  csvData,
  setCsvData, 
  onHomePress, 
  onBookPress, 
  onEyePress,
  onNavigateToHome 
}: RosterScreenProps) {
  const handleImportNew = () => {
    Alert.alert(
      'Import New Roster',
      'This will replace your current roster data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Import', onPress: () => onNavigateToHome && onNavigateToHome() },
      ]
    );
  };

  const handleClearData = async () => {
    Alert.alert(
      'Clear Roster',
      'Are you sure you want to clear all roster data?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('rosterData');
              await AsyncStorage.removeItem('rosterFileName');
              setCsvData([]);
            } catch (error) {
              console.error('Error clearing data:', error);
            }
          },
        },
      ]
    );
  };

  if (!csvData || csvData.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Image source={require('../assets/Logo.png')} style={styles.logo} />
          <Text style={styles.headerTitle}>Your Roster</Text>
        </View>

        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={80} color="#636363" />
          <Text style={styles.emptyText}>No roster data available</Text>
          <Text style={styles.emptySubtext}>Import your CSV file to see your players here</Text>
          <TouchableOpacity style={styles.importButton} onPress={onNavigateToHome}>
            <Ionicons name="download-outline" size={20} color="#fff" />
            <Text style={styles.importButtonText}>Import Roster</Text>
          </TouchableOpacity>
        </View>

        <NavigationBar onHomePress={onHomePress} onBookPress={onBookPress} onEyePress={onEyePress} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Image source={require('../assets/Logo.png')} style={styles.logo} />
          <Text style={styles.headerTitle}>Your Roster</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleImportNew} style={styles.headerButton}>
              <Ionicons name="download-outline" size={20} color="#6dff01" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleClearData} style={styles.headerButton}>
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
         

          <View style={styles.summaryContainer}>
            <Text style={styles.summaryText}>
              {csvData.length} players • {csvData.filter(p => p.Slot !== 'BEN').length} starting • {csvData.filter(p => p.Slot === 'BEN').length} bench
            </Text>
          </View>

          <FlatList
            data={[
              { type: 'header', label: 'Active Lineup' },
              ...csvData.filter(player => player.Slot !== 'BEN').map(p => ({ type: 'player', ...p })),
              { type: 'header', label: 'Bench' },
              ...csvData.filter(player => player.Slot === 'BEN').map(p => ({ type: 'player', ...p })),
            ]}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => {
              if (item.type === 'header') {
                return (
                  <View style={styles.sectionHeader}>
                    <Text style={styles.subHeader}>{item.label}</Text>
                  </View>
                );
              }
              const position = item.POS || item.position || 'FLEX';
              return (
                <View style={styles.playerCard}>
                  <View style={styles.playerLeft}>
                    <View style={[styles.positionBadge, { backgroundColor: getPositionColor(position) }]}>
                      <Text style={styles.positionText}>{position.substring(0, 3)}</Text>
                    </View>
                    <View style={styles.playerInfo}>
                      <Text style={styles.playerName}>{item.playerName || item.Player || 'Unknown Player'}</Text>
                      <Text style={styles.details}>
                        {(item.Team || item.team || 'UNK')} {(item.Opponent || item.opponent || 'vs TBD')}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.projPoints}>{item.Proj || item.projection || '-'}</Text>
                </View>
              );
            }}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </SafeAreaView>

      <NavigationBar onHomePress={onHomePress} onBookPress={onBookPress} onEyePress={onEyePress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f23' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 24, paddingBottom: 16 },
  logo: { width: 40, height: 40, resizeMode: 'contain' },
  headerTitle: { fontSize: 35, fontFamily: "System", letterSpacing: -1, fontWeight: 'bold', color: '#ffffff', marginLeft: 12, flex: 1 },
  headerActions: { flexDirection: 'row', gap: 12 },
  headerButton: { padding: 8, backgroundColor: "#1c1c1cff", borderColor: "rgba(255,255,255,0.1)", borderRadius: 20, borderWidth: 1 },
  content: { flex: 1, paddingHorizontal: 16 },
  headerLine: { height: 3, backgroundColor: '#FFFFFF', width: '45%', marginLeft: 0, marginBottom: 12, borderRadius: 1 },
  summaryContainer: { marginBottom: 16 },
  summaryText: { fontSize: 14, color: '#FFFFFF', textAlign: 'center', fontFamily: "System" },
  sectionHeader: { marginTop: 16, marginBottom: 8 },
  subHeader: { fontSize: 20, fontWeight: '600', color: '#FFFFFF', fontFamily: "System", textAlign: 'left' },
  playerCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, marginVertical: 6, backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)", borderRadius: 20, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
  playerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  positionBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginRight: 12, minWidth: 40, alignItems: 'center' },
  positionText: { color: '#fff', fontSize: 12, fontWeight: '600', fontFamily: "System" },
  playerInfo: { flex: 1 },
  playerName: { fontSize: 18, fontWeight: '600', color: '#FFFFFF', fontFamily: "System" },
  details: { fontSize: 14, color: '#a7a6a6ff', marginTop: 4, fontFamily: "System" },
  projPoints: { fontSize: 20, fontWeight: '600', color: '#8000ff', textAlign: 'right', minWidth: 40, fontFamily: "System" },
  listContainer: { paddingBottom: 100 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  emptyText: { fontSize: 24, fontWeight: 'bold', color: '#636363', marginBottom: 8, marginTop: 16, textAlign: 'center', fontFamily: "System" },
  emptySubtext: { fontSize: 16, color: '#999', textAlign: 'center', lineHeight: 22, marginBottom: 32, fontFamily: "System" },
  importButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0093D5', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, gap: 8 },
  importButtonText: { color: '#fff', fontSize: 16, fontWeight: '600', fontFamily: "System" },
});
