import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';

export const CategoryFilter = ({ categories = [], selectedId, onSelect }) => {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <TouchableOpacity
          style={[
            styles.pill,
            selectedId === null && styles.pillActive,
          ]}
          onPress={() => onSelect(null)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.pillText,
              selectedId === null && styles.pillTextActive,
            ]}
          >
            Tất cả
          </Text>
        </TouchableOpacity>

        {categories.map((cat) => {
          const isSelected = String(selectedId) === String(cat.id);
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.pill, isSelected && styles.pillActive]}
              onPress={() => onSelect(cat.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.pillText, isSelected && styles.pillTextActive]}
                numberOfLines={1}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: SPACING.sm,
  },
  container: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.xs,
  },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  pillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  pillTextActive: {
    color: COLORS.textLight,
  },
});
