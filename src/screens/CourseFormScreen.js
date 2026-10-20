import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '../components/AppIcon';
import { useApp } from '../context/AppContext';
import { COLORS, SPACING, SHADOWS } from '../constants/theme';
import { showInfoDialog } from '../utils/dialog';

export default function CourseFormScreen({ route, navigation }) {
  const { categories, addCourse, updateCourse, loading: loadingContext } = useApp();
  const editingCourse = route.params?.course;
  const isEditing = !!editingCourse;

  // Form State
  const [title, setTitle] = useState(editingCourse?.title || '');
  const [description, setDescription] = useState(editingCourse?.description || '');
  const [categoryId, setCategoryId] = useState(
    editingCourse?.categoryId ? String(editingCourse.categoryId) : ''
  );
  const [instructor, setInstructor] = useState(editingCourse?.instructor || '');
  const [price, setPrice] = useState(editingCourse?.price ? String(editingCourse.price) : '');
  const [duration, setDuration] = useState(editingCourse?.duration ? String(editingCourse.duration) : '');
  const [thumbnail, setThumbnail] = useState(
    editingCourse?.thumbnail ||
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80'
  );
  const [trailerUrl, setTrailerUrl] = useState(
    editingCourse?.trailerUrl ||
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  );

  const [submitting, setSubmitting] = useState(false);
  const [thumbnailPreviewError, setThumbnailPreviewError] = useState(false);

  // Gán category mặc định nếu thêm mới
  useEffect(() => {
    if (!isEditing && categories.length > 0 && !categoryId) {
      setCategoryId(String(categories[0].id));
    }
  }, [categories, isEditing, categoryId]);

  const validateForm = () => {
    if (!title.trim()) {
      showInfoDialog('Lỗi kiểm tra', 'Vui lòng nhập tên khóa học.');
      return false;
    }
    if (!categoryId) {
      showInfoDialog('Lỗi kiểm tra', 'Vui lòng chọn danh mục cho khóa học.');
      return false;
    }
    if (!instructor.trim()) {
      showInfoDialog('Lỗi kiểm tra', 'Vui lòng nhập tên giảng viên.');
      return false;
    }

    const priceNum = Number(price);
    if (price.trim() === '' || isNaN(priceNum) || priceNum < 0) {
      showInfoDialog('Lỗi kiểm tra', 'Học phí phải là một số không âm (>= 0 VNĐ).');
      return false;
    }

    const durationNum = Number(duration);
    if (duration.trim() === '' || isNaN(durationNum) || durationNum <= 0) {
      showInfoDialog('Lỗi kiểm tra', 'Thời lượng phải là một số dương lớn hơn 0 giờ.');
      return false;
    }

    if (!thumbnail.trim()) {
      showInfoDialog('Lỗi kiểm tra', 'Vui lòng nhập URL ảnh bìa khóa học.');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const payload = {
        title: title.trim(),
        description: description.trim(),
        categoryId: String(categoryId),
        instructor: instructor.trim(),
        price: Number(price),
        duration: Number(duration),
        thumbnail: thumbnail.trim(),
        trailerUrl: trailerUrl.trim(),
      };

      if (isEditing) {
        await updateCourse(editingCourse.id, payload);
        showInfoDialog('Thành công', 'Đã cập nhật thông tin khóa học!', () => {
          navigation.goBack();
        });
      } else {
        await addCourse(payload);
        showInfoDialog('Thành công', 'Đã thêm khóa học mới thành công!', () => {
          navigation.goBack();
        });
      }
    } catch (err) {
      showInfoDialog('Lỗi', err.message || 'Có lỗi xảy ra khi lưu khóa học.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Custom Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditing ? 'Chỉnh Sửa Khóa Học' : 'Thêm Khóa Học Mới'}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Tên khóa học */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Tên khóa học <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="VD: Lập trình React Native thực chiến"
              placeholderTextColor={COLORS.textMuted}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Chọn danh mục (Dynamic từ API categories) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Danh mục khóa học <Text style={styles.required}>*</Text>
            </Text>
            {loadingContext ? (
              <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 8 }} />
            ) : categories.length === 0 ? (
              <Text style={styles.helperWarning}>Chưa có danh mục nào. Hãy tạo danh mục trước!</Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryPickerList}>
                {categories.map((cat) => {
                  const isSelected = String(categoryId) === String(cat.id);
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.categoryOption, isSelected && styles.categoryOptionSelected]}
                      onPress={() => setCategoryId(String(cat.id))}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                        size={16}
                        color={isSelected ? COLORS.textLight : COLORS.textSecondary}
                        style={{ marginRight: 6 }}
                      />
                      <Text
                        style={[
                          styles.categoryOptionText,
                          isSelected && styles.categoryOptionTextSelected,
                        ]}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>

          {/* Giảng viên & Thời lượng */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>
                Giảng viên <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Nguyễn Văn A"
                placeholderTextColor={COLORS.textMuted}
                value={instructor}
                onChangeText={setInstructor}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>
                Thời lượng (giờ) <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="30"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
                value={duration}
                onChangeText={setDuration}
              />
            </View>
          </View>

          {/* Học phí */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Học phí (VNĐ) <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="500000"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />
          </View>

          {/* URL Ảnh bìa + Live Preview */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              URL Ảnh bìa (Thumbnail) <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="https://images.unsplash.com/..."
              placeholderTextColor={COLORS.textMuted}
              value={thumbnail}
              onChangeText={(text) => {
                setThumbnail(text);
                setThumbnailPreviewError(false);
              }}
              autoCapitalize="none"
            />

            {/* Xem trước ảnh (Live Image Preview) */}
            <View style={styles.previewBox}>
              <Text style={styles.previewTitle}>Ảnh xem trước:</Text>
              {thumbnail.trim() ? (
                <Image
                  source={{ uri: thumbnail.trim() }}
                  style={styles.previewImage}
                  resizeMode="cover"
                  onError={() => setThumbnailPreviewError(true)}
                />
              ) : (
                <View style={styles.placeholderBox}>
                  <Ionicons name="image-outline" size={32} color={COLORS.textMuted} />
                  <Text style={styles.placeholderText}>Chưa nhập URL ảnh</Text>
                </View>
              )}
              {thumbnailPreviewError && (
                <Text style={styles.errorText}>URL ảnh không tải được hoặc không hợp lệ.</Text>
              )}
            </View>
          </View>

          {/* URL Trailer Video */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>URL Video Trailer (MP4)</Text>
            <TextInput
              style={styles.input}
              placeholder="https://.../video.mp4"
              placeholderTextColor={COLORS.textMuted}
              value={trailerUrl}
              onChangeText={setTrailerUrl}
              autoCapitalize="none"
            />
            <Text style={styles.hint}>Ưu tiên URL video đuôi .mp4 trực tiếp để phát mượt mà nhất.</Text>
          </View>

          {/* Mô tả chi tiết */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mô tả khóa học</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Nội dung, mục tiêu và yêu cầu của khóa học..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveBtn, submitting && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color={COLORS.textLight} />
            ) : (
              <>
                <Ionicons
                  name={isEditing ? 'checkmark-circle' : 'add-circle'}
                  size={20}
                  color={COLORS.textLight}
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.saveBtnText}>
                  {isEditing ? 'Cập Nhật Khóa Học' : 'Tạo Khóa Học Ngay'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 60,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  required: {
    color: COLORS.danger,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  textArea: {
    minHeight: 90,
  },
  row: {
    flexDirection: 'row',
  },
  categoryPickerList: {
    flexDirection: 'row',
    marginTop: 4,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryOptionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryOptionText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  categoryOptionTextSelected: {
    color: COLORS.textLight,
    fontWeight: '700',
  },
  helperWarning: {
    fontSize: 13,
    color: COLORS.accent,
    fontStyle: 'italic',
  },
  previewBox: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    padding: SPACING.sm,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  previewTitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 6,
    fontWeight: '600',
  },
  previewImage: {
    width: '100%',
    height: 140,
    borderRadius: 8,
  },
  placeholderBox: {
    height: 100,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.danger,
    marginTop: 4,
  },
  hint: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: SPACING.md,
    ...SHADOWS.md,
  },
  saveBtnText: {
    color: COLORS.textLight,
    fontSize: 16,
    fontWeight: '700',
  },
});
