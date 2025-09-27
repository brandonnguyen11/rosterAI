import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, StyleSheet } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import NewsScreen from './screens/NewsScreen';
import NavigationBar from './components/NavigationBar';
import { useEffect } from 'react';
import RosterScreen from './screens/RosterScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Home'); // track active screen
  const [csvData, setCsvData] = useState<any[]>([]); // lift CSV data here
  const [csvImported, setCsvImported] = useState(false);
  
  useEffect(() => {
    csvData.forEach(player => {
      console.log(player.playerName, player.POS);
    });
    setCurrentScreen('Roster')
  }, [csvData]);

  
  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Conditional rendering based on currentScreen */}
        {currentScreen === 'Home' && (
          <HomeScreen
            csvData={csvData}
            setCsvData={setCsvData}
            onCsvImported={() => {
              setCsvImported(true);
              setCurrentScreen('Roster');
            }} 
          />
        )}
        {currentScreen === 'News' && <NewsScreen />}
        {currentScreen === 'Roster' && (
          <RosterScreen csvData={csvData} setCsvData={setCsvData} />
        )}

        {/* Navigation bar (optional if you want manual nav too) */}
        <NavigationBar
          onHomePress={() => setCurrentScreen(csvImported ? 'Roster' : 'Home')}
          onBookPress={() => setCurrentScreen('News')}
          onEyePress={() => console.log('Insights pressed')}
        />
      </View>
    </SafeAreaProvider>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1 },
});
