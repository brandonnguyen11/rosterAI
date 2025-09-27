import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from './screens/HomeScreen';
import RosterScreen from './screens/RosterScreen';
import InsightsScreen from './screens/InsightsScreen';
import NewsScreen from './screens/NewsScreen';

type Screen = 'Home' | 'Roster' | 'Insights' | 'News';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('Home');
  const [csvData, setCsvData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved data on app start
  useEffect(() => {
    loadSavedRosterData();
  }, []);

  const loadSavedRosterData = async () => {
    try {
      const savedData = await AsyncStorage.getItem('rosterData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setCsvData(parsedData);
        console.log(`Loaded ${parsedData.length} players from storage`);
      }
    } catch (error) {
      console.error('Error loading roster data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveRosterData = async (data: any[]) => {
    try {
      await AsyncStorage.setItem('rosterData', JSON.stringify(data));
      setCsvData(data);
      console.log(`Saved ${data.length} players to storage`);
    } catch (error) {
      console.error('Error saving roster data:', error);
    }
  };

  // Navigation functions
  const navigateToHome = () => setCurrentScreen('Home');
  const navigateToRoster = () => setCurrentScreen('Roster');
  const navigateToInsights = () => setCurrentScreen('Insights');
  const navigateToNews = () => setCurrentScreen('News');

  // CSV import handler
  const handleCsvImported = () => {
    setTimeout(() => {
      setCurrentScreen('Roster');
    }, 1000);
  };

  if (isLoading) {
    return null; // you can add a loading indicator here
  }

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'Home':
        return (
          <HomeScreen
            csvData={csvData}
            setCsvData={saveRosterData}
            onCsvImported={handleCsvImported}
            onNavigateToInsights={navigateToInsights}
            onNavigateToNews={navigateToNews}
            onNavigateToRoster={navigateToRoster}
          />
        );

      case 'Roster':
        return (
          <RosterScreen
            csvData={csvData}
            setCsvData={saveRosterData}
            onHomePress={navigateToHome}
            onBookPress={navigateToNews}
            onEyePress={navigateToInsights}
            onNavigateToHome={navigateToHome}
          />
        );

      case 'Insights':
        return (
          <InsightsScreen
            csvData={csvData}
            setCsvData={saveRosterData}
            onHomePress={navigateToHome}
            onBookPress={navigateToNews}
            onEyePress={navigateToInsights}
            onNavigateToHome={navigateToHome}
          />
        );

      case 'News':
        return (
          <NewsScreen
            csvData={csvData}
            setCsvData={saveRosterData}
            onHomePress={navigateToHome}
            onBookPress={navigateToNews}
            onEyePress={navigateToInsights}
            onNavigateToHome={navigateToHome}
          />
        );

      default:
        return (
          <HomeScreen
            csvData={csvData}
            setCsvData={saveRosterData}
            onCsvImported={handleCsvImported}
            onNavigateToInsights={navigateToInsights}
            onNavigateToNews={navigateToNews}
            onNavigateToRoster={navigateToRoster}
          />
        );
    }
  };

  return (
    <SafeAreaProvider>
      {renderCurrentScreen()}
    </SafeAreaProvider>
  );
}
