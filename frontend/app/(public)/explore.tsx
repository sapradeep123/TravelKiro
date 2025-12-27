import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
  ActivityIndicator,
  RefreshControl,
  ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../src/services/api';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

interface Location {
  id: string;
  country: string;
  state: string;
  area: string;
  description: string;
  images: string[];
}

interface Event {
  id: string;
  title: string;
  description: string;
  eventType: string;
  images: string[];
  startDate: string;
}

interface Package {
  id: string;
  title: string;
  description: string;
  duration: number;
  price: number;
  images: string[];
}

interface CommunityPost {
  id: string;
  caption: string;
  mediaUrls: string[];
  likeCount: number;
  commentCount: number;
  user: {
    profile: {
      name: string;
      avatar: string | null;
    };
  };
}

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920',
];

export default function ExplorePage() {
  const router = useRouter();
  const [locations, setLocations] = useState<Location[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);

  const fetchData = async () => {
    try {
      const [locRes, evtRes, pkgRes, postRes] = await Promise.all([
        api.get('/locations?limit=6').catch(() => ({ data: { data: [] } })),
        api.get('/events?limit=4').catch(() => ({ data: { data: [] } })),
        api.get('/packages?limit=4').catch(() => ({ data: { data: [] } })),
        api.get('/community/posts/public?limit=9').catch(() => ({ data: { data: [] } })),
      ]);

      setLocations(locRes.data.data || []);
      setEvents(evtRes.data.data || []);
      setPackages(pkgRes.data.data || []);
      setPosts(postRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Rotate hero images
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const navigateToLogin = () => router.push('/(auth)/login');
  const navigateToSignup = () => router.push('/(auth)/register');

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <Text style={styles.loadingLogo}>🦋</Text>
          <Text style={styles.loadingTitle}>Butterfliy</Text>
          <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
      >
        {/* Hero Section with Full Screen Image */}
        <ImageBackground
          source={{ uri: HERO_IMAGES[heroIndex] }}
          style={styles.heroSection}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.8)']}
            style={styles.heroOverlay}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={styles.logoIcon}>🦋</Text>
                <Text style={styles.logoText}>Butterfliy</Text>
              </View>
              <View style={styles.headerRight}>
                <TouchableOpacity style={styles.signInBtn} onPress={navigateToLogin}>
                  <Text style={styles.signInText}>Sign In</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.joinBtn} onPress={navigateToSignup}>
                  <LinearGradient
                    colors={['#8b5cf6', '#6366f1']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.joinBtnGradient}
                  >
                    <Text style={styles.joinBtnText}>Get Started</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>

            {/* Hero Content */}
            <View style={styles.heroContent}>
              <Text style={styles.heroTagline}>Your Journey Begins Here</Text>
              <Text style={styles.heroTitle}>Discover{'\n'}Extraordinary{'\n'}Places</Text>
              <Text style={styles.heroSubtitle}>
                Join a community of passionate travelers. Share experiences, discover hidden gems, and plan unforgettable adventures.
              </Text>
              <View style={styles.heroCTA}>
                <TouchableOpacity style={styles.primaryBtn} onPress={navigateToSignup}>
                  <LinearGradient
                    colors={['#8b5cf6', '#6366f1']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.primaryBtnGradient}
                  >
                    <Text style={styles.primaryBtnText}>Start Exploring</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryBtn} onPress={navigateToLogin}>
                  <Ionicons name="play-circle" size={24} color="#fff" />
                  <Text style={styles.secondaryBtnText}>Watch Demo</Text>
                </TouchableOpacity>
              </View>
              
              {/* Stats */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>10K+</Text>
                  <Text style={styles.statLabel}>Travelers</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>500+</Text>
                  <Text style={styles.statLabel}>Destinations</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>50K+</Text>
                  <Text style={styles.statLabel}>Photos</Text>
                </View>
              </View>
            </View>

            {/* Scroll Indicator */}
            <View style={styles.scrollIndicator}>
              <Ionicons name="chevron-down" size={24} color="rgba(255,255,255,0.6)" />
            </View>
          </LinearGradient>
        </ImageBackground>

        {/* Featured Destinations */}
        {locations.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionLabel}>EXPLORE</Text>
                <Text style={styles.sectionTitle}>Trending Destinations</Text>
              </View>
              <TouchableOpacity style={styles.viewAllBtn} onPress={navigateToLogin}>
                <Text style={styles.viewAllText}>View All</Text>
                <Ionicons name="arrow-forward" size={16} color="#6366f1" />
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
              {locations.map((location, index) => (
                <TouchableOpacity key={location.id} style={[styles.destinationCard, index === 0 && styles.firstCard]} onPress={navigateToLogin}>
                  <Image
                    source={{ uri: location.images?.[0] || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600' }}
                    style={styles.destinationImage}
                  />
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={styles.destinationOverlay}>
                    <View style={styles.destinationBadge}>
                      <Ionicons name="location" size={12} color="#fff" />
                      <Text style={styles.destinationBadgeText}>{location.country}</Text>
                    </View>
                    <Text style={styles.destinationName}>{location.area}</Text>
                    <Text style={styles.destinationState}>{location.state}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Community Gallery */}
        {posts.length > 0 && (
          <View style={styles.communitySection}>
            <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.communityGradient}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={[styles.sectionLabel, { color: '#a78bfa' }]}>COMMUNITY</Text>
                  <Text style={[styles.sectionTitle, { color: '#fff' }]}>Travel Stories</Text>
                </View>
                <TouchableOpacity style={[styles.viewAllBtn, styles.viewAllBtnDark]} onPress={navigateToSignup}>
                  <Text style={[styles.viewAllText, { color: '#a78bfa' }]}>Join Community</Text>
                  <Ionicons name="arrow-forward" size={16} color="#a78bfa" />
                </TouchableOpacity>
              </View>
              <View style={styles.galleryGrid}>
                {posts.slice(0, 6).map((post, index) => (
                  <TouchableOpacity 
                    key={post.id} 
                    style={[
                      styles.galleryItem,
                      index === 0 && styles.galleryItemLarge,
                    ]} 
                    onPress={navigateToLogin}
                  >
                    <Image source={{ uri: post.mediaUrls?.[0] || 'https://via.placeholder.com/400' }} style={styles.galleryImage} />
                    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.galleryOverlay}>
                      <View style={styles.galleryStats}>
                        <View style={styles.galleryStat}>
                          <Ionicons name="heart" size={14} color="#fff" />
                          <Text style={styles.galleryStatText}>{post.likeCount}</Text>
                        </View>
                        <View style={styles.galleryStat}>
                          <Ionicons name="chatbubble" size={14} color="#fff" />
                          <Text style={styles.galleryStatText}>{post.commentCount}</Text>
                        </View>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Events & Packages Row */}
        <View style={styles.eventsPackagesSection}>
          {/* Events */}
          {events.length > 0 && (
            <View style={styles.halfSection}>
              <View style={styles.sectionHeaderSmall}>
                <Text style={styles.sectionLabel}>UPCOMING</Text>
                <Text style={styles.sectionTitleSmall}>Events</Text>
              </View>
              {events.slice(0, 2).map((event) => (
                <TouchableOpacity key={event.id} style={styles.eventCard} onPress={navigateToLogin}>
                  <Image source={{ uri: event.images?.[0] || 'https://via.placeholder.com/120' }} style={styles.eventImage} />
                  <View style={styles.eventInfo}>
                    <View style={styles.eventTypeBadge}>
                      <Text style={styles.eventTypeText}>{event.eventType}</Text>
                    </View>
                    <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>
                    <View style={styles.eventDate}>
                      <Ionicons name="calendar-outline" size={14} color="#6b7280" />
                      <Text style={styles.eventDateText}>{new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Packages */}
          {packages.length > 0 && (
            <View style={styles.halfSection}>
              <View style={styles.sectionHeaderSmall}>
                <Text style={styles.sectionLabel}>FEATURED</Text>
                <Text style={styles.sectionTitleSmall}>Packages</Text>
              </View>
              {packages.slice(0, 2).map((pkg) => (
                <TouchableOpacity key={pkg.id} style={styles.packageCard} onPress={navigateToLogin}>
                  <Image source={{ uri: pkg.images?.[0] || 'https://via.placeholder.com/120' }} style={styles.packageImage} />
                  <View style={styles.packageInfo}>
                    <Text style={styles.packageTitle} numberOfLines={2}>{pkg.title}</Text>
                    <View style={styles.packageMeta}>
                      <View style={styles.packageDuration}>
                        <Ionicons name="time-outline" size={14} color="#6b7280" />
                        <Text style={styles.packageDurationText}>{pkg.duration} Days</Text>
                      </View>
                      <Text style={styles.packagePrice}>₹{pkg.price?.toLocaleString()}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1920' }}
            style={styles.ctaBackground}
            resizeMode="cover"
          >
            <LinearGradient colors={['rgba(99,102,241,0.9)', 'rgba(139,92,246,0.9)']} style={styles.ctaOverlay}>
              <Text style={styles.ctaTitle}>Ready for Your Next Adventure?</Text>
              <Text style={styles.ctaSubtitle}>Join thousands of travelers sharing their journeys and discovering new horizons</Text>
              <TouchableOpacity style={styles.ctaBtn} onPress={navigateToSignup}>
                <Text style={styles.ctaBtnText}>Create Free Account</Text>
                <Ionicons name="arrow-forward" size={20} color="#6366f1" />
              </TouchableOpacity>
              <Text style={styles.ctaNote}>✓ Free forever  ✓ No credit card required</Text>
            </LinearGradient>
          </ImageBackground>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerTop}>
            <View style={styles.footerBrand}>
              <Text style={styles.footerLogo}>🦋 Butterfliy</Text>
              <Text style={styles.footerTagline}>Your Travel Community</Text>
            </View>
            <View style={styles.footerLinks}>
              <TouchableOpacity><Text style={styles.footerLink}>About</Text></TouchableOpacity>
              <TouchableOpacity><Text style={styles.footerLink}>Privacy</Text></TouchableOpacity>
              <TouchableOpacity><Text style={styles.footerLink}>Terms</Text></TouchableOpacity>
              <TouchableOpacity><Text style={styles.footerLink}>Contact</Text></TouchableOpacity>
            </View>
          </View>
          <View style={styles.footerBottom}>
            <Text style={styles.footerCopyright}>© 2025 Butterfliy. All rights reserved.</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingLogo: {
    fontSize: 64,
    marginBottom: 16,
  },
  loadingTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  
  // Hero Section
  heroSection: {
    height: isWeb ? SCREEN_HEIGHT : SCREEN_HEIGHT * 0.95,
    minHeight: 700,
  },
  heroOverlay: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: isWeb ? 60 : 20,
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    fontSize: 28,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  signInBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  signInText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  joinBtn: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  joinBtnGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  joinBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  heroContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: isWeb ? 60 : 24,
    maxWidth: isWeb ? 800 : '100%',
  },
  heroTagline: {
    fontSize: 14,
    fontWeight: '600',
    color: '#a78bfa',
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: isWeb ? 72 : 48,
    fontWeight: 'bold',
    color: '#fff',
    lineHeight: isWeb ? 80 : 56,
    marginBottom: 24,
  },
  heroSubtitle: {
    fontSize: isWeb ? 18 : 16,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 28,
    marginBottom: 32,
    maxWidth: 500,
  },
  heroCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 48,
    flexWrap: 'wrap',
  },
  primaryBtn: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  primaryBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    gap: 8,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  secondaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  scrollIndicator: {
    alignItems: 'center',
    paddingBottom: 30,
  },

  // Sections
  section: {
    paddingVertical: 60,
    paddingHorizontal: isWeb ? 60 : 20,
    backgroundColor: '#fff',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 32,
    paddingHorizontal: isWeb ? 0 : 0,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6366f1',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: isWeb ? 36 : 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  viewAllBtnDark: {
    backgroundColor: 'rgba(167,139,250,0.2)',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
  },
  horizontalScroll: {
    paddingLeft: isWeb ? 0 : 0,
  },

  // Destination Cards
  destinationCard: {
    width: isWeb ? 320 : 280,
    height: 400,
    borderRadius: 24,
    overflow: 'hidden',
    marginRight: 20,
  },
  firstCard: {
    marginLeft: 0,
  },
  destinationImage: {
    width: '100%',
    height: '100%',
  },
  destinationOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingTop: 60,
  },
  destinationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  destinationBadgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  destinationName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  destinationState: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },

  // Community Section
  communitySection: {
    backgroundColor: '#1a1a2e',
  },
  communityGradient: {
    paddingVertical: 60,
    paddingHorizontal: isWeb ? 60 : 20,
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  galleryItem: {
    width: isWeb ? 'calc(33.333% - 11px)' as any : (SCREEN_WIDTH - 56) / 3,
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  galleryItemLarge: {
    width: isWeb ? 'calc(33.333% - 11px)' as any : (SCREEN_WIDTH - 56) / 3,
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  galleryOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  galleryStats: {
    flexDirection: 'row',
    gap: 12,
  },
  galleryStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  galleryStatText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },

  // Events & Packages
  eventsPackagesSection: {
    flexDirection: isWeb ? 'row' : 'column',
    backgroundColor: '#f9fafb',
    paddingVertical: 60,
    paddingHorizontal: isWeb ? 60 : 20,
    gap: 40,
  },
  halfSection: {
    flex: 1,
  },
  sectionHeaderSmall: {
    marginBottom: 24,
  },
  sectionTitleSmall: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  eventImage: {
    width: 120,
    height: 120,
  },
  eventInfo: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  eventTypeBadge: {
    backgroundColor: '#ede9fe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  eventTypeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7c3aed',
    textTransform: 'uppercase',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  eventDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventDateText: {
    fontSize: 13,
    color: '#6b7280',
  },
  packageCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  packageImage: {
    width: 120,
    height: 120,
  },
  packageInfo: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  packageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  packageMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  packageDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  packageDurationText: {
    fontSize: 13,
    color: '#6b7280',
  },
  packagePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
  },

  // CTA Section
  ctaSection: {
    height: 400,
  },
  ctaBackground: {
    flex: 1,
  },
  ctaOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  ctaTitle: {
    fontSize: isWeb ? 40 : 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  ctaSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    maxWidth: 500,
    marginBottom: 32,
    lineHeight: 24,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    gap: 8,
    marginBottom: 16,
  },
  ctaBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
  },
  ctaNote: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },

  // Footer
  footer: {
    backgroundColor: '#111827',
    paddingVertical: 40,
    paddingHorizontal: isWeb ? 60 : 20,
  },
  footerTop: {
    flexDirection: isWeb ? 'row' : 'column',
    justifyContent: 'space-between',
    alignItems: isWeb ? 'center' : 'flex-start',
    marginBottom: 32,
    gap: 24,
  },
  footerBrand: {},
  footerLogo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  footerTagline: {
    fontSize: 14,
    color: '#9ca3af',
  },
  footerLinks: {
    flexDirection: 'row',
    gap: 24,
  },
  footerLink: {
    fontSize: 14,
    color: '#9ca3af',
  },
  footerBottom: {
    borderTopWidth: 1,
    borderTopColor: '#374151',
    paddingTop: 24,
  },
  footerCopyright: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
  },
});
