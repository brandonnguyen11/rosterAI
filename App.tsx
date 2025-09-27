import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, StyleSheet } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import NewsScreen from './screens/NewsScreen';
import NavigationBar from './components/NavigationBar';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Home'); // track active screen

  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Conditional rendering based on currentScreen */}
        {currentScreen === 'Home' && <HomeScreen />}
        {currentScreen === 'News' && <NewsScreen />}
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
