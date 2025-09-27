import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Papa from 'papaparse';
import { SafeAreaView } from 'react-native';
import NavigationBar from '../components/NavigationBar';


interface HomeScreenProps {
  csvData: any[];
  setCsvData: (data: any[]) => void;
  onCsvImported: () => void;
  onNavigateToInsights: () => void;
  onNavigateToNews: () => void;
  onNavigateToRoster: () => void;
}

export default function HomeScreen({ 
  csvData, 
  setCsvData, 
  onCsvImported, 
  onNavigateToInsights,
  onNavigateToNews,
  onNavigateToRoster
}: HomeScreenProps) {
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [hasImportedData, setHasImportedData] = useState(false);
  const [showImportInterface, setShowImportInterface] = useState(false);

  // Check for existing data on component mount
  useEffect(() => {
    checkForExistingData();
  }, []);

  // Update hasImportedData when csvData changes
  useEffect(() => {
    setHasImportedData(csvData && csvData.length > 0);
  }, [csvData]);

  const checkForExistingData = async () => {
    try {
      const savedData = await AsyncStorage.getItem('rosterData');
      const savedFileName = await AsyncStorage.getItem('rosterFileName');
      
      if (savedData && savedFileName) {
        const parsedData = JSON.parse(savedData);
        setCsvData(parsedData);
        setFileUri(savedFileName);
        setHasImportedData(true);
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  };

  const handleHomePress = () => console.log('Home pressed');
  
  const handleBookPress = () => {
    console.log('News Pressed');
    onNavigateToNews();
  };
  
  const handleEyePress = () => {
    console.log('Insights pressed');
    onNavigateToInsights();
  };

  const saveRosterData = async (data: any[], fileName: string) => {
    try {
      await AsyncStorage.setItem('rosterData', JSON.stringify(data));
      await AsyncStorage.setItem('rosterFileName', fileName);
    } catch (error) {
      console.error('Error saving roster data:', error);
    }
  };

  const handleImportPress = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/csv',
        copyToCacheDirectory: true,
      });
  
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const fileUri = file.uri;
        const fileName = file.name ?? fileUri.split('/').pop();
  
        // Read CSV contents
        const fileContents = await FileSystem.readAsStringAsync(fileUri);
  
        // Parse CSV
        const parsed = Papa.parse(fileContents, {
          header: true,
          skipEmptyLines: true,
        });
  
        // Save data persistently
        await saveRosterData(parsed.data as any[], fileName ?? 'roster.csv');
        
        setCsvData(parsed.data as any[]);
        setFileUri(fileName ?? 'roster.csv');
        setHasImportedData(true);
        setShowImportInterface(false);
  
        Alert.alert('CSV Imported', `Loaded ${parsed.data.length} rows from ${fileName}`, [
          {
            text: 'View Roster',
            onPress: () => {
              onCsvImported();
              onNavigateToRoster();
            }
          },
          {
            text: 'OK',
            style: 'default'
          }
        ]);
        
        console.log(parsed.data);
        
      } else {
        console.log('User cancelled document picker');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to import CSV');
    }
  };

  const handleImportNew = () => {
    setShowImportInterface(true);
    handleImportPress();
  };

  const clearData = async () => {
    Alert.alert(
      'Clear Roster Data',
      'Are you sure you want to clear your current roster data?',
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
              setFileUri(null);
              setHasImportedData(false);
              setShowImportInterface(false);
            } catch (error) {
              console.error('Error clearing data:', error);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image 
          source={require('../assets/Logo.png')}
          style={styles.logo} 
        />
        <Text style={styles.headerTitle}>Fantasy Hub</Text>
      </View>

      {/* Main content */}
      <View style={styles.content}>
        {!hasImportedData ? (
          // First time user - show import interface
        //   <>
        //     <TouchableOpacity style={styles.importButton} onPress={handleImportPress}>
        //       <Ionicons name="download-outline" size={80} color="#fff" />
        //     </TouchableOpacity>
        //     <Text style={styles.importLabel}>Import Roster</Text>
        //     <Text style={styles.importLabel}>As CSV</Text>
        //   </>
            <View style={styles.container}>


                <View style={styles.emptyContainer}>
                    <Ionicons name="people-outline" size={80} color="#9ca3af" />
                    <Text style={styles.emptyText}>No roster data available</Text>
                    <Text style={styles.emptySubtext}>Import your CSV file to see your players here</Text>
                    
                    <TouchableOpacity 
                    style={styles.importButton}
                    onPress={handleImportPress}
                    >
                    <Ionicons name="download-outline" size={20} color="#fff" />
                    <Text style={styles.importButtonText}>Import Roster</Text>
                    </TouchableOpacity>
                </View>
            </View>
        
        ) : (
          // User has data - show roster status and options
          <>
            <View style={styles.statusContainer}>
              <Ionicons name="checkmark-circle" size={80} color="#10b981" />
              <Text style={styles.statusTitle}>Roster Loaded</Text>
              <Text style={styles.statusSubtitle}>
                {csvData.length} players from {fileUri}
              </Text>
            </View>
            
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity 
                style={styles.primaryActionButton}
                onPress={onNavigateToRoster}
              >
                <Ionicons name="people-outline" size={24} color="#fff" />
                <Text style={styles.primaryActionButtonText}>View Roster</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.secondaryActionButton}
                onPress={handleImportNew}
              >
                <Ionicons name="download-outline" size={20} color="#0093D5" />
                <Text style={styles.secondaryActionButtonText}>Import New</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.secondaryActionButton}
                onPress={clearData}
              >
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
                <Text style={[styles.secondaryActionButtonText, { color: '#ef4444' }]}>Clear Data</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* Navigation Bar */}
      <NavigationBar
        onHomePress={handleHomePress}
        onBookPress={handleBookPress}
        onEyePress={handleEyePress}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
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
  importLabel: {
    marginTop: 12,
    fontSize: 24,
    color: '#636363',
    fontFamily: 'OpenSans-SemiBold',
    textAlign: 'center',
    lineHeight: 30,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  statusTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#10b981',
    marginTop: 16,
    textAlign: 'center',
  },
  statusSubtitle: {
    fontSize: 16,
    color: '#636363',
    marginTop: 8,
    textAlign: 'center',
  },
  actionButtonsContainer: {
    width: '100%',
    gap: 16,
  },
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0093D5',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  primaryActionButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    gap: 8,
  },
  secondaryActionButtonText: {
    color: '#0093D5',
    fontSize: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },emptyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  importButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});