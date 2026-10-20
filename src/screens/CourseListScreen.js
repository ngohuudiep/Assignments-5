import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '../components/AppIcon';
import { useApp } from '../context/AppContext';
import { CourseCard } from '../components/CourseCard';
import { CategoryFilter } from '../components/CategoryFilter';
import { LoadingView, EmptyState, ErrorView } from '../components/StateViews';
import { COLORS, SPACING, SHADOWS } from '../constants/theme';
import { showConfirmDialog, showInfoDialog } from '../utils/dialog';

export default function CourseListScreen({ navigation }) {
  // Sử dụng Reactive State & Repositories từ useApp
  const {
    courses,
    categories,
    loading,
    error,
    refreshData,
    deleteCourse,
    getCategoryName,
    courseRepository,
  } = useApp();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  // Lọc và tìm kiếm Reactive thông qua CourseRepository
  const filteredCourses = useMemo(() => {
    return courseRepository.filterAndSearch(courses, searchQuery, selectedCategoryId);
  }, [courses, searchQuery, selectedCategoryId, courseRepository]);

  const handleCoursePress = (course) => {
    navigation.navigate('CourseDetail', {
      courseId: course.id,
      categoryName: getCategoryName(course.categoryId),
    });
  };

  const handlePlayTrailer = (course) => {
    if (course.trailerUrl) {
      navigation.navigate('TrailerPlayer', {
        title: course.title,
        trailerUrl: course.trailerUrl,
      });
    }
  };

  const handleDeleteCourse = (course) => {
    showConfirmDialog({
      title: 'Xác nhận xóa khóa học',
      message: `Bạn có chắc chắn muốn xóa khóa học "${course.title}" khỏi hệ thống không?`,
      confirmText: 'Xóa ngay',
      cancelText: 'Hủy bỏ',
      destructive: true,
      onConfirm: async () => {
        try {
          await deleteCourse(course.id);
          showInfoDialog('Thành công', 'Đã xóa khóa học thành công!');
        } catch (err) {
          showInfoDialog('Lỗi', err.message || 'Không thể xóa khóa học.');
        }
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appSubtitle}>HỆ THỐNG ĐÀO TẠO (REACTIVE & REPO)</Text>
          <Text style={styles.appTitle}>Quản lý Khóa học</Text>
        </View>

        <TouchableOpacity
          style={styles.categoryManageBtn}
          onPress={() => navigation.navigate('CategoryManage')}
          activeOpacity={0.8}
        >
          <Ionicons name="folder-open-outline" size={18} color={COLORS.primary} />
          <Text style={styles.categoryManageBtnText}>Danh mục</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm khóa học theo tên..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Pills Filter */}
      <CategoryFilter
        categories={categories}
        selectedId={selectedCategoryId}
        onSelect={setSelectedCategoryId}
      />

      {/* Main Content Area */}
      {loading ? (
        <LoadingView message="Đang kết nối MockAPI và tải khóa học..." />
      ) : error ? (
        <ErrorView message={error} onRetry={refreshData} />
      ) : (
        <FlatList
          data={filteredCourses}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          renderItem={({ item }) => (
            <CourseCard
              course={item}
              categoryName={getCategoryName(item.categoryId)}
              onPress={handleCoursePress}
              onPlayTrailer={handlePlayTrailer}
              onDelete={handleDeleteCourse}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="search-outline"
              title="Không tìm thấy khóa học"
              message={
                searchQuery || selectedCategoryId !== null
                  ? 'Không có khóa học nào khớp với bộ lọc hoặc từ khóa tìm kiếm.'
                  : 'Hiện chưa có khóa học nào trên hệ thống.'
              }
              actionLabel={searchQuery || selectedCategoryId !== null ? 'Đặt lại bộ lọc' : 'Thêm khóa học đầu tiên'}
              onAction={() => {
                if (searchQuery || selectedCategoryId !== null) {
                  setSearchQuery('');
                  setSelectedCategoryId(null);
                } else {
                  navigation.navigate('CourseForm');
                }
              }}
            />
          }
        />
      )}

      {/* Floating Action Button (Thêm khóa học mới) */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CourseForm')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color={COLORS.textLight} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    height: '100%',
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  appSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  categoryManageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  categoryManageBtnText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  searchWrapper: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: SPACING.sm + 4,
    height: 46,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.xs + 2,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xs,
    paddingBottom: 90,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.lg,
  },
});
