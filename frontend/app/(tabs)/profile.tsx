import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert, Image } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useAuth } from '../../src/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { communityService } from '../../src/services/communityService';
import api from '../../src/services/api';

export default function ProfileScreen() {
  const { user, logout, setUser } = useAuth();
  const router = useRouter();
  const isWeb = Platform.OS === 'web';
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [bannerImage, setBannerImage] = useState<string | null>(null);

  // Load banner from localStorage on mount
  useEffect(() => {
    if (Platform.OS === 'web' && user?.id) {
      const storedBanner = localStorage.getItem(`banner_${user.id}`);
      if (storedBanner) {
        setBannerImage(storedBanner);
      }
    }
  }, [user?.id]);

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const uploadImage = async (uri: string): Promise<string> => {
    const formData = new FormData();
    const filename = uri.split('/').pop() || 'image.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('file', {
      uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
      name: filename,
      type,
    } as any);

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.url;
  };

  const handleUpdateAvatar = async () => {
    try {
      // Request permission
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Please allow access to your photo library');
          return;
        }
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploadingAvatar(true);
        try {
          // Upload the image
          const imageUrl = await uploadImage(result.assets[0].uri);
          
          // Update profile
          const updatedProfile = await communityService.updateProfile({
            avatar: imageUrl,
          });

          // Update user context
          if (user) {
            setUser({
              ...user,
              profile: {
                ...user.profile,
                avatar: updatedProfile.avatar || undefined,
              },
            });
          }

          Alert.alert('Success', 'Profile photo updated successfully');
        } catch (error: any) {
          console.error('Error updating avatar:', error);
          Alert.alert('Error', error.message || 'Failed to update profile photo');
        } finally {
          setUploadingAvatar(false);
        }
      }
    } catch (error: any) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const handleUpdateBanner = async () => {
    try {
      // Request permission
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Please allow access to your photo library');
          return;
        }
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploadingBanner(true);
        try {
          // Upload the image
          const imageUrl = await uploadImage(result.assets[0].uri);
          
          // Store banner URL locally
          setBannerImage(imageUrl);
          
          // Save to localStorage for persistence (web only)
          if (Platform.OS === 'web' && user?.id) {
            localStorage.setItem(`banner_${user.id}`, imageUrl);
          }
          
          Alert.alert('Success', 'Banner updated successfully');
        } catch (error: any) {
          console.error('Error updating banner:', error);
          Alert.alert('Error', error.message || 'Failed to update banner');
        } finally {
          setUploadingBanner(false);
        }
      }
    } catch (error: any) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  if (!user) {
    return null;
  }

  const isAdmin = user.role === 'SITE_ADMIN' || user.role === 'GOVT_DEPARTMENT';

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'SITE_ADMIN': return 'Super Admin';
      case 'GOVT_DEPARTMENT': return 'Tourism Department';
      case 'TOURIST_GUIDE': return 'Tourist Guide';
      default: return 'User';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SITE_ADMIN': return '#6366f1';
      case 'GOVT_DEPARTMENT': return '#10b981';
      case 'TOURIST_GUIDE': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const adminOptions = [
    {
      id: 'users',
      title: 'User Management',
      description: 'Manage users and reset passwords',
      icon: 'people',
      color: '#6366f1',
      route: '/(admin)/users',
      roles: ['SITE_ADMIN']
    },
    {
      id: 'upload',
      title: 'Upload Location',
      description: 'Add new tourist destinations',
      icon: 'location',
      color: '#10b981',
      route: '/(admin)/upload-location',
      roles: ['SITE_ADMIN', 'GOVT_DEPARTMENT']
    },
    {
      id: 'approvals',
      title: 'Content Approvals',
      description: 'Review pending submissions',
      icon: 'checkmark-circle',
      color: '#f59e0b',
      route: '/(admin)/approvals',
      roles: ['SITE_ADMIN']
    },
    {
      id: 'dashboard',
      title: 'Full Dashboard',
      description: 'Access complete admin panel',
      icon: 'grid',
      color: '#8b5cf6',
      route: '/(admin)/dashboard',
      roles: ['SITE_ADMIN', 'GOVT_DEPARTMENT']
    }
  ];

  const guideOptions = [
    {
      id: 'create-package',
      title: 'Create Package',
      description: 'Create a new travel package',
      icon: 'briefcase',
      color: '#8b5cf6',
      route: '/(admin)/create-package',
      roles: ['TOURIST_GUIDE', 'GOVT_DEPARTMENT']
    },
    {
      id: 'my-packages',
      title: 'My Packages',
      description: 'Manage your travel packages',
      icon: 'list',
      color: '#6366f1',
      route: '/(admin)/packages',
      roles: ['TOURIST_GUIDE', 'GOVT_DEPARTMENT']
    },
    {
      id: 'create-event',
      title: 'Create Event',
      description: 'Create a new event',
      icon: 'calendar',
      color: '#ec4899',
      route: '/(admin)/create-event',
      roles: ['TOURIST_GUIDE', 'GOVT_DEPARTMENT']
    },
    {
      id: 'my-events',
      title: 'My Events',
      description: 'Manage your events',
      icon: 'calendar-outline',
      color: '#f59e0b',
      route: '/(admin)/manage-events',
      roles: ['TOURIST_GUIDE', 'GOVT_DEPARTMENT']
    },
    {
      id: 'my-bids',
      title: 'My Bids',
      description: 'View your submitted bids',
      icon: 'document-text',
      color: '#10b981',
      route: '/my-bids',
      roles: ['TOURIST_GUIDE']
    },
    {
      id: 'accommodations',
      title: 'Manage Accommodations',
      description: 'Manage hotels, resorts, restaurants',
      icon: 'bed',
      color: '#06b6d4',
      route: '/(admin)/manage-accommodations',
      roles: ['TOURIST_GUIDE', 'GOVT_DEPARTMENT']
    },
    {
      id: 'crm',
      title: 'CRM Dashboard',
      description: 'Manage call requests and leads',
      icon: 'call',
      color: '#f97316',
      route: '/(admin)/call-requests',
      roles: ['TOURIST_GUIDE', 'GOVT_DEPARTMENT']
    }
  ];

  const filteredAdminOptions = adminOptions.filter(option => 
    option.roles.includes(user.role)
  );

  const filteredGuideOptions = guideOptions.filter(option => 
    option.roles.includes(user.role)
  );

  const userOptions = [
    {
      id: 'create-group-travel',
      title: 'Create Group Travel',
      description: 'Start a new group travel proposal',
      icon: 'airplane',
      color: '#667eea',
      route: '/create-group-travel',
      roles: ['USER', 'TOURIST_GUIDE', 'GOVT_DEPARTMENT']
    },
    {
      id: 'my-group-travels',
      title: 'My Group Travels',
      description: 'View your group travel proposals',
      icon: 'list',
      color: '#10b981',
      route: '/my-group-travels',
      roles: ['USER', 'TOURIST_GUIDE', 'GOVT_DEPARTMENT']
    },
    {
      id: 'community',
      title: 'Community',
      description: 'Share posts and connect with travelers',
      icon: 'people',
      color: '#ec4899',
      route: '/(tabs)/community',
      roles: ['USER', 'TOURIST_GUIDE', 'GOVT_DEPARTMENT', 'SITE_ADMIN']
    },
    {
      id: 'messages',
      title: 'Messages',
      description: 'Chat with other users',
      icon: 'chatbubbles',
      color: '#f59e0b',
      route: '/(tabs)/messages',
      roles: ['USER', 'TOURIST_GUIDE', 'GOVT_DEPARTMENT', 'SITE_ADMIN']
    },
    {
      id: 'locations',
      title: 'Explore Locations',
      description: 'Discover tourist destinations',
      icon: 'location',
      color: '#06b6d4',
      route: '/(tabs)/locations',
      roles: ['USER', 'TOURIST_GUIDE', 'GOVT_DEPARTMENT', 'SITE_ADMIN']
    },
    {
      id: 'events',
      title: 'Browse Events',
      description: 'Find festivals and events',
      icon: 'calendar',
      color: '#8b5cf6',
      route: '/(tabs)/events',
      roles: ['USER', 'TOURIST_GUIDE', 'GOVT_DEPARTMENT', 'SITE_ADMIN']
    },
    {
      id: 'packages',
      title: 'Travel Packages',
      description: 'Explore travel packages',
      icon: 'briefcase',
      color: '#f97316',
      route: '/(tabs)/packages',
      roles: ['USER', 'TOURIST_GUIDE', 'GOVT_DEPARTMENT', 'SITE_ADMIN']
    },
    {
      id: 'accommodations',
      title: 'Accommodations',
      description: 'Find hotels and stays',
      icon: 'bed',
      color: '#84cc16',
      route: '/(tabs)/accommodations',
      roles: ['USER', 'TOURIST_GUIDE', 'GOVT_DEPARTMENT', 'SITE_ADMIN']
    }
  ];

  const filteredUserOptions = userOptions.filter(option => 
    option.roles.includes(user.role)
  );

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.content, isWeb && styles.webContent]}>
        {/* Profile Header with Gradient/Banner */}
        <View style={styles.profileHeaderContainer}>
          {bannerImage ? (
            <Image source={{ uri: bannerImage }} style={styles.bannerImage} />
          ) : (
            <LinearGradient
              colors={[getRoleColor(user.role), getRoleColor(user.role) + 'dd']}
              style={styles.profileHeader}
            />
          )}
          
          {/* Banner Edit Button */}
          <TouchableOpacity
            style={styles.bannerEditButton}
            onPress={handleUpdateBanner}
            disabled={uploadingBanner}
          >
            {uploadingBanner ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="camera" size={20} color="#fff" />
            )}
          </TouchableOpacity>

          <View style={styles.profileHeaderContent}>
            <View style={styles.avatarContainer}>
              <TouchableOpacity
                onPress={handleUpdateAvatar}
                disabled={uploadingAvatar}
                style={styles.avatarTouchable}
              >
                {user.profile.avatar ? (
                  <Image source={{ uri: user.profile.avatar }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {user.profile.name.substring(0, 2).toUpperCase()}
                    </Text>
                  </View>
                )}
                {uploadingAvatar ? (
                  <View style={styles.avatarOverlay}>
                    <ActivityIndicator size="small" color="#fff" />
                  </View>
                ) : (
                  <View style={styles.avatarEditBadge}>
                    <Ionicons name="camera" size={16} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            </View>
            <Text style={styles.name}>{user.profile.name}</Text>
            <Text style={styles.email}>{user.email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{getRoleLabel(user.role)}</Text>
            </View>
          </View>
        </View>

        {/* Admin Section */}
        {isAdmin && filteredAdminOptions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="shield-checkmark" size={24} color="#6366f1" />
              <Text style={styles.sectionTitle}>Admin Tools</Text>
            </View>
            <View style={[styles.adminGrid, isWeb && styles.webAdminGrid]}>
              {filteredAdminOptions.map(option => (
                <TouchableOpacity
                  key={option.id}
                  style={[styles.adminCard, isWeb && styles.webAdminCard]}
                  onPress={() => router.push(option.route as any)}
                >
                  <View style={[styles.adminIconContainer, { backgroundColor: option.color + '20' }]}>
                    <Ionicons name={option.icon as any} size={28} color={option.color} />
                  </View>
                  <Text style={styles.adminCardTitle}>{option.title}</Text>
                  <Text style={styles.adminCardDescription}>{option.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Guide Tools Section */}
        {filteredGuideOptions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="compass" size={24} color={getRoleColor(user.role)} />
              <Text style={styles.sectionTitle}>Guide Tools</Text>
            </View>
            <View style={[styles.adminGrid, isWeb && styles.webAdminGrid]}>
              {filteredGuideOptions.map(option => (
                <TouchableOpacity
                  key={option.id}
                  style={[styles.adminCard, isWeb && styles.webAdminCard]}
                  onPress={() => router.push(option.route as any)}
                >
                  <View style={[styles.adminIconContainer, { backgroundColor: option.color + '20' }]}>
                    <Ionicons name={option.icon as any} size={28} color={option.color} />
                  </View>
                  <Text style={styles.adminCardTitle}>{option.title}</Text>
                  <Text style={styles.adminCardDescription}>{option.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* User Tools Section - Show for all users */}
        {filteredUserOptions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="apps" size={24} color="#667eea" />
              <Text style={styles.sectionTitle}>Quick Access</Text>
            </View>
            <View style={[styles.adminGrid, isWeb && styles.webAdminGrid]}>
              {filteredUserOptions.map(option => (
                <TouchableOpacity
                  key={option.id}
                  style={[styles.adminCard, isWeb && styles.webAdminCard]}
                  onPress={() => router.push(option.route as any)}
                >
                  <View style={[styles.adminIconContainer, { backgroundColor: option.color + '20' }]}>
                    <Ionicons name={option.icon as any} size={28} color={option.color} />
                  </View>
                  <Text style={styles.adminCardTitle}>{option.title}</Text>
                  <Text style={styles.adminCardDescription}>{option.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Profile Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person" size={24} color="#6b7280" />
            <Text style={styles.sectionTitle}>Profile Information</Text>
          </View>
          
          {user.profile.bio && (
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Bio</Text>
              <Text style={styles.infoValue}>{user.profile.bio}</Text>
            </View>
          )}

          {user.profile.phone && (
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Ionicons name="call" size={20} color="#6b7280" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Phone</Text>
                  <Text style={styles.infoValue}>{user.profile.phone}</Text>
                </View>
              </View>
            </View>
          )}

          {user.profile.stateAssignment && (
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Ionicons name="location" size={20} color="#6b7280" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>State Assignment</Text>
                  <Text style={styles.infoValue}>{user.profile.stateAssignment}</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="settings" size={24} color="#6b7280" />
            <Text style={styles.sectionTitle}>Account</Text>
          </View>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="key" size={20} color="#6b7280" />
            <Text style={styles.actionButtonText}>Change Password</Text>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="notifications" size={20} color="#6b7280" />
            <Text style={styles.actionButtonText}>Notification Settings</Text>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.logoutButton]} onPress={handleLogout}>
            <Ionicons name="log-out" size={20} color="#ef4444" />
            <Text style={[styles.actionButtonText, styles.logoutText]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    paddingBottom: 40,
  },
  webContent: {
    maxWidth: 800,
    marginHorizontal: 'auto',
    width: '100%',
  },
  profileHeaderContainer: {
    position: 'relative',
    minHeight: 200,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    resizeMode: 'cover',
  },
  profileHeader: {
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    minHeight: 200,
    width: '100%',
  },
  bannerEditButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  profileHeaderContent: {
    position: 'relative',
    zIndex: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatarTouchable: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#ffffff',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  avatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#667eea',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 12,
  },
  roleBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  roleBadgeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  adminGrid: {
    gap: 12,
  },
  webAdminGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  adminCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  webAdminCard: {
    width: 'calc(50% - 6px)' as any,
  },
  adminIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  adminCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  adminCardDescription: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 15,
    color: '#111827',
    lineHeight: 22,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },
  logoutButton: {
    marginTop: 8,
  },
  logoutText: {
    color: '#ef4444',
  },
});
