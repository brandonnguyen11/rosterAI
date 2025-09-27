import React from 'react';
import { View, Text, FlatList, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface RosterScreenProps {
  csvData: any[];
  setCsvData: (data: any[]) => void;
}

export default function RosterScreen({ csvData }: RosterScreenProps) {
  if (!csvData || csvData.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No roster data available</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Image 
          source={require('../assets/Logo.png')}
          style={styles.logo} 
        />
      </View>

      <Text style={styles.headerText}>Your Roster</Text>
      <View style={styles.headerLine} />

      <FlatList
        data={[
          { type: 'header', label: 'Active' },
          ...csvData.filter(player => player.Slot !== 'BEN').map(p => ({ type: 'player', ...p })),
          { type: 'header', label: 'Bench' },
          ...csvData.filter(player => player.Slot === 'BEN').map(p => ({ type: 'player', ...p })),
        ]}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => {
          if (item.type === 'header') return <Text style={styles.subHeader}>{item.label}</Text>;

          return (
            <View style={styles.playerCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.playerName}>{item.playerName}</Text>
                <Text style={styles.details}>
                  {item.POS} | {item.Team}
                </Text>
              </View>

              <Text style={styles.projPoints}>{item.Proj ?? '-'}</Text>
            </View>
          );
        }}
        contentContainerStyle={{ paddingBottom: 80 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  headerLogo: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
  },
  logo: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  headerText: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'left',
    color: '#636363',
    fontFamily: 'OpenSans-Bold',
    marginTop: 16,
  },
  headerLine: {
    height: 3,
    backgroundColor: '#636363',
    width: '45%',
    marginLeft: 0,
    marginBottom: 12,
    borderRadius: 1,
  },
  subHeader: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    color: '#636363',
    textAlign: 'left',
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    marginVertical: 6,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  playerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  details: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  projPoints: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0093D5',
    textAlign: 'right',
    minWidth: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 40,
  },
});
