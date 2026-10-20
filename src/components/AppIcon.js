import React from 'react';
import { Text, View, Platform, StyleSheet } from 'react-native';

// Icon Map cho Web (tránh lỗi xung đột expo-font/registerWebModule của Metro Web)
const ICON_UNICODE_MAP = {
  'search-outline': '🔍',
  'search': '🔍',
  'close-circle': '✖',
  'close': '✕',
  'folder-open-outline': '📁',
  'folder-outline': '📁',
  'folder': '📁',
  'play': '▶',
  'person-outline': '👤',
  'person': '👤',
  'time-outline': '⏱',
  'time': '⏱',
  'calendar': '📅',
  'create-outline': '✏️',
  'trash-outline': '🗑',
  'trash': '🗑',
  'arrow-back': '←',
  'add': '+',
  'add-circle': '⊕',
  'checkmark-circle': '✓',
  'ellipse-outline': '○',
  'image-outline': '🖼',
  'open-outline': '↗',
  'alert-circle-outline': '⚠️',
  'cloud-offline-outline': '☁️',
  'file-tray-outline': '📂',
  'reload': '↻',
};

export const Ionicons = ({ name, size = 20, color = '#4F46E5', style }) => {
  if (Platform.OS === 'web') {
    const symbol = ICON_UNICODE_MAP[name] || '•';
    return (
      <Text
        style={[
          styles.webIcon,
          {
            fontSize: size,
            color,
            lineHeight: size + 2,
          },
          style,
        ]}
      >
        {symbol}
      </Text>
    );
  }

  // Trên Mobile Native (Android / iOS)
  try {
    const VectorIcons = require('@expo/vector-icons');
    const NativeIonicons = VectorIcons.Ionicons;
    return <NativeIonicons name={name} size={size} color={color} style={style} />;
  } catch (e) {
    return (
      <Text style={[styles.webIcon, { fontSize: size, color }, style]}>
        {ICON_UNICODE_MAP[name] || '•'}
      </Text>
    );
  }
};

const styles = StyleSheet.create({
  webIcon: {
    textAlign: 'center',
    textAlignVertical: 'center',
    fontWeight: '700',
    userSelect: 'none',
  },
});

export default Ionicons;
