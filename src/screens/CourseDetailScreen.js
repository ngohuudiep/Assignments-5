import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '../components/AppIcon';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../services/api';
import { COLORS, SPACING, SHADOWS } from '../constants/theme';
import { LoadingView, ErrorView } from '../components/StateViews';

import { showConfirmDialog, showInfoDialog } from '../utils/dialog';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80';

export default function CourseDetailScreen({ route, navigation }) {
  const { courseId } = route.params;
  const { courses, deleteCourse, getCategoryName, loading } = useApp();

  const [deleting, setDeleting] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Tìm khóa học trực tiếp từ Reactive Store (tự động cập nhật nếu vừa được Sửa)
  const course = useMemo(() => {
    return courses.find((c) => String(c.id) === String(courseId));
  }, [courses, courseId]);

  const categoryName = course ? getCategoryName(course.categoryId) : '';

  const handleDelete = () => {
    showConfirmDialog({
      title: 'Xác nhận xóa khóa học',
      message: `Bạn có chắc chắn muốn xóa khóa học "${course?.title || ''}" khỏi hệ thống không?`,
      confirmText: 'Xóa ngay',
      cancelText: 'Hủy bỏ',
      destructive: true,
      onConfirm: async () => {
        try {
          setDeleting(true);
          await deleteCourse(courseId);
          showInfoDialog('Thành công', 'Đã xóa khóa học thành công!', () => {
            navigation.goBack();
          });
        } catch (err) {
          showInfoDialog('Lỗi', err.message || 'Không thể xóa khóa học.');
        } finally {
          setDeleting(false);
        }
      },
    });
  };

  const handlePlayTrailer = () => {
    if (!course?.trailerUrl) {
      showInfoDialog('Thông báo', 'Khóa học này chưa cập nhật URL video trailer.');
      return;
    }
    navigation.navigate('TrailerPlayer', {
      title: course.title,
      trailerUrl: course.trailerUrl,
    });
  };

  if (loading) return <LoadingView message="Đang tải chi tiết khóa học..." />;
  if (!course) {
    return (
      <ErrorView
        message="Khóa học này không tồn tại hoặc đã bị xóa."
        onRetry={() => navigation.goBack()}
      />
    );
  }

  const imageUri = imageError || !course.thumbnail ? DEFAULT_IMAGE : course.thumbnail;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero Image Section */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUri }}
            style={styles.heroImage}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />

          {/* Top Floating Back Button */}
          <TouchableOpacity
            style={styles.floatingBackBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>

          {/* Category Chip Badge */}
          {categoryName ? (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{categoryName}</Text>
            </View>
          ) : null}
        </View>

        {/* Content Section */}
        <View style={styles.body}>
          <Text style={styles.title}>{course.title}</Text>

          {/* Highlight Info Grid */}
          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Ionicons name="person" size={20} color={COLORS.primary} />
              <Text style={styles.infoLabel}>Giảng viên</Text>
              <Text style={styles.infoValue} numberOfLines={1}>
                {course.instructor || 'Chưa cập nhật'}
              </Text>
            </View>

            <View style={styles.infoCard}>
              <Ionicons name="time" size={20} color={COLORS.secondary} />
              <Text style={styles.infoLabel}>Thời lượng</Text>
              <Text style={styles.infoValue}>{course.duration || 0} giờ</Text>
            </View>

            <View style={styles.infoCard}>
              <Ionicons name="calendar" size={20} color={COLORS.accent} />
              <Text style={styles.infoLabel}>Ngày tạo</Text>
              <Text style={styles.infoValue} numberOfLines={1}>
                {course.createdAt || 'Mới cập nhật'}
              </Text>
            </View>
          </View>

          {/* Price Box */}
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Học phí trọn gói:</Text>
            <Text style={styles.priceValue}>{formatCurrency(course.price)}</Text>
          </View>

          {/* Trailer Button */}
          <TouchableOpacity
            style={styles.trailerBtn}
            onPress={handlePlayTrailer}
            activeOpacity={0.85}
          >
            <View style={styles.playIconCircle}>
              <Ionicons name="play" size={20} color={COLORS.textLight} />
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.trailerBtnTitle}>Xem Video Trailer Khóa Học</Text>
              <Text style={styles.trailerBtnSubtitle}>Phát video trực tiếp trong ứng dụng</Text>
            </View>
          </TouchableOpacity>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mô tả khóa học</Text>
            <Text style={styles.descriptionText}>
              {course.description || 'Chưa có mô tả chi tiết cho khóa học này.'}
            </Text>
          </View>

          {/* URL Reference Info */}
          <View style={styles.metaBox}>
            <Text style={styles.metaRowText}>
              <Text style={{ fontWeight: '700' }}>Mã khóa học (ID): </Text> {course.id}
            </Text>
            <Text style={styles.metaRowText}>
              <Text style={{ fontWeight: '700' }}>Mã danh mục: </Text> {course.categoryId}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate('CourseForm', { course })}
          activeOpacity={0.8}
        >
          <Ionicons name="create-outline" size={20} color={COLORS.primary} style={{ marginRight: 6 }} />
          <Text style={styles.editBtnText}>Chỉnh sửa</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.deleteBtn, deleting && { opacity: 0.6 }]}
          onPress={handleDelete}
          disabled={deleting}
          activeOpacity={0.8}
        >
          {deleting ? (
            <ActivityIndicator size="small" color={COLORS.textLight} />
          ) : (
            <>
              <Ionicons name="trash-outline" size={20} color={COLORS.textLight} style={{ marginRight: 6 }} />
              <Text style={styles.deleteBtnText}>Xóa khóa học</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    height: '100%',
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageContainer: {
    width: '100%',
    height: 250,
    backgroundColor: '#0F172A',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  floatingBackBtn: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryBadgeText: {
    color: COLORS.textLight,
    fontWeight: '700',
    fontSize: 13,
  },
  body: {
    padding: SPACING.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    lineHeight: 28,
    marginVertical: SPACING.xs,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: SPACING.md,
    gap: 8,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: SPACING.sm + 2,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  infoLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  priceLabel: {
    fontSize: 14,
    color: COLORS.primaryDark,
    fontWeight: '600',
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
  },
  trailerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    padding: SPACING.md,
    borderRadius: 14,
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  playIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trailerBtnTitle: {
    color: COLORS.textLight,
    fontSize: 15,
    fontWeight: '700',
  },
  trailerBtnSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: SPACING.md,
    borderRadius: 14,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  descriptionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  metaBox: {
    padding: SPACING.sm,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
  },
  metaRowText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
    ...SHADOWS.lg,
  },
  editBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  editBtnText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  deleteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.danger,
    paddingVertical: 12,
    borderRadius: 12,
  },
  deleteBtnText: {
    color: COLORS.textLight,
    fontSize: 15,
    fontWeight: '700',
  },
});
