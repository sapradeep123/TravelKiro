import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import { siteSettingsService } from '../src/services/siteSettingsService';
import { useAuth } from '../src/contexts/AuthContext';

export default function AdminSettingsScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'login' | 'legal'>('general');
  const [settings, setSettings] = useState({
    siteName: '',
    siteTitle: '',
    logoUrl: '',
    faviconUrl: '',
    welcomeMessage: '',
    welcomeSubtitle: '',
    termsAndConditions: '',
    privacyPolicy: '',
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role !== 'SITE_ADMIN') {
      Alert.alert('Access Denied', 'Only site administrators can access this page', [
        {
          text: 'OK',
          onPress: () => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(tabs)/community');
            }
          }
        }
      ]);
      return;
    }
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    try {
      const response = await siteSettingsService.getSettings();
      // GET returns: { data: { ...settings } }
      // Service returns: response.data = { data: { ...settings } }
      // So response.data.data contains the actual settings
      const settingsData = response.data?.data || response.data || response;
      console.log('Loaded settings:', JSON.stringify(settingsData, null, 2));
      
      setSettings({
        siteName: settingsData.siteName || '',
        siteTitle: settingsData.siteTitle || '',
        logoUrl: settingsData.logoUrl || '',
        faviconUrl: settingsData.faviconUrl || '',
        welcomeMessage: settingsData.welcomeMessage || '',
        welcomeSubtitle: settingsData.welcomeSubtitle || '',
        termsAndConditions: settingsData.termsAndConditions || '',
        privacyPolicy: settingsData.privacyPolicy || '',
      });
      setLogoPreview(settingsData.logoUrl || null);
      setFaviconPreview(settingsData.faviconUrl || null);
    } catch (error) {
      console.error('Error loading settings:', error);
      Alert.alert('Error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async (type: 'logo' | 'favicon') => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'logo' ? [4, 1] : [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploading(true);
        try {
          // Upload the image
          const uploadedUrl = await uploadImage(result.assets[0].uri, type);
          
          if (type === 'logo') {
            setLogoPreview(uploadedUrl);
            setSettings({ ...settings, logoUrl: uploadedUrl });
          } else {
            setFaviconPreview(uploadedUrl);
            setSettings({ ...settings, faviconUrl: uploadedUrl });
          }
          
          Alert.alert('Success', `${type === 'logo' ? 'Logo' : 'Favicon'} uploaded successfully`);
        } catch (error) {
          Alert.alert('Error', 'Failed to upload image');
        } finally {
          setUploading(false);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadImage = async (uri: string, type: string): Promise<string> => {
    try {
      const formData = new FormData();
      const filename = uri.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const fileType = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('file', {
        uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
        name: `${type}-${Date.now()}.${match?.[1] || 'jpg'}`,
        type: fileType,
      } as any);

      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      console.log('Uploading to:', `${apiUrl}/api/upload`);

      // Get auth token
      const token = Platform.OS === 'web' 
        ? localStorage.getItem('accessToken')
        : await SecureStore.getItemAsync('accessToken');

      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${apiUrl}/api/upload`, {
        method: 'POST',
        body: formData as any,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData: any = await response.json().catch(() => ({}));
        console.error('Upload error:', errorData);
        throw new Error(errorData.error || 'Upload failed');
      }

      const data: any = await response.json();
      console.log('Upload success:', data);
      
      // Return full URL with API base
      return `${apiUrl}${data.url}`;
    } catch (error) {
      console.error('Upload image error:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Clean up the settings - convert empty strings to null/undefined for optional fields
      const cleanedSettings: any = {
        siteName: settings.siteName?.trim() || '',
        siteTitle: settings.siteTitle?.trim() || '',
        welcomeMessage: settings.welcomeMessage?.trim() || '',
        welcomeSubtitle: settings.welcomeSubtitle?.trim() || '',
      };
      
      // Only include logo/favicon if they have actual values
      if (settings.logoUrl && settings.logoUrl.trim()) {
        cleanedSettings.logoUrl = settings.logoUrl.trim();
      }
      if (settings.faviconUrl && settings.faviconUrl.trim()) {
        cleanedSettings.faviconUrl = settings.faviconUrl.trim();
      }
      if (settings.termsAndConditions && settings.termsAndConditions.trim()) {
        cleanedSettings.termsAndConditions = settings.termsAndConditions.trim();
      }
      if (settings.privacyPolicy && settings.privacyPolicy.trim()) {
        cleanedSettings.privacyPolicy = settings.privacyPolicy.trim();
      }
      
      console.log('Saving cleaned settings:', cleanedSettings);
      const response = await siteSettingsService.updateSettings(cleanedSettings);
      console.log('Settings saved - full response:', JSON.stringify(response, null, 2));
      
      // API PUT returns: { message: '...', data: { ...settings } }
      // Service returns: response.data = { message: '...', data: { ...settings } }
      // So response.data.data contains the actual settings object
      const settingsData = response.data?.data || response.data || response;
      console.log('Extracted settings data:', JSON.stringify(settingsData, null, 2));
      
      // Update state immediately with saved data - use a new object to force re-render
      const updatedSettings = {
        siteName: String(settingsData.siteName || ''),
        siteTitle: String(settingsData.siteTitle || ''),
        logoUrl: String(settingsData.logoUrl || ''),
        faviconUrl: String(settingsData.faviconUrl || ''),
        welcomeMessage: String(settingsData.welcomeMessage || ''),
        welcomeSubtitle: String(settingsData.welcomeSubtitle || ''),
        termsAndConditions: String(settingsData.termsAndConditions || ''),
        privacyPolicy: String(settingsData.privacyPolicy || ''),
      };
      
      console.log('Updating state with:', updatedSettings);
      
      // Force state update with a completely new object
      setSettings({ ...updatedSettings });
      setLogoPreview(settingsData.logoUrl || null);
      setFaviconPreview(settingsData.faviconUrl || null);
      
      // Small delay to ensure state update is processed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      Alert.alert('Success', 'Settings saved successfully!');
      
      // Reload from server after alert to ensure sync
      setTimeout(async () => {
        await loadSettings();
      }, 500);
    } catch (error: any) {
      console.error('Error saving settings:', error);
      console.error('Error response:', error.response?.data);
      Alert.alert('Error', error.response?.data?.error || error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Site Settings</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'general' && styles.activeTab]}
          onPress={() => setActiveTab('general')}
        >
          <Text style={[styles.tabText, activeTab === 'general' && styles.activeTabText]}>
            General
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'login' && styles.activeTab]}
          onPress={() => setActiveTab('login')}
        >
          <Text style={[styles.tabText, activeTab === 'login' && styles.activeTabText]}>
            Login Page
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'legal' && styles.activeTab]}
          onPress={() => setActiveTab('legal')}
        >
          <Text style={[styles.tabText, activeTab === 'legal' && styles.activeTabText]}>
            Legal
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'general' ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>General Settings</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Site Name</Text>
              <Text style={styles.hint}>Name displayed next to the logo</Text>
              <TextInput
                key={`siteName-${settings.siteName}`}
                style={styles.input}
                value={settings.siteName}
                onChangeText={(text) => setSettings({ ...settings, siteName: text })}
                placeholder="e.g., Butterfliy"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Site Title</Text>
              <Text style={styles.hint}>Browser tab title</Text>
              <TextInput
                key={`siteTitle-${settings.siteTitle}`}
                style={styles.input}
                value={settings.siteTitle}
                onChangeText={(text) => setSettings({ ...settings, siteTitle: text })}
                placeholder="e.g., Travel Encyclopedia"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Logo</Text>
              <Text style={styles.hint}>Upload your site logo (recommended: 200x50px)</Text>
              
              {logoPreview && (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: logoPreview }} style={styles.logoPreview} />
                </View>
              )}
              
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => pickImage('logo')}
                disabled={uploading}
              >
                <Ionicons name="cloud-upload-outline" size={20} color="#667eea" />
                <Text style={styles.uploadButtonText}>
                  {uploading ? 'Uploading...' : logoPreview ? 'Change Logo' : 'Upload Logo'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Favicon</Text>
              <Text style={styles.hint}>Upload your favicon (recommended: 32x32px)</Text>
              
              {faviconPreview && (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: faviconPreview }} style={styles.faviconPreview} />
                </View>
              )}
              
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => pickImage('favicon')}
                disabled={uploading}
              >
                <Ionicons name="cloud-upload-outline" size={20} color="#667eea" />
                <Text style={styles.uploadButtonText}>
                  {uploading ? 'Uploading...' : faviconPreview ? 'Change Favicon' : 'Upload Favicon'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : activeTab === 'login' ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Login Page Settings</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Welcome Message</Text>
              <Text style={styles.hint}>Main heading on login page</Text>
              <TextInput
                key={`welcomeMessage-${settings.welcomeMessage}`}
                style={styles.input}
                value={settings.welcomeMessage}
                onChangeText={(text) => setSettings({ ...settings, welcomeMessage: text })}
                placeholder="e.g., Welcome Back"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Welcome Subtitle</Text>
              <Text style={styles.hint}>Subtitle text below the heading</Text>
              <TextInput
                key={`welcomeSubtitle-${settings.welcomeSubtitle}`}
                style={styles.input}
                value={settings.welcomeSubtitle}
                onChangeText={(text) => setSettings({ ...settings, welcomeSubtitle: text })}
                placeholder="e.g., Sign in to explore the world"
              />
            </View>

            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color="#667eea" />
              <Text style={styles.infoText}>
                The logo uploaded in the General tab will be displayed on the login page.
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Legal Content</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Terms & Conditions</Text>
              <Text style={styles.hint}>Full terms and conditions text</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={settings.termsAndConditions}
                onChangeText={(text) => setSettings({ ...settings, termsAndConditions: text })}
                placeholder="Enter your terms and conditions..."
                multiline
                numberOfLines={10}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Privacy Policy</Text>
              <Text style={styles.hint}>Full privacy policy text</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={settings.privacyPolicy}
                onChangeText={(text) => setSettings({ ...settings, privacyPolicy: text })}
                placeholder="Enter your privacy policy..."
                multiline
                numberOfLines={10}
              />
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : 'Save Settings'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#667eea',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#667eea',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFF',
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFF',
  },
  textArea: {
    height: 200,
    textAlignVertical: 'top',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  saveButton: {
    backgroundColor: '#667eea',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#667eea',
    borderRadius: 8,
    borderStyle: 'dashed',
    gap: 8,
  },
  uploadButtonText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
  },
  imagePreviewContainer: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    alignItems: 'center',
  },
  logoPreview: {
    width: 200,
    height: 50,
    resizeMode: 'contain',
  },
  faviconPreview: {
    width: 64,
    height: 64,
    resizeMode: 'contain',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F0F4FF',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#667eea',
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },
});
