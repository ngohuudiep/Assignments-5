import { Alert, Platform } from 'react-native';

/**
 * Hỗ trợ hiển thị hộp thoại xác nhận (Confirm Dialog) đồng nhất cho cả Web và Mobile.
 * Khắc phục triệt để lỗi React Native Web bỏ qua các nút bấm callback của Alert.alert.
 */
export const showConfirmDialog = ({
  title = 'Xác nhận',
  message = '',
  onConfirm,
  onCancel,
  confirmText = 'Xóa ngay',
  cancelText = 'Hủy bỏ',
  destructive = true,
}) => {
  if (Platform.OS === 'web') {
    const fullMessage = title ? `${title}\n\n${message}` : message;
    // window.confirm hoạt động 100% chuẩn trên mọi trình duyệt web
    const confirmed = typeof window !== 'undefined' ? window.confirm(fullMessage) : true;
    if (confirmed) {
      if (typeof onConfirm === 'function') onConfirm();
    } else {
      if (typeof onCancel === 'function') onCancel();
    }
  } else {
    Alert.alert(
      title,
      message,
      [
        {
          text: cancelText,
          style: 'cancel',
          onPress: onCancel,
        },
        {
          text: confirmText,
          style: destructive ? 'destructive' : 'default',
          onPress: onConfirm,
        },
      ],
      { cancelable: true }
    );
  }
};

/**
 * Hỗ trợ thông báo thông tin (Alert) có callback onOk trên cả Web và Mobile
 */
export const showInfoDialog = (title, message, onOk) => {
  if (Platform.OS === 'web') {
    const fullMessage = title ? `${title}\n\n${message}` : message;
    if (typeof window !== 'undefined') {
      window.alert(fullMessage);
    }
    if (typeof onOk === 'function') {
      onOk();
    }
  } else {
    Alert.alert(
      title,
      message,
      [
        {
          text: 'OK',
          onPress: onOk,
        },
      ],
      { cancelable: false }
    );
  }
};
