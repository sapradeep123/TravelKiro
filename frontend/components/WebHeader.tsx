import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Text, Avatar, Menu, Divider } from 'react-native-paper';
import { useAuth } from '../src/contexts/AuthContext';
import { useRouter, usePathname } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function WebHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuVisible, setMenuVisible] = React.useState(false);

  const menuItems = [
    { name: 'Locations', path: '/(tabs)/locations', icon: 'map-marker' },
    { name: 'Events', path: '/(tabs)/events', icon: 'calendar-star' },
    { name: 'Packages', path: '/(tabs)/packages', icon: 'package-variant' },
    { name: 'Accommodations', path: '/(tabs)/accommodations', icon: 'silverware-fork-knife' },
    { name: 'Community', path: '/(tabs)/community', icon: 'account-group' },
    { name: 'Messages', path: '/(tabs)/messages', icon: 'message' },
    { name: 'Travel', path: '/(tabs)/travel', icon: 'airplane' },
  ];

  const formatRole = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'SITE_ADMIN': 'Administrator',
      'GOVT_DEPARTMENT': 'Government',
      'TOURIST_GUIDE': 'Tour Guide',
      'USER': 'Traveler'
    };
    return roleMap[role] || role;
  };

  const handleLogout = async () => {
    setMenuVisible(false);
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.header}>
      <View style={styles.container}>
        {/* Logo */}
        <TouchableOpacity style={styles.logo} onPress={() => router.push('/(tabs)/locations')}>
          <MaterialCommunityIcons name="butterfly" size={32} color="#667eea" />
          <Text style={styles.logoText}>Butterfliy</Text>
        </TouchableOpacity>

        {/* Navigation Menu */}
        <View style={styles.nav}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.path}
              style={[
                styles.navItem,
                pathname === item.path && styles.navItemActive
              ]}
              onPress={() => router.push(item.path as any)}
            >
              <MaterialCommunityIcons 
                name={item.icon as any} 
                size={20} 
                color={pathname === item.path ? '#667eea' : '#666'} 
              />
              <Text style={[
                styles.navText,
                pathname === item.path && styles.navTextActive
              ]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* User Menu */}
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          contentStyle={styles.menuContent}
          anchor={
            <TouchableOpacity 
              style={styles.userButton}
              onPress={() => setMenuVisible(true)}
            >
              <Avatar.Text 
                size={40} 
                label={user?.profile?.name?.charAt(0) || 'U'} 
                style={styles.avatar}
              />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user?.profile?.name || 'User'}</Text>
                <Text style={styles.userRole}>{formatRole(user?.role || 'USER')}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          }
        >
          <View style={styles.menuHeader}>
            <Avatar.Text 
              size={48} 
              label={user?.profile?.name?.charAt(0) || 'U'} 
              style={styles.menuAvatar}
            />
            <View style={styles.menuUserInfo}>
              <Text style={styles.menuUserName}>{user?.profile?.name || 'User'}</Text>
              <Text style={styles.menuUserEmail}>{user?.email}</Text>
            </View>
          </View>
          <Divider style={styles.menuDivider} />
          <Menu.Item 
            onPress={() => {
              setMenuVisible(false);
              router.push('/(tabs)/profile');
            }} 
            title="My Profile" 
            leadingIcon="account-circle"
            titleStyle={styles.menuItemTitle}
            style={styles.menuItem}
          />
          <Menu.Item 
            onPress={() => {
              setMenuVisible(false);
              // Settings page
            }} 
            title="Settings" 
            leadingIcon="cog-outline"
            titleStyle={styles.menuItemTitle}
            style={styles.menuItem}
          />
          <Menu.Item 
            onPress={() => {
              setMenuVisible(false);
              // Help page
            }} 
            title="Help & Support" 
            leadingIcon="help-circle-outline"
            titleStyle={styles.menuItemTitle}
            style={styles.menuItem}
          />
          <Divider style={styles.menuDivider} />
          <Menu.Item 
            onPress={handleLogout} 
            title="Logout" 
            leadingIcon="logout"
            titleStyle={[styles.menuItemTitle, styles.logoutText]}
            style={styles.menuItem}
          />
        </Menu>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    ...Platform.select({
      web: {
        position: 'sticky' as any,
        top: 0,
        zIndex: 1000,
      },
    }),
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
    maxWidth: 1400,
    marginHorizontal: 'auto',
    width: '100%',
    gap: 16,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
    minWidth: 200,
  },
  logoIcon: {
    fontSize: 28,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#667eea',
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginHorizontal: 16,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexShrink: 0,
  },
  navItemActive: {
    backgroundColor: '#f0f4ff',
  },
  navText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
    ...Platform.select({
      web: {
        whiteSpace: 'nowrap' as any,
      },
    }),
  },
  navTextActive: {
    color: '#667eea',
    fontWeight: '600',
  },
  userButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    flexShrink: 0,
    minWidth: 180,
  },
  avatar: {
    backgroundColor: '#667eea',
  },
  userInfo: {
    alignItems: 'flex-start',
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  userRole: {
    fontSize: 12,
    color: '#6c757d',
    textTransform: 'capitalize',
  },
  menuContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    minWidth: 280,
    marginTop: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    backgroundColor: '#f8f9fa',
  },
  menuAvatar: {
    backgroundColor: '#667eea',
  },
  menuUserInfo: {
    flex: 1,
  },
  menuUserName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 2,
  },
  menuUserEmail: {
    fontSize: 13,
    color: '#6c757d',
  },
  menuDivider: {
    backgroundColor: '#e9ecef',
    height: 1,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItemTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
  },
  logoutText: {
    color: '#dc3545',
    fontWeight: '600',
  },
});
