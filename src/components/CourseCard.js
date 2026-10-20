import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from './AppIcon';
import { COLORS, SPACING, SHADOWS } from '../constants/theme';
import { formatCurrency } from '../services/api';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80';

export const CourseCard = ({ course, categoryName, onPress, onPlayTrailer, onDelete }) => {
  const [imageError, setImageError] = useState(false);

  const imageUri = imageError || !course.thumbnail ? DEFAULT_IMAGE : course.thumbnail;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.88}
      onPress={() => onPress && onPress(course)}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
        {categoryName ? (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText} numberOfLines={1}>
              {categoryName}
            </Text>
          </View>
        ) : null}

        {onDelete ? (
          <TouchableOpacity
            style={styles.quickDeleteBtn}
            onPress={(e) => {
              if (e && e.stopPropagation) e.stopPropagation();
              onDelete(course);
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="trash-outline" size={16} color="#DC2626" />
          </TouchableOpacity>
        ) : null}

        {course.trailerUrl ? (
          <TouchableOpacity
            style={styles.trailerPlayButton}
            onPress={() => onPlayTrailer && onPlayTrailer(course)}
            activeOpacity={0.8}
          >
            <Ionicons name="play" size={16} color={COLORS.textLight} />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {course.title}
        </Text>

        <View style={styles.metaRow}>
          <Ionicons name="person-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.instructorText} numberOfLines={1}>
            {course.instructor || 'Chưa cập nhật'}
          </Text>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.durationTag}>
            <Ionicons name="time-outline" size={13} color={COLORS.textSecondary} />
            <Text style={styles.durationText}>{course.duration || 0} giờ</Text>
          </View>

          <Text style={styles.priceText}>{formatCurrency(course.price)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    maxWidth: '70%',
  },
  categoryBadgeText: {
    color: COLORS.textLight,
    fontSize: 12,
    fontWeight: '600',
  },
  quickDeleteBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FFFFFF',
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  trailerPlayButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: COLORS.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  content: {
    padding: SPACING.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 22,
    marginBottom: SPACING.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  instructorText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 6,
    fontWeight: '500',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  durationTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
});
