import { Tabs, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useWindowDimensions, Platform, View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { useState, useRef } from 'react';
import WebHeader from '../../components/WebHeader';

function FloatingActionButton() {
  const [isExpanded, setIsExpanded] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  const toggleMenu = () => {
    const toValue = isExpanded ? 0 : 1;
    Animated.spring(animation, {
      toValue,
      useNativeDriver: true,
      friction: 5,
    }).start();
    setIsExpanded(!isExpanded);
  };

  const menuItems = [
    { icon: 'airplane', label: 'Travel', route: '/travel' },
    { icon: 'package-variant', label: 'Packages', route: '/packages' },
    { icon: 'silverware-fork-knife', label: 'Stay', route: '/accommodations' },
    { icon: 'calendar-star', label: 'Events', route: '/events' },
  ];

  const navigateTo = (route: string) => {
    router.push(route as any);
    toggleMenu();
  };

  return (
    <View style={styles.fabContainer}>
      {isExpanded && menuItems.map((item, index) => {
        const translateY = animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -(70 * (index + 1))],
        });

        const opacity = animation.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, 0, 1],
        });

        return (
          <Animated.View
            key={item.route}
            style={[
              styles.fabMenuItem,
              {
                transform: [{ translateY }],
                opacity,
              },
            ]}
          >
            <Text style={styles.fabMenuLabel}>{item.label}</Text>
            <TouchableOpacity
              style={styles.fabMenuButton}
              onPress={() => navigateTo(item.route)}
            >
              <MaterialCommunityIcons name={item.icon as any} size={24} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
        );
      })}

      <TouchableOpacity
        style={[styles.fab, isExpanded && styles.fabExpanded]}
        onPress={toggleMenu}
      >
        <Animated.View
          style={{
            transform: [
              {
                rotate: animation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '45deg'],
                }),
              },
            ],
          }}
        >
          <MaterialCommunityIcons name="plus" size={32} color="#fff" />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

function AppHeader() {
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <MaterialCommunityIcons name="butterfly" size={28} color="#fff" />
        <Text style={styles.headerTitle}>Butterfliy</Text>
      </View>
    </View>
  );
}

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isLargeScreen = width >= 768;
  const showWebLayout = isWeb && isLargeScreen;

  return (
    <>
      {showWebLayout ? <WebHeader /> : <AppHeader />}
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#667eea',
          tabBarInactiveTintColor: '#999',
          headerShown: false,
          tabBarStyle: showWebLayout 
            ? { display: 'none' } 
            : {
                paddingBottom: 8,
                paddingTop: 8,
                height: 65,
                backgroundColor: '#fff',
                borderTopWidth: 1,
                borderTopColor: '#e0e0e0',
                elevation: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
              },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginTop: 4,
          },
          tabBarIconStyle: {
            marginTop: 4,
          },
        }}
      >
      <Tabs.Screen
        name="locations"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons 
              name={focused ? "compass" : "compass-outline"} 
              size={28} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons 
              name={focused ? "account-group" : "account-group-outline"} 
              size={28} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons 
              name={focused ? "account-circle" : "account-circle-outline"} 
              size={28} 
              color={color} 
            />
          ),
        }}
      />
      
      {/* Hidden from tab bar - accessible via FAB */}
      <Tabs.Screen
        name="travel"
        options={{
          href: null,
        }}
      />
      
      {/* Hidden screens - accessible via FAB */}
      <Tabs.Screen
        name="events"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="packages"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="accommodations"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="group-travel"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="location-detail"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="event-detail"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="package-detail"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="accommodation-detail"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="events-new"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="post-composer"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="user-profile"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile-edit"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="location-feed"
        options={{
          href: null,
        }}
      />
    </Tabs>
    {!showWebLayout && <FloatingActionButton />}
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#667eea',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 85,
    right: 20,
    alignItems: 'flex-end',
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabExpanded: {
    backgroundColor: '#5568d3',
  },
  fabMenuItem: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    right: 0,
  },
  fabMenuButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#764ba2',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  fabMenuLabel: {
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    minWidth: 80,
    textAlign: 'center',
  },
});
