import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from './AppIcon';
import { COLORS, SPACING } from '../constants/theme';

export const LoadingView = ({ message = 'Đang tải dữ liệu...' }) => (
  <View style={styles.centerContainer}>
    <ActivityIndicator size="large" color={COLORS.primary} />
    <Text style={styles.loadingText}>{message}</Text>
  </View>
);

export const EmptyState = ({
  icon = 'file-tray-outline',
  title = 'Không có dữ liệu',
  message = 'Chưa có thông tin hiển thị tại đây.',
  actionLabel,
  onAction,
}) => (
  <View style={styles.centerContainer}>
    <View style={styles.iconCircle}>
      <Ionicons name={icon} size={48} color={COLORS.textMuted} />
    </View>
    <Text style={styles.emptyTitle}>{title}</Text>
    <Text style={styles.emptyMessage}>{message}</Text>
    {actionLabel && onAction && (
      <TouchableOpacity style={styles.actionBtn} onPress={onAction}>
        <Text style={styles.actionBtnText}>{actionLabel}</Text>
      </TouchableOpacity>
    )}
  </View>
);

export const ErrorView = ({
  title = 'Đã có lỗi xảy ra',
  message = 'Không thể kết nối đến máy chủ. Vui lòng thử lại.',
  onRetry,
}) => (
  <View style={styles.centerContainer}>
    <View style={[styles.iconCircle, { backgroundColor: COLORS.dangerLight }]}>
      <Ionicons name="cloud-offline-outline" size={48} color={COLORS.danger} />
    </View>
    <Text style={styles.emptyTitle}>{title}</Text>
    <Text style={styles.emptyMessage}>{message}</Text>
    {onRetry && (
      <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
        <Ionicons name="reload" size={18} color={COLORS.textLight} style={{ marginRight: 6 }} />
        <Text style={styles.retryBtnText}>Thử lại ngay</Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    minHeight: 280,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
    marginBottom: SPACING.lg,
  },
  actionBtn: {
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  actionBtnText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 10,
  },
  retryBtnText: {
    color: COLORS.textLight,
    fontWeight: '600',
    fontSize: 15,
  },
});
