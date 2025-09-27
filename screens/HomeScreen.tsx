import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NavigationBar from '../components/NavigationBar';

export default function HomeScreen() {
  const handleHomePress = () => console.log('Home pressed');
  const handleBookPress = () => console.log('News Pressed');
  const handleEyePress = () => console.log('Insights pressed');
  const handleImportPress = () => console.log('Import CSV pressed');

  return (
    <View style={styles.container}>
      {/* Header with logo */}
      <View style={styles.header}>
        <Image 
          source={require('../assets/Logo.png')} // replace with your logo path
          style={styles.logo} 
        />
      </View>

      {/* Main content */}
      <View style={styles.content}>
        <TouchableOpacity style={styles.importButton} onPress={handleImportPress}>
          <Ionicons name="cloud-download-outline" size={40} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.importLabel}>Import roster as CSV</Text>
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
    width: 100,           // large round button
    height: 100,
    borderRadius: 50,     // makes it perfectly circular
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  importLabel: {
    marginTop: 12,
    fontSize: 14,
    color: '#555',
  },
});
