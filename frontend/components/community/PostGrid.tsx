import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Post } from '../../src/services/communityService';
import { communityTheme } from '../../src/theme';

interface PostGridProps {
  posts: Post[];
  loading?: boolean;
  onPostPress: (postId: string) => void;
  onEndReached?: () => void;
  ListFooterComponent?: React.ReactElement | null;
}

export default function PostGrid({
  posts,
  loading = false,
  onPostPress,
  onEndReached,
  ListFooterComponent,
}: PostGridProps) {
  const { width } = useWindowDimensions();

  // Calculate number of columns based on screen width using theme breakpoints
  const getNumColumns = () => {
    if (Platform.OS === 'web') {
      if (width >= communityTheme.breakpoints.wide) return 5; // Desktop large
      if (width >= communityTheme.breakpoints.desktop) return 4; // Desktop
      if (width >= communityTheme.breakpoints.tablet) return 4; // Tablet
    }
    return 3; // Mobile
  };

  const numColumns = getNumColumns();
  const spacing = communityTheme.spacing.xs / 2;
  const itemSize = (width - spacing * (numColumns + 1)) / numColumns;

  const renderPostItem = ({ item }: { item: Post }) => {
    const thumbnail = item.mediaUrls[0];
    const hasMultipleMedia = item.mediaUrls.length > 1;
    const hasVideo = item.mediaTypes.includes('VIDEO');

    return (
      <TouchableOpacity
        style={[styles.gridItem, { width: itemSize, height: itemSize }]}
        onPress={() => onPostPress(item.id)}
        activeOpacity={0.8}
      >
        {thumbnail ? (
          <>
            <Image
              source={{ uri: thumbnail }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
            {/* Overlay indicators */}
            <View style={styles.overlay}>
              {hasVideo && (
                <View style={styles.videoIndicator}>
                  <MaterialCommunityIcons name="play" size={24} color="#fff" />
                </View>
              )}
              {hasMultipleMedia && (
                <View style={styles.multipleIndicator}>
                  <MaterialCommunityIcons name="layers" size={18} color="#fff" />
                </View>
              )}
            </View>
            {/* Interaction stats overlay */}
            <View style={styles.statsOverlay}>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="heart" size={16} color="#fff" />
                <Text style={styles.statText}>{item.likeCount}</Text>
              </View>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="comment" size={16} color="#fff" />
                <Text style={styles.statText}>{item.commentCount}</Text>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.noMediaContainer}>
            <MaterialCommunityIcons name="image-off" size={32} color="#d1d5db" />
            <Text style={styles.captionPreview} numberOfLines={3}>
              {item.caption}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="grid-off" size={80} color="#d1d5db" />
      <Text style={styles.emptyStateTitle}>No posts yet</Text>
      <Text style={styles.emptyStateSubtitle}>
        Posts will appear here once they are shared
      </Text>
    </View>
  );

  return (
    <FlatList
      data={posts}
      renderItem={renderPostItem}
      keyExtractor={(item) => item.id}
      numColumns={numColumns}
      key={numColumns} // Force re-render when columns change
      contentContainerStyle={[
        styles.gridContainer,
        posts.length === 0 && styles.gridContainerEmpty,
      ]}
      columnWrapperStyle={styles.columnWrapper}
      ListEmptyComponent={!loading ? renderEmptyState : null}
      ListFooterComponent={ListFooterComponent}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    paddingTop: communityTheme.spacing.xs / 2,
  },
  gridContainerEmpty: {
    flexGrow: 1,
  },
  columnWrapper: {
    gap: communityTheme.spacing.xs / 2,
    marginBottom: communityTheme.spacing.xs / 2,
  },
  gridItem: {
    position: 'relative',
    backgroundColor: communityTheme.colors.surfaceVariant,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'transform 0.2s ease, opacity 0.2s ease',
        ':hover': {
          transform: 'scale(1.02)',
          opacity: 0.9,
        },
        ':active': {
          transform: 'scale(0.98)',
        },
      },
    }),
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  videoIndicator: {
    position: 'absolute',
    top: communityTheme.spacing.sm,
    right: communityTheme.spacing.sm,
    backgroundColor: communityTheme.colors.overlay,
    borderRadius: communityTheme.borderRadius.full,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  multipleIndicator: {
    position: 'absolute',
    top: communityTheme.spacing.sm,
    left: communityTheme.spacing.sm,
    backgroundColor: communityTheme.colors.overlay,
    borderRadius: communityTheme.borderRadius.lg,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: communityTheme.spacing.base,
    padding: communityTheme.spacing.sm,
    backgroundColor: communityTheme.colors.overlay,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: communityTheme.spacing.xs,
  },
  statText: {
    fontSize: communityTheme.typography.fontSize.sm,
    fontWeight: communityTheme.typography.fontWeight.semibold,
    color: communityTheme.colors.surface,
  },
  noMediaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: communityTheme.spacing.md,
    backgroundColor: communityTheme.colors.surfaceVariant,
  },
  captionPreview: {
    fontSize: communityTheme.typography.fontSize.xs,
    color: communityTheme.colors.textSecondary,
    textAlign: 'center',
    marginTop: communityTheme.spacing.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: communityTheme.spacing.xxl,
    paddingVertical: communityTheme.spacing.massive,
  },
  emptyStateTitle: {
    fontSize: communityTheme.typography.fontSize.xxl,
    fontWeight: communityTheme.typography.fontWeight.bold,
    color: communityTheme.colors.text,
    marginTop: communityTheme.spacing.xl,
    marginBottom: communityTheme.spacing.sm,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: communityTheme.typography.fontSize.base,
    color: communityTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
