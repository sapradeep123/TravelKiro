import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Footer() {
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  return (
    <View style={styles.footer}>
      <View style={styles.container}>
        <View style={styles.linksSection}>
          <TouchableOpacity
            style={styles.link}
            onPress={() => router.push('/terms' as any)}
          >
            <MaterialCommunityIcons name="file-document-outline" size={16} color="#667eea" />
            <Text style={styles.linkText}>Terms & Conditions</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.link}
            onPress={() => router.push('/privacy' as any)}
          >
            <MaterialCommunityIcons name="shield-check-outline" size={16} color="#667eea" />
            <Text style={styles.linkText}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.copyrightSection}>
          <Text style={styles.copyright}>
            © {currentYear} Butterfliy. All rights reserved.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginTop: 'auto',
  },
  container: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    width: '100%',
  },
  linksSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  linkText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '500',
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: '#E0E0E0',
  },
  copyrightSection: {
    alignItems: 'center',
  },
  copyright: {
    fontSize: 12,
    color: '#666',
  },
});
