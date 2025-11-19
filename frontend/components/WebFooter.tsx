import React from 'react';
import { View, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function WebFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <View style={styles.footer}>
      <View style={styles.container}>
        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Butterfliy</Text>
          <Text style={styles.sectionText}>
            Discover amazing destinations, plan your trips, and connect with fellow travelers.
          </Text>
          <View style={styles.socialLinks}>
            <TouchableOpacity style={styles.socialIcon}>
              <MaterialCommunityIcons name="facebook" size={24} color="#667eea" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialIcon}>
              <MaterialCommunityIcons name="twitter" size={24} color="#667eea" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialIcon}>
              <MaterialCommunityIcons name="instagram" size={24} color="#667eea" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialIcon}>
              <MaterialCommunityIcons name="youtube" size={24} color="#667eea" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Links</Text>
          <TouchableOpacity style={styles.link}>
            <Text style={styles.linkText}>About Us</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.link}>
            <Text style={styles.linkText}>Contact</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.link}>
            <Text style={styles.linkText}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.link}>
            <Text style={styles.linkText}>Terms of Service</Text>
          </TouchableOpacity>
        </View>

        {/* Resources */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resources</Text>
          <TouchableOpacity style={styles.link}>
            <Text style={styles.linkText}>Travel Guide</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.link}>
            <Text style={styles.linkText}>Blog</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.link}>
            <Text style={styles.linkText}>FAQs</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.link}>
            <Text style={styles.linkText}>Support</Text>
          </TouchableOpacity>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <View style={styles.contactItem}>
            <MaterialCommunityIcons name="email" size={16} color="#666" />
            <Text style={styles.contactText}>info@travelencyclopedia.com</Text>
          </View>
          <View style={styles.contactItem}>
            <MaterialCommunityIcons name="phone" size={16} color="#666" />
            <Text style={styles.contactText}>+1 (555) 123-4567</Text>
          </View>
          <View style={styles.contactItem}>
            <MaterialCommunityIcons name="map-marker" size={16} color="#666" />
            <Text style={styles.contactText}>123 Travel St, City, Country</Text>
          </View>
        </View>
      </View>

      {/* Copyright */}
      <View style={styles.copyright}>
        <Text style={styles.copyrightText}>
          © {currentYear} Butterfliy. All rights reserved.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: '#2c3e50',
    paddingTop: 40,
    paddingBottom: 20,
    position: 'relative', // Ensure it's not fixed
    width: '100%',
  },
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    maxWidth: 1400,
    marginHorizontal: 'auto',
    width: '100%',
    gap: 32,
  },
  section: {
    flex: 1,
    minWidth: 200,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  sectionText: {
    fontSize: 14,
    color: '#bdc3c7',
    lineHeight: 22,
    marginBottom: 16,
  },
  socialLinks: {
    flexDirection: 'row',
    gap: 12,
  },
  socialIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#34495e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  link: {
    paddingVertical: 6,
  },
  linkText: {
    fontSize: 14,
    color: '#bdc3c7',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  contactText: {
    fontSize: 14,
    color: '#bdc3c7',
  },
  copyright: {
    borderTopWidth: 1,
    borderTopColor: '#34495e',
    marginTop: 32,
    paddingTop: 20,
    paddingHorizontal: 24,
  },
  copyrightText: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
  },
});
