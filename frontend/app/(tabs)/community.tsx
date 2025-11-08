import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Image, RefreshControl, TouchableOpacity, useWindowDimensions, Platform, Alert, ScrollView } from 'react-native';
import { Card, Text, ActivityIndicator, IconButton, Avatar, SegmentedButtons, Button, Chip, Divider } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { communityService } from '../../src/services/communityService';
import { groupTravelService } from '../../src/services/groupTravelService';
import { CommunityPost, GroupTravel } from '../../src/types';
import { useAuth } from '../../src/contexts/AuthContext';

type TabType = 'posts' | 'groups';

// Sample data for sidebars
const SAMPLE_FRIENDS = [
  { id: '1', name: 'Priya Sharma', initials: 'PS', online: true },
  { id: '2', name: 'Rahul Kumar', initials: 'RK', online: true },
  { id: '3', name: 'Anita Desai', initials: 'AD', online: false },
  { id: '4', name: 'Vikram Singh', initials: 'VS', online: true },
  { id: '5', name: 'Meera Patel', initials: 'MP', online: false },
];

const SAMPLE_BADGES = [
  { icon: 'trophy', color: '#FFD700', name: 'Explorer' },
  { icon: 'star', color: '#667eea', name: 'Star Traveler' },
  { icon: 'medal', color: '#FF6B6B', name: 'Adventure Master' },
  { icon: 'crown', color: '#FFA500', name: 'Travel King' },
  { icon: 'shield', color: '#4ECDC4', name: 'Safety First' },
  { icon: 'fire', color: '#FF4757', name: 'Hot Streak' },
  { icon: 'heart', color: '#F44336', name: 'Community Hero' },
  { icon: 'airplane', color: '#667eea', name: 'Frequent Flyer' },
];

const SAMPLE_PHOTOS = [
  'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=200',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=200',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200',
  'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=200',
  'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=200',
  'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=200',
  'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=200',
  'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=200',
];

const SAMPLE_ACTIVITIES = [
  { id: '1', user: 'Priya Sharma', action: 'liked your post', time: '2 hours ago', initials: 'PS' },
  { id: '2', user: 'Rahul Kumar', action: 'commented on your photo', time: '5 hours ago', initials: 'RK' },
  { id: '3', user: 'Anita Desai', action: 'shared your travel story', time: '1 day ago', initials: 'AD' },
  { id: '4', user: 'Vikram Singh', action: 'joined your group travel', time: '2 days ago', initials: 'VS' },
];

const SAMPLE_STREAM = {
  title: 'Exploring Kerala Backwaters - Live Tour!',
  streamer: 'Travel Vlogger',
  initials: 'TV',
  thumbnail: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400',
  viewers: 234,
};

export default function CommunityScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [groupTravels, setGroupTravels] = useState<GroupTravel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isLargeScreen = width >= 1024;
  const showWebLayout = isWeb && isLargeScreen;

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'posts') {
        const data = await communityService.getFeed();
        setPosts(data);
      } else {
        const data = await groupTravelService.getAllGroupTravels();
        setGroupTravels(data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleLike = async (postId: string) => {
    try {
      await communityService.likePost(postId);
      await loadData();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const formatPostDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const LeftSidebar = () => (
    <View style={styles.sidebar}>
      {/* About Me */}
      <Card style={styles.sidebarCard}>
        <Card.Content>
          <View style={styles.sidebarHeader}>
            <Text variant="titleMedium" style={styles.sidebarTitle}>About Me</Text>
            <IconButton icon="pencil" size={18} onPress={() => Alert.alert('Edit Profile', 'Profile editing coming soon!')} />
          </View>
          <Text variant="bodySmall" style={styles.aboutText}>
            Hi! My name is {user?.profile?.name || 'Travel Enthusiast'}. I love traveling and exploring new places. Join me on my adventures across India and beyond! 🌍✈️
          </Text>
          <Divider style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Joined</Text>
            <Text style={styles.infoValue}>March 20th, 2024</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Location</Text>
            <Text style={styles.infoValue}>Mumbai, India</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Trips</Text>
            <Text style={styles.infoValue}>12 trips</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Countries</Text>
            <Text style={styles.infoValue}>5 countries</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Badges */}
      <Card style={styles.sidebarCard}>
        <Card.Content>
          <View style={styles.sidebarHeader}>
            <Text variant="titleMedium" style={styles.sidebarTitle}>Badges</Text>
            <Chip compact style={styles.badgeCount}>{SAMPLE_BADGES.length}</Chip>
          </View>
          <View style={styles.badgesGrid}>
            {SAMPLE_BADGES.map((badge, i) => (
              <TouchableOpacity 
                key={i} 
                style={[styles.badge, { backgroundColor: `${badge.color}15` }]}
                onPress={() => Alert.alert(badge.name, 'Achievement unlocked!')}
              >
                <MaterialCommunityIcons name={badge.icon as any} size={32} color={badge.color} />
              </TouchableOpacity>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Friends */}
      <Card style={styles.sidebarCard}>
        <Card.Content>
          <View style={styles.sidebarHeader}>
            <Text variant="titleMedium" style={styles.sidebarTitle}>Friends</Text>
            <Chip compact style={styles.badgeCount}>{SAMPLE_FRIENDS.length}</Chip>
          </View>
          {SAMPLE_FRIENDS.map((friend) => (
            <TouchableOpacity key={friend.id} style={styles.friendItem}>
              <Avatar.Text size={40} label={friend.initials} style={styles.friendAvatar} />
              <View style={styles.friendInfo}>
                <Text variant="bodyMedium" style={styles.friendName}>{friend.name}</Text>
                <View style={styles.friendStatusContainer}>
                  {friend.online && <View style={styles.onlineDot} />}
                  <Text variant="bodySmall" style={styles.friendStatusText}>
                    {friend.online ? 'Online' : 'Offline'}
                  </Text>
                </View>
              </View>
              <IconButton 
                icon="message" 
                size={20} 
                onPress={() => Alert.alert('Message', `Chat with ${friend.name}`)} 
              />
            </TouchableOpacity>
          ))}
        </Card.Content>
      </Card>
    </View>
  );

  const RightSidebar = () => (
    <View style={styles.sidebar}>
      {/* Stream Box */}
      <Card style={styles.sidebarCard}>
        <Card.Content>
          <View style={styles.sidebarHeader}>
            <Text variant="titleMedium" style={styles.sidebarTitle}>Live Streams</Text>
            <IconButton icon="dots-horizontal" size={18} onPress={() => {}} />
          </View>
          <TouchableOpacity 
            style={styles.streamBox}
            onPress={() => Alert.alert('Live Stream', `Join ${SAMPLE_STREAM.streamer}'s live stream!`)}
          >
            <Image 
              source={{ uri: SAMPLE_STREAM.thumbnail }} 
              style={styles.streamImage}
            />
            <View style={styles.streamOverlay}>
              <Chip icon="circle" style={styles.liveChip} textStyle={styles.liveText} compact>
                LIVE
              </Chip>
              <View style={styles.viewersChip}>
                <MaterialCommunityIcons name="eye" size={12} color="#fff" />
                <Text style={styles.viewersText}>{SAMPLE_STREAM.viewers}</Text>
              </View>
            </View>
            <View style={styles.streamInfo}>
              <Avatar.Text size={32} label={SAMPLE_STREAM.initials} style={styles.streamAvatar} />
              <View style={styles.streamTextInfo}>
                <Text variant="bodySmall" style={styles.streamTitle} numberOfLines={1}>
                  {SAMPLE_STREAM.title}
                </Text>
                <Text variant="bodySmall" style={styles.streamStreamer}>
                  {SAMPLE_STREAM.streamer}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </Card.Content>
      </Card>

      {/* Photos */}
      <Card style={styles.sidebarCard}>
        <Card.Content>
          <View style={styles.sidebarHeader}>
            <Text variant="titleMedium" style={styles.sidebarTitle}>Photos</Text>
            <TouchableOpacity onPress={() => Alert.alert('Photos', 'View all photos')}>
              <Text style={styles.photoCount}>{SAMPLE_PHOTOS.length}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.photosGrid}>
            {SAMPLE_PHOTOS.map((photo, i) => (
              <TouchableOpacity 
                key={i}
                onPress={() => Alert.alert('Photo', `Viewing photo ${i + 1}`)}
              >
                <Image 
                  source={{ uri: photo }} 
                  style={styles.photoItem}
                />
              </TouchableOpacity>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Activity Feed */}
      <Card style={styles.sidebarCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sidebarTitle}>Recent Activity</Text>
          {SAMPLE_ACTIVITIES.map((activity) => (
            <TouchableOpacity 
              key={activity.id} 
              style={styles.activityItem}
              onPress={() => Alert.alert('Activity', `${activity.user} ${activity.action}`)}
            >
              <Avatar.Text size={32} label={activity.initials} style={styles.activityAvatar} />
              <View style={styles.activityInfo}>
                <Text variant="bodySmall" style={styles.activityText}>
                  <Text style={styles.activityUser}>{activity.user}</Text> {activity.action}
                </Text>
                <Text variant="bodySmall" style={styles.activityTime}>{activity.time}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </Card.Content>
      </Card>
    </View>
  );

  const renderPost = ({ item }: { item: CommunityPost }) => {
    const isLiked = item.likes.some((like: any) => like.userId === user?.id);
    
    return (
      <Card style={styles.postCard}>
        {/* Post Header */}
        <View style={styles.postHeader}>
          <View style={styles.postUserInfo}>
            <Avatar.Text
              size={48}
              label={item.user.profile.name.substring(0, 2).toUpperCase()}
              style={styles.postAvatar}
            />
            <View style={styles.postUserDetails}>
              <Text variant="titleMedium" style={styles.postUserName}>
                {item.user.profile.name}
              </Text>
              <Text variant="bodySmall" style={styles.postTimestamp}>
                {formatPostDate(item.createdAt)}
              </Text>
            </View>
          </View>
          <IconButton icon="dots-horizontal" size={20} onPress={() => {}} />
        </View>

        {/* Post Caption */}
        <Text variant="bodyMedium" style={styles.postCaption}>
          {item.caption}
        </Text>

        {/* Post Image */}
        {item.mediaUrls && item.mediaUrls.length > 0 && (
          <Image 
            source={{ uri: item.mediaUrls[0] }} 
            style={styles.postImage}
            resizeMode="cover"
          />
        )}

        {/* Reactions */}
        <View style={styles.postReactions}>
          <View style={styles.reactionIcons}>
            <MaterialCommunityIcons name="heart" size={16} color="#F44336" />
            <MaterialCommunityIcons name="thumb-up" size={16} color="#2196F3" />
            <MaterialCommunityIcons name="emoticon-happy" size={16} color="#FFC107" />
            <Text style={styles.reactionCount}>{item.likes.length}</Text>
          </View>
          <View style={styles.postStats}>
            <Text style={styles.statText}>{item.comments.length} Comments</Text>
            <Text style={styles.statText}>5 Shares</Text>
          </View>
        </View>

        <Divider style={styles.postDivider} />

        {/* Actions */}
        <View style={styles.postActions}>
          <TouchableOpacity 
            style={styles.postAction}
            onPress={() => handleLike(item.id)}
          >
            <MaterialCommunityIcons 
              name={isLiked ? 'heart' : 'heart-outline'} 
              size={20} 
              color={isLiked ? '#F44336' : '#666'} 
            />
            <Text style={[styles.actionText, isLiked && styles.actionTextActive]}>React</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.postAction}>
            <MaterialCommunityIcons name="comment-outline" size={20} color="#666" />
            <Text style={styles.actionText}>Comment</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.postAction}>
            <MaterialCommunityIcons name="share-outline" size={20} color="#666" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  const handleExpressInterest = async (id: string, title: string) => {
    try {
      await groupTravelService.expressInterest(id);
      Alert.alert('Success', `You expressed interest in "${title}".`);
      await loadData();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Could not express interest');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderGroupTravel = ({ item }: { item: GroupTravel }) => {
    const isExpired = new Date(item.expiryDate) < new Date();
    const isInterested = item.interestedUsers.some((u: any) => u.userId === user?.id);
    
    return (
      <Card style={styles.postCard}>
        <Card.Content>
          <View style={styles.groupHeader}>
            <Avatar.Icon size={56} icon="account-multiple" style={styles.groupAvatar} />
            <View style={styles.groupHeaderInfo}>
              <Text variant="titleLarge" style={styles.groupTitle}>{item.title}</Text>
              <Text variant="bodySmall" style={styles.groupCreator}>
                by {item.creator.profile.name}
              </Text>
            </View>
            {item.status === 'OPEN' && !isExpired ? (
              <Chip icon="check-circle" style={styles.openChip} textStyle={styles.chipText} compact>
                Open
              </Chip>
            ) : (
              <Chip icon="close-circle" style={styles.closedChip} textStyle={styles.chipText} compact>
                Closed
              </Chip>
            )}
          </View>

          <Text variant="bodyMedium" style={styles.groupDescription}>
            {item.description}
          </Text>

          <View style={styles.groupDetails}>
            <View style={styles.groupDetailItem}>
              <MaterialCommunityIcons name="calendar" size={20} color="#667eea" />
              <Text style={styles.groupDetailText}>{formatDate(item.travelDate)}</Text>
            </View>
            <View style={styles.groupDetailItem}>
              <MaterialCommunityIcons name="account-multiple" size={20} color="#4CAF50" />
              <Text style={styles.groupDetailText}>{item.interestedUsers.length} interested</Text>
            </View>
            <View style={styles.groupDetailItem}>
              <MaterialCommunityIcons name="briefcase" size={20} color="#FF9800" />
              <Text style={styles.groupDetailText}>{item.bids.length} bids</Text>
            </View>
          </View>

          {item.status === 'OPEN' && !isExpired && (
            <Button
              mode={isInterested ? 'outlined' : 'contained'}
              onPress={() => handleExpressInterest(item.id, item.title)}
              disabled={isInterested}
              style={styles.groupButton}
              icon={isInterested ? 'check' : 'account-plus'}
            >
              {isInterested ? 'Already Joined' : 'Join Group'}
            </Button>
          )}
        </Card.Content>
      </Card>
    );
  };

  if (loading) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading community...</Text>
      </LinearGradient>
    );
  }

  if (showWebLayout) {
    return (
      <View style={styles.container}>
        <View style={styles.webLayout}>
          <View style={styles.sidebarColumn}>
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.sidebarContent}
            >
              <LeftSidebar />
            </ScrollView>
          </View>
          
          <View style={styles.mainColumn}>
            <View style={styles.tabContainer}>
              <SegmentedButtons
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as TabType)}
                buttons={[
                  { value: 'posts', label: 'Posts', icon: 'post' },
                  { value: 'groups', label: 'Group Travel', icon: 'account-multiple' },
                ]}
                style={styles.segmentedButtons}
              />
            </View>
            <FlatList
              data={activeTab === 'posts' ? posts : (groupTravels as any)}
              renderItem={activeTab === 'posts' ? renderPost : (renderGroupTravel as any)}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.feedContent}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
              }
              showsVerticalScrollIndicator={false}
            />
          </View>
          
          <View style={styles.sidebarColumn}>
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.sidebarContent}
            >
              <RightSidebar />
            </ScrollView>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.mobileHeader}>
        <Text variant="headlineMedium" style={styles.headerTitle}>Community</Text>
        <Text style={styles.headerSubtitle}>Connect with fellow travelers</Text>
      </LinearGradient>
      
      <View style={styles.tabContainer}>
        <SegmentedButtons
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as TabType)}
          buttons={[
            { value: 'posts', label: 'Posts', icon: 'post' },
            { value: 'groups', label: 'Groups', icon: 'account-multiple' },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      <FlatList
        data={activeTab === 'posts' ? posts : (groupTravels as any)}
        renderItem={activeTab === 'posts' ? renderPost : (renderGroupTravel as any)}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.mobileListContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#fff',
  },
  webLayout: {
    flexDirection: 'row',
    flex: 1,
    maxWidth: 1400,
    marginHorizontal: 'auto',
    width: '100%',
    gap: 20,
    padding: 20,
  },
  sidebarColumn: {
    width: 280,
    flexShrink: 0,
  },
  sidebarContent: {
    paddingBottom: 20,
  },
  sidebar: {
    gap: 16,
  },
  mainColumn: {
    flex: 1,
    maxWidth: 600,
  },
  sidebarCard: {
    borderRadius: 12,
    elevation: 1,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sidebarTitle: {
    fontWeight: '700',
    color: '#1c1e21',
  },
  aboutText: {
    color: '#65676b',
    lineHeight: 20,
    marginBottom: 12,
  },
  divider: {
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    color: '#65676b',
    fontSize: 13,
  },
  infoValue: {
    color: '#1c1e21',
    fontSize: 13,
    fontWeight: '600',
  },
  badgeCount: {
    backgroundColor: '#667eea',
    height: 24,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badge: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  friendAvatar: {
    backgroundColor: '#667eea',
  },
  friendInfo: {
    flex: 1,
    marginLeft: 12,
  },
  friendName: {
    fontWeight: '600',
    color: '#1c1e21',
  },
  friendStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  friendStatusText: {
    color: '#65676b',
    fontSize: 12,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  streamBox: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  streamImage: {
    width: '100%',
    height: 150,
  } as any,
  streamOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    gap: 8,
  },
  liveChip: {
    backgroundColor: '#F44336',
  },
  liveText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  viewersChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  viewersText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  streamInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streamAvatar: {
    backgroundColor: '#667eea',
  },
  streamTextInfo: {
    flex: 1,
  },
  streamTitle: {
    color: '#fff',
    fontWeight: '600',
    marginBottom: 2,
  },
  streamStreamer: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
  },
  photoCount: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  photoItem: {
    width: 84,
    height: 84,
    borderRadius: 8,
  } as any,
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityAvatar: {
    backgroundColor: '#667eea',
  },
  activityInfo: {
    flex: 1,
    marginLeft: 12,
  },
  activityText: {
    color: '#1c1e21',
    fontSize: 13,
  },
  activityUser: {
    fontWeight: '600',
  },
  activityTime: {
    color: '#65676b',
    fontSize: 12,
  },
  mobileHeader: {
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
  },
  tabContainer: {
    paddingHorizontal: 0,
    paddingVertical: 12,
    backgroundColor: '#fff',
    marginBottom: 16,
    borderRadius: 12,
  },
  segmentedButtons: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
  },
  feedContent: {
    paddingBottom: 20,
    paddingTop: 0,
  },
  mobileListContent: {
    paddingBottom: 160,
  },
  postCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 1,
    backgroundColor: '#fff',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  postUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  postAvatar: {
    backgroundColor: '#667eea',
  },
  postUserDetails: {
    marginLeft: 12,
  },
  postUserName: {
    fontWeight: '700',
    color: '#1c1e21',
  },
  postTimestamp: {
    color: '#65676b',
    fontSize: 12,
  },
  postCaption: {
    color: '#1c1e21',
    lineHeight: 20,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  postImage: {
    width: '100%',
    height: 400,
    backgroundColor: '#f0f0f0',
  } as any,
  postReactions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  reactionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reactionCount: {
    marginLeft: 4,
    color: '#65676b',
    fontSize: 13,
  },
  postStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statText: {
    color: '#65676b',
    fontSize: 13,
  },
  postDivider: {
    marginVertical: 8,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  actionText: {
    color: '#65676b',
    fontSize: 14,
    fontWeight: '600',
  },
  actionTextActive: {
    color: '#F44336',
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  groupAvatar: {
    backgroundColor: '#667eea',
  },
  groupHeaderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  groupTitle: {
    fontWeight: '700',
    color: '#1c1e21',
  },
  groupCreator: {
    color: '#65676b',
    fontSize: 13,
  },
  groupDescription: {
    color: '#1c1e21',
    lineHeight: 20,
    marginBottom: 16,
  },
  groupDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  groupDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  groupDetailText: {
    color: '#65676b',
    fontSize: 13,
  },
  groupButton: {
    backgroundColor: '#667eea',
  },
  openChip: {
    backgroundColor: '#4CAF50',
  },
  closedChip: {
    backgroundColor: '#F44336',
  },
  chipText: {
    color: '#fff',
    fontSize: 11,
  },
});
