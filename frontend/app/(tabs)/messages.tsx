import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  RefreshControl,
} from 'react-native';
import { Text, Avatar, ActivityIndicator, Searchbar, Badge } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { messagingService, Conversation } from '../../src/services/messagingService';
import { useAuth } from '../../src/contexts/AuthContext';

export default function MessagesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 1024;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [chatRequests, setChatRequests] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [conversationsData, requestsData] = await Promise.all([
        messagingService.getConversations(),
        messagingService.getChatRequests(),
      ]);
      setConversations(conversationsData);
      setChatRequests(requestsData);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ago`;
    } else if (hours > 0) {
      return `${hours}h ago`;
    } else {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes}m ago`;
    }
  };

  const renderConversation = ({ item }: { item: Conversation }) => {
    const initials = item.otherUser.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);

    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => router.push(`/chat?conversationId=${item.id}&userId=${item.otherUser.id}&name=${item.otherUser.name}`)}
      >
        {item.otherUser.avatar ? (
          <Avatar.Image size={56} source={{ uri: item.otherUser.avatar }} />
        ) : (
          <Avatar.Text size={56} label={initials} style={styles.avatar} />
        )}
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={styles.userName}>{item.otherUser.name}</Text>
            {item.lastMessage && (
              <Text style={styles.time}>{formatTime(item.lastMessage.createdAt)}</Text>
            )}
          </View>
          {item.lastMessage && (
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.lastMessage.senderId === user?.userId ? 'You: ' : ''}
              {item.lastMessage.text}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderChatRequest = ({ item }: { item: any }) => {
    const initials = item.sender.profile.name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);

    return (
      <View style={styles.requestItem}>
        {item.sender.profile.avatar ? (
          <Avatar.Image size={48} source={{ uri: item.sender.profile.avatar }} />
        ) : (
          <Avatar.Text size={48} label={initials} style={styles.avatar} />
        )}
        <View style={styles.requestContent}>
          <Text style={styles.requestName}>{item.sender.profile.name}</Text>
          <Text style={styles.requestText}>wants to chat with you</Text>
        </View>
        <View style={styles.requestActions}>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={async () => {
              try {
                await messagingService.approveChatRequest(item.id);
                await loadData();
              } catch (error) {
                console.error('Error approving request:', error);
              }
            }}
          >
            <MaterialCommunityIcons name="check" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={async () => {
              try {
                await messagingService.rejectChatRequest(item.id);
                await loadData();
              } catch (error) {
                console.error('Error rejecting request:', error);
              }
            }}
          >
            <MaterialCommunityIcons name="close" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        {chatRequests.length > 0 && (
          <Badge style={styles.badge}>{chatRequests.length}</Badge>
        )}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search conversations"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      {/* Chat Requests */}
      {chatRequests.length > 0 && (
        <View style={styles.requestsSection}>
          <Text style={styles.sectionTitle}>Chat Requests</Text>
          <FlatList
            data={chatRequests}
            renderItem={renderChatRequest}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>
      )}

      {/* Conversations */}
      <FlatList
        data={filteredConversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="message-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No conversations yet</Text>
            <Text style={styles.emptySubtext}>Start chatting with other travelers!</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  badge: {
    backgroundColor: '#FF6B6B',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  searchBar: {
    elevation: 0,
    backgroundColor: '#f3f4f6',
  },
  requestsSection: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#667eea',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  requestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f9fafb',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  requestContent: {
    flex: 1,
    marginLeft: 12,
  },
  requestName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  requestText: {
    fontSize: 12,
    color: '#6b7280',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    backgroundColor: '#10b981',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: '#ef4444',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingVertical: 8,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  avatar: {
    backgroundColor: '#667eea',
  },
  conversationContent: {
    flex: 1,
    marginLeft: 12,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  time: {
    fontSize: 12,
    color: '#9ca3af',
  },
  lastMessage: {
    fontSize: 14,
    color: '#6b7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
});
