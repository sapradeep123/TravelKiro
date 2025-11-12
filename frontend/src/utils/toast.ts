import { Alert, Platform, ToastAndroid } from 'react-native';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  duration?: 'short' | 'long';
  position?: 'top' | 'bottom' | 'center';
}

/**
 * Cross-platform toast notification utility
 * Uses native Toast on Android and Alert on iOS/Web
 */
export const toast = {
  /**
   * Show a success toast message
   */
  success(message: string, options: ToastOptions = {}) {
    this.show(message, 'success', options);
  },

  /**
   * Show an error toast message
   */
  error(message: string, options: ToastOptions = {}) {
    this.show(message, 'error', options);
  },

  /**
   * Show an info toast message
   */
  info(message: string, options: ToastOptions = {}) {
    this.show(message, 'info', options);
  },

  /**
   * Show a warning toast message
   */
  warning(message: string, options: ToastOptions = {}) {
    this.show(message, 'warning', options);
  },

  /**
   * Show a toast message with specified type
   */
  show(message: string, type: ToastType = 'info', options: ToastOptions = {}) {
    const { duration = 'short' } = options;

    if (Platform.OS === 'android') {
      // Use native Android Toast
      const toastDuration =
        duration === 'long' ? ToastAndroid.LONG : ToastAndroid.SHORT;
      ToastAndroid.show(message, toastDuration);
    } else {
      // Use Alert for iOS and Web
      const title = this.getTitleForType(type);
      Alert.alert(title, message, [{ text: 'OK' }], {
        cancelable: true,
      });
    }
  },

  /**
   * Get appropriate title based on toast type
   */
  getTitleForType(type: ToastType): string {
    switch (type) {
      case 'success':
        return '✓ Success';
      case 'error':
        return '✗ Error';
      case 'warning':
        return '⚠ Warning';
      case 'info':
      default:
        return 'ℹ Info';
    }
  },
};

/**
 * Show a confirmation dialog
 */
export function showConfirmDialog(
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
): void {
  Alert.alert(
    title,
    message,
    [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: onCancel,
      },
      {
        text: 'Confirm',
        onPress: onConfirm,
      },
    ],
    { cancelable: true }
  );
}

/**
 * Show a destructive action confirmation dialog
 */
export function showDestructiveDialog(
  title: string,
  message: string,
  confirmText: string,
  onConfirm: () => void,
  onCancel?: () => void
): void {
  Alert.alert(
    title,
    message,
    [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: onCancel,
      },
      {
        text: confirmText,
        style: 'destructive',
        onPress: onConfirm,
      },
    ],
    { cancelable: true }
  );
}
