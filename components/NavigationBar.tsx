import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';

type NavigationBarProps = {
  onHomePress?: () => void;
  onBookPress?: () => void;
  onEyePress?: () => void;
};

export default function NavigationBar({
    onHomePress,
    onBookPress,
    onEyePress,
  }: NavigationBarProps) {
    const insets = useSafeAreaInsets();
  
    return (
      <View style={[styles.bottomNav, { height: 60 + insets.bottom, paddingBottom: insets.bottom }]}>
        <TouchableOpacity style={styles.navButton} onPress={onHomePress}>
          <Entypo name="home" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={onBookPress}>
          <Entypo name="book" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={onEyePress}>
          <Entypo name="eye" size={24} color="white" />
        </TouchableOpacity>
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    bottomNav: {
      position: 'absolute',
      bottom: 0,
      width: '100%',
      flexDirection: 'row',
      backgroundColor: "#1b1b2e",
      height: 60, // will be overridden dynamically
      justifyContent: 'space-around',
      alignItems: 'center',
    },
    navButton: {
      padding: 10,
    },
  });