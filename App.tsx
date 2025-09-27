import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, StyleSheet } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import NewsScreen from './screens/NewsScreen';
import NavigationBar from './components/NavigationBar';
import { useEffect } from 'react';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Home'); // track active screen
  const [csvData, setCsvData] = useState<any[]>([]); // lift CSV data here
  
  useEffect(() => {
    csvData.forEach(player => {
      console.log(player.playerName, player.POS);
    });
  }, [csvData]);

  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Conditional rendering based on currentScreen */}
        {currentScreen === 'Home' && (
          <HomeScreen csvData={csvData} setCsvData={setCsvData} />
        )}
        {currentScreen === 'News' && <NewsScreen/>}
        {/* Add other screens as needed */}

        {/* Navigation bar */}
        <NavigationBar
          onHomePress={() => setCurrentScreen('Home')}
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
