import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import Papa from 'papaparse';
import NavigationBar from '../components/NavigationBar';

export default function HomeScreen() {
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);

  const handleHomePress = () => console.log('Home pressed');
  const handleBookPress = () => console.log('News Pressed');
  const handleEyePress = () => console.log('Insights pressed');

  const handleImportPress = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/csv',
        copyToCacheDirectory: true,
      });
  
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0]; // first file
        const fileUri = file.uri;
        const fileName = file.name ?? fileUri.split('/').pop();
  
        // Read CSV contents
        const fileContents = await FileSystem.readAsStringAsync(fileUri);
  
        // Parse CSV
        const parsed = Papa.parse(fileContents, {
          header: true,
          skipEmptyLines: true,
        });
  
        setCsvData(parsed.data as any[]);
        setFileUri(fileName ?? 'Unknown');
  
        Alert.alert('CSV Imported', `Loaded ${parsed.data.length} rows from ${fileName}`);
        console.log(parsed.data);
      } else {
        console.log('User cancelled document picker');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to import CSV');
    }
  };
  

  return (
    <View style={styles.container}>
      {/* Header with logo */}
      <View style={styles.header}>
        <Image 
          source={require('../assets/Logo.png')}
          style={styles.logo} 
        />
      </View>

      {/* Main content */}
      <View style={styles.content}>
        <TouchableOpacity style={styles.importButton} onPress={handleImportPress}>
          <Ionicons name="download-outline" size={80} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.importLabel}>Import Roster</Text>
        <Text style={styles.importLabel}>As CSV</Text>

        {fileUri && (
          <Text style={{ marginTop: 16, fontSize: 14, color: '#555', textAlign: 'center' }}>
            File: {fileUri} ({csvData.length} rows loaded)
          </Text>
        )}
      </View>

      {/* Navigation Bar */}
      <NavigationBar
        onHomePress={handleHomePress}
        onBookPress={handleBookPress}
        onEyePress={handleEyePress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  importButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#0093D5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  importLabel: {
    marginTop: 12,
    fontSize: 24,
    color: '#636363',
    fontFamily: 'OpenSans-SemiBold',
    textAlign: 'center',
    lineHeight: 30,
  },
});
