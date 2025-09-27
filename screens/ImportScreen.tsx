import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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

  return (
    <View style={styles.container}>
      {/* Your existing HomeScreen content */}
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
  },
});
