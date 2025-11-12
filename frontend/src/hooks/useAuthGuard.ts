import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { Alert } from 'react-native';

/**
 * Authentication Guard Hook
 * 
 * Redirects unauthenticated users to the login screen
 * and optionally shows an alert message.
 * 
 * @param options - Configuration options
 * @param options.requireAuth - Whether authentication is required (default: true)
 * @param options.redirectTo - Where to redirect if not authenticated (default: '/(auth)/login')
 * @param options.showAlert - Whether to show an alert before redirecting (default: true)
 * @param options.alertTitle - Title of the alert (default: 'Authentication Required')
 * @param options.alertMessage - Message of the alert (default: 'Please log in to continue')
 * 
 * @returns Authentication state
 */
export const useAuthGuard = (options?: {
  requireAuth?: boolean;
  redirectTo?: string;
  showAlert?: boolean;
  alertTitle?: string;
  alertMessage?: string;
}) => {
  const {
    requireAuth = true,
    redirectTo = '/(auth)/login',
    showAlert = true,
    alertTitle = 'Authentication Required',
    alertMessage = 'Please log in to continue',
  } = options || {};

  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && requireAuth && !isAuthenticated) {
      if (showAlert) {
        Alert.alert(alertTitle, alertMessage, [
          {
            text: 'OK',
            onPress: () => router.replace(redirectTo as any),
          },
        ]);
      } else {
        router.replace(redirectTo as any);
      }
    }
  }, [isAuthenticated, loading, requireAuth]);

  return {
    isAuthenticated,
    loading,
    user,
    canAccess: !requireAuth || isAuthenticated,
  };
};

/**
 * Admin Guard Hook
 * 
 * Redirects non-admin users to the home screen
 * 
 * @returns Admin state
 */
export const useAdminGuard = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();

  const isAdmin = user?.role === 'SITE_ADMIN';

  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin)) {
      Alert.alert(
        'Access Denied',
        'You do not have permission to access this page',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)/locations' as any),
          },
        ]
      );
    }
  }, [isAuthenticated, loading, isAdmin]);

  return {
    isAuthenticated,
    isAdmin,
    loading,
    user,
    canAccess: isAuthenticated && isAdmin,
  };
};
