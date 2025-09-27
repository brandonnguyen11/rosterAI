import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import NavigationBar from '../components/NavigationBar';


export default function HomeScreen() {
  const handleHomePress = () => {
    console.log('Home pressed');
  };

  const handleBookPress = () => {
    console.log('News Pressed');
  };

  const handleEyePress = () => {
    console.log('Insights pressed');
  };

  const handleImportPress = () => {
    console.log('Import CSV pressed');
  };

  return (
    <View style={styles.container}>
      {/* Header with logo and import button */}
      <View style={styles.header}>
        <View style={styles.importContainer}>
          <TouchableOpacity style={styles.importButton} onPress={handleImportPress}>
            <Text style={styles.importButtonText}>Import</Text>
          </TouchableOpacity>
          <Text style={styles.importLabel}>Import roster as CSV</Text>
        </View>
      </View>

      {/* Main content */}
      <View style={styles.content}>
        <Text style={styles.text}>BALLS</Text>
      </View>

      {/* Navigation Bar at the bottom */}
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  importContainer: {
    flex: 1,
    alignItems: 'center',
  },
  importButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  importButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  importLabel: {
    marginTop: 4,
    fontSize: 12,
    color: '#555',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
  },
});
