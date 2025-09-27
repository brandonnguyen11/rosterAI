// components/Button.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
}

export default function Button({ title, onPress }: ButtonProps) {
  return (
    <TouchableOpacity style={styles.btn} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 8,
  },
  text: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
