import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Platform, Image, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import WebHeader from '../../components/WebHeader';
import api from '../../src/services/api';
import * as ImagePicker from 'expo-image-picker';

interface SiteSettings {
  id: string;
  siteName: string;
  siteTitle: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  welcomeMessage: string;
  welcomeSubtitle: string;
  termsAndConditions: string | null;
  privacyPolicy: string | null;
}

export default function SiteSettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const isWeb = Platform.OS === 'web';
  
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/site-settings');
      setSettings(response.data.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      Alert.alert('Error', 'Failed to load site settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    
    setSaving(true);
    try {
      const response = await api.put('/site-settings', settings);
      setSettings(response.data.data);
      Alert.alert('Success', 'Site settings updated successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const pickImage = async (type: 'logo' | 'favicon') => {
    const setUploading = type === 'logo' ? setUploadingLogo : setUploadingFavicon;
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'logo' ? [3, 1] : [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploading(true);
        const formData = new FormData();
        
        const uri = result.assets[0].uri;
        const filename = uri.split('/').pop() || `${type}.png`;
        const match = /\.(\w+)$/.exec(filename);
        const fileType = match ? `image/${match[1]}` : 'image/png';
        
        formData.append('file', {
          uri,
          name: filename,
          type: fileType,
        } as any);

        const uploadResponse = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        const imageUrl = uploadResponse.data.url;
        // Construct full URL if it's a relative path
        const fullUrl = imageUrl.startsWith('http') ? imageUrl : `${process.env.EXPO_PUBLIC_API_URL || ''}${imageUrl}`;
        
        if (type === 'logo') {
          setSettings(prev => prev ? { ...prev, logoUrl: fullUrl } : null);
        } else {
          setSettings(prev => prev ? { ...prev, faviconUrl: fullUrl } : null);
        }
      }
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      Alert.alert('Error', `Failed to upload ${type}`);
    } finally {
      setUploading(false);
    }
  };

  const handleUrlInput = (type: 'logo' | 'favicon', url: string) => {
    if (type === 'logo') {
      setSettings(prev => prev ? { ...prev, logoUrl: url } : null);
    } else {
      setSettings(prev => prev ? { ...prev, faviconUrl: url } : null);
    }
  };

  if (user?.role !== 'SITE_ADMIN') {
    return (
      <View style={styles.container}>
        {isWeb && <WebHeader />}
        <View style={styles.errorContainer}>
          <Ionicons name="lock-closed" size={64} color="#ef4444" />
          <Text style={styles.errorText}>Access Denied</Text>
          <Text style={styles.errorSubtext}>Only Site Admins can access this page</Text>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        {isWeb && <WebHeader />}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isWeb && <WebHeader />}
      <ScrollView style={styles.content}>
        <View style={[styles.contentInner, isWeb && styles.webContent]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#6366f1" />
            </TouchableOpacity>
            <View>
              <Text style={styles.title}>Site Settings</Text>
              <Text style={styles.subtitle}>Customize your site branding and appearance</Text>
            </View>
          </View>

          {/* Branding Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Branding</Text>
            
            {/* Logo */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Site Logo</Text>
              <View style={styles.imageUploadContainer}>
                {settings?.logoUrl ? (
                  <Image source={{ uri: settings.logoUrl }} style={styles.logoPreview} resizeMode="contain" />
                ) : (
                  <View style={styles.placeholderImage}>
                    <Ionicons name="image-outline" size={48} color="#9ca3af" />
                    <Text style={styles.placeholderText}>No logo uploaded</Text>
                  </View>
                )}
                <View style={styles.uploadActions}>
                  <TouchableOpacity 
                    style={styles.uploadButton} 
                    onPress={() => pickImage('logo')}
                    disabled={uploadingLogo}
                  >
                    {uploadingLogo ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="cloud-upload" size={20} color="#fff" />
                        <Text style={styles.uploadButtonText}>Upload Logo</Text>
                      </>
                    )}
                  </TouchableOpacity>
                  <Text style={styles.orText}>or enter URL:</Text>
                  <TextInput
                    style={styles.urlInput}
                    value={settings?.logoUrl || ''}
                    onChangeText={(text) => handleUrlInput('logo', text)}
                    placeholder="https://example.com/logo.png"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>
            </View>

            {/* Favicon */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Favicon</Text>
              <View style={styles.imageUploadContainer}>
                {settings?.faviconUrl ? (
                  <Image source={{ uri: settings.faviconUrl }} style={styles.faviconPreview} resizeMode="contain" />
                ) : (
                  <View style={[styles.placeholderImage, styles.faviconPlaceholder]}>
                    <Ionicons name="globe-outline" size={32} color="#9ca3af" />
                  </View>
                )}
                <View style={styles.uploadActions}>
                  <TouchableOpacity 
                    style={styles.uploadButton} 
                    onPress={() => pickImage('favicon')}
                    disabled={uploadingFavicon}
                  >
                    {uploadingFavicon ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="cloud-upload" size={20} color="#fff" />
                        <Text style={styles.uploadButtonText}>Upload Favicon</Text>
                      </>
                    )}
                  </TouchableOpacity>
                  <Text style={styles.orText}>or enter URL:</Text>
                  <TextInput
                    style={styles.urlInput}
                    value={settings?.faviconUrl || ''}
                    onChangeText={(text) => handleUrlInput('favicon', text)}
                    placeholder="https://example.com/favicon.ico"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Site Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Site Information</Text>
            
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Site Name</Text>
              <TextInput
                style={styles.input}
                value={settings?.siteName || ''}
                onChangeText={(text) => setSettings(prev => prev ? { ...prev, siteName: text } : null)}
                placeholder="Enter site name"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Site Title (Browser Tab)</Text>
              <TextInput
                style={styles.input}
                value={settings?.siteTitle || ''}
                onChangeText={(text) => setSettings(prev => prev ? { ...prev, siteTitle: text } : null)}
                placeholder="Enter site title"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          {/* Login Page Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Login Page</Text>
            
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Welcome Message</Text>
              <TextInput
                style={styles.input}
                value={settings?.welcomeMessage || ''}
                onChangeText={(text) => setSettings(prev => prev ? { ...prev, welcomeMessage: text } : null)}
                placeholder="Welcome Back"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Welcome Subtitle</Text>
              <TextInput
                style={styles.input}
                value={settings?.welcomeSubtitle || ''}
                onChangeText={(text) => setSettings(prev => prev ? { ...prev, welcomeSubtitle: text } : null)}
                placeholder="Sign in to explore the world"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity 
            style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="save" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: 20,
    paddingBottom: 40,
  },
  webContent: {
    maxWidth: 800,
    marginHorizontal: 'auto',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    gap: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#fff',
  },
  imageUploadContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 20,
    flexWrap: 'wrap',
  },
  logoPreview: {
    width: 200,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  faviconPreview: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  placeholderImage: {
    width: 200,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  faviconPlaceholder: {
    width: 64,
    height: 64,
  },
  placeholderText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  uploadActions: {
    flex: 1,
    minWidth: 200,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
    marginBottom: 12,
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  orText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  urlInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#fff',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    marginTop: 10,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ef4444',
    marginTop: 16,
  },
  errorSubtext: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 8,
  },
});
