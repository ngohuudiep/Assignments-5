import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '../components/AppIcon';
import { useApp } from '../context/AppContext';
import { LoadingView, EmptyState, ErrorView } from '../components/StateViews';
import { COLORS, SPACING, SHADOWS } from '../constants/theme';

import { isDummyCategoryName } from '../repositories/CategoryRepository';
import { showConfirmDialog, showInfoDialog } from '../utils/dialog';

export default function CategoryManageScreen({ navigation }) {
  const {
    categories,
    courses,
    loading,
    error,
    refreshData,
    addCategory,
    updateCategory,
    deleteCategory,
    syncStandardCategories,
    categoryRepository,
  } = useApp();

  // Modal State for Add / Edit
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Đếm số khóa học đang thuộc từng danh mục
  const getCourseCountForCategory = (catId) => {
    return courses.filter((c) => String(c.categoryId) === String(catId)).length;
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setModalVisible(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setName(cat.name || '');
    setDescription(cat.description || '');
    setModalVisible(true);
  };

  const handleSaveCategory = async () => {
    if (!name.trim()) {
      showInfoDialog('Lỗi', 'Vui lòng nhập tên danh mục.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: name.trim(),
        description: description.trim(),
      };

      if (editingCategory) {
        await updateCategory(editingCategory.id, payload);
        showInfoDialog('Thành công', 'Đã cập nhật danh mục!');
      } else {
        await addCategory(payload);
        showInfoDialog('Thành công', 'Đã thêm danh mục mới!');
      }

      setModalVisible(false);
    } catch (err) {
      showInfoDialog('Lỗi', err.message || 'Thao tác không thành công.');
    } finally {
      setSubmitting(false);
    }
  };

  // QUAN TRỌNG: RÀNG BUỘC KIỂM TRA KHÔNG CHO XÓA DANH MỤC ĐANG CÓ KHÓA HỌC (QUA REPOSITORY)
  // Nhưng hỗ trợ tùy chọn giải phóng khóa học (cascade) để người dùng không bị tắc nghẽn khi muốn xóa
  const handleDeleteCategory = (cat) => {
    const check = categoryRepository.canDelete(cat.id, courses);

    if (!check.canDelete) {
      showConfirmDialog({
        title: 'Ràng buộc toàn vẹn dữ liệu',
        message: `Danh mục "${cat.name}" hiện đang có ${check.linkedCount} khóa học liên kết.\n\nTheo quy định hệ thống, không thể xóa danh mục đang có khóa học.\n\nBạn có muốn XÓA DANH MỤC này và tự động chuyển ${check.linkedCount} khóa học liên quan về trạng thái "Chưa phân loại" không?`,
        confirmText: 'Vẫn xóa (Giải phóng)',
        cancelText: 'Giữ lại',
        destructive: true,
        onConfirm: async () => {
          try {
            await deleteCategory(cat.id, true);
            showInfoDialog('Thành công', 'Đã xóa danh mục và chuyển các khóa học về Chưa phân loại!');
          } catch (err) {
            showInfoDialog('Lỗi', err.message || 'Không thể xóa danh mục.');
          }
        },
      });
      return;
    }

    // Nếu không có khóa học nào liên kết, cho phép xóa sau khi xác nhận
    showConfirmDialog({
      title: 'Xác nhận xóa danh mục',
      message: `Bạn có chắc chắn muốn xóa vĩnh viễn danh mục "${cat.name}" không?`,
      confirmText: 'Xóa ngay',
      cancelText: 'Hủy bỏ',
      destructive: true,
      onConfirm: async () => {
        try {
          await deleteCategory(cat.id);
          showInfoDialog('Thành công', 'Đã xóa danh mục thành công!');
        } catch (err) {
          showInfoDialog('Lỗi', err.message || 'Không thể xóa danh mục.');
        }
      },
    });
  };

  // Kiểm tra xem có danh mục nào đang có tên mẫu dummy 'name 1, 2, 3, 4' không
  const hasDummyNames = categories.some((c) => isDummyCategoryName(c.name));

  const handleQuickFixNames = () => {
    showConfirmDialog({
      title: 'Chuẩn hóa tên danh mục',
      message: 'Đổi các danh mục "name 1, name 2, name 3, name 4" thành tên đúng:\n• 1: Lập trình Mobile\n• 2: Lập trình Web\n• 3: Trí tuệ nhân tạo\n• 4: Thiết kế UI/UX & Đồ họa\n\nBạn có muốn cập nhật đồng bộ ngay bây giờ?',
      confirmText: 'Đổi tên ngay',
      cancelText: 'Hủy bỏ',
      destructive: false,
      onConfirm: async () => {
        try {
          setSubmitting(true);
          await syncStandardCategories();
          showInfoDialog('Thành công', 'Đã đổi tên danh mục thành tên đúng!');
        } catch (err) {
          showInfoDialog('Lỗi', err.message || 'Không thể cập nhật danh mục.');
        } finally {
          setSubmitting(false);
        }
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản Lý Danh Mục (Repo)</Text>
        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={[styles.addHeaderBtn, { marginRight: 8, backgroundColor: '#FEF3C7' }]}
            onPress={handleQuickFixNames}
            activeOpacity={0.8}
          >
            <Ionicons name="sparkles" size={18} color="#D97706" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addHeaderBtn}
            onPress={openCreateModal}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={22} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Banner cảnh báo và sửa nhanh tên nếu có 'name 1 2 3 4' */}
      {hasDummyNames && (
        <TouchableOpacity
          style={styles.syncBanner}
          onPress={handleQuickFixNames}
          activeOpacity={0.85}
        >
          <Ionicons name="warning" size={18} color="#D97706" />
          <Text style={styles.syncBannerText}>
            Phát hiện tên dạng "name 1, 2, 3, 4". Nhấn vào đây để đổi thành tên đúng chuẩn!
          </Text>
          <Ionicons name="chevron-forward" size={16} color="#D97706" />
        </TouchableOpacity>
      )}

      {/* Content */}
      {loading ? (
        <LoadingView message="Đang tải danh sách danh mục..." />
      ) : error ? (
        <ErrorView message={error} onRetry={refreshData} />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const count = getCourseCountForCategory(item.id);
            return (
              <View style={styles.catCard}>
                <View style={styles.cardInfo}>
                  <View style={styles.titleRow}>
                    <Text style={styles.catName}>{item.name}</Text>
                    <View
                      style={[
                        styles.badge,
                        count > 0 ? styles.badgeActive : styles.badgeEmpty,
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          count > 0 ? styles.badgeTextActive : styles.badgeTextEmpty,
                        ]}
                      >
                        {count} khóa học
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.catDesc} numberOfLines={2}>
                    {item.description || 'Chưa có mô tả cho danh mục.'}
                  </Text>
                  <Text style={styles.catIdText}>Mã danh mục: {item.id}</Text>
                </View>

                {/* Actions */}
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.actionIconBtn}
                    onPress={() => openEditModal(item)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="create-outline" size={20} color={COLORS.primary} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionIconBtn, { backgroundColor: COLORS.dangerLight }]}
                    onPress={() => handleDeleteCategory(item)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <EmptyState
              icon="folder-outline"
              title="Chưa có danh mục nào"
              message="Tạo danh mục mới để phân loại các khóa học."
              actionLabel="Tạo danh mục đầu tiên"
              onAction={openCreateModal}
            />
          }
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={openCreateModal}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color={COLORS.textLight} />
      </TouchableOpacity>

      {/* Modal Thêm / Sửa Danh mục */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingCategory ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Mới'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>
                Tên danh mục <Text style={{ color: COLORS.danger }}>*</Text>
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder="VD: Lập trình Di động"
                placeholderTextColor={COLORS.textMuted}
                value={name}
                onChangeText={setName}
              />

              <Text style={[styles.inputLabel, { marginTop: 12 }]}>Mô tả danh mục</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="VD: Flutter, Android, iOS..."
                placeholderTextColor={COLORS.textMuted}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                value={description}
                onChangeText={setDescription}
              />
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelBtnText}>Hủy bỏ</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmBtn, submitting && { opacity: 0.7 }]}
                onPress={handleSaveCategory}
                disabled={submitting}
                activeOpacity={0.8}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color={COLORS.textLight} />
                ) : (
                  <Text style={styles.confirmBtnText}>
                    {editingCategory ? 'Lưu thay đổi' : 'Tạo mới'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addHeaderBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
  },
  syncBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    gap: 8,
  },
  syncBannerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
    lineHeight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: 90,
  },
  catCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: SPACING.md,
    marginBottom: SPACING.sm + 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...SHADOWS.sm,
  },
  cardInfo: {
    flex: 1,
    marginRight: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 4,
    gap: 8,
  },
  catName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeActive: {
    backgroundColor: COLORS.primaryLight,
  },
  badgeEmpty: {
    backgroundColor: '#F1F5F9',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  badgeTextActive: {
    color: COLORS.primary,
  },
  badgeTextEmpty: {
    color: COLORS.textMuted,
  },
  catDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  catIdText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  actionsRow: {
    flexDirection: 'column',
    gap: 8,
  },
  actionIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: SPACING.lg,
    ...SHADOWS.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalBody: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  textArea: {
    minHeight: 70,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  confirmBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textLight,
  },
});
