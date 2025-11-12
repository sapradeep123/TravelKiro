import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Platform } from 'react-native';
import { Avatar, IconButton, Menu, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { UserProfile } from '../../src/services/communityService';
import { communityTheme, responsiveUtils } from '../../src/theme';

interface ProfileHeaderProps {
  profile: UserProfile;
  isOwnProfile: boolean;
  onFollowPress: () => void;
  onEditPress?: () => void;
  onBlockPress?: () => void;
  onMutePress?: () => void;
  onUnblockPress?: () => void;
  onUnmutePress?: () => void;
}

export default function ProfileHeader({
  profile,
  isOwnProfile,
  onFollowPress,
  onEditPress,
  onBlockPress,
  onMutePress,
  onUnblockPress,
  onUnmutePress,
}: ProfileHeaderProps) {
  const [menuVisible, setMenuVisible] = useState(false);

  const handleMenuAction = (action: 'block' | 'mute' | 'unblock' | 'unmute') => {
    setMenuVisible(false);
    
    if (action === 'block' && onBlockPress) {
      Alert.alert(
        'Block User',
        `Are you sure you want to block ${profile.name}? You won't see each other's content.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Block', style: 'destructive', onPress: onBlockPress },
        ]
      );
    } else if (action === 'mute' && onMutePress) {
      Alert.alert(
        'Mute User',
        `Are you sure you want to mute ${profile.name}? You won't see their posts in your feed.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Mute', onPress: onMutePress },
        ]
      );
    } else if (action === 'unblock' && onUnblockPress) {
      onUnblockPress();
    } else if (action === 'unmute' && onUnmutePress) {
      onUnmutePress();
    }
  };

  const getFollowButtonLabel = () => {
    if (profile.isFollowing) return 'Following';
    if (profile.hasRequestedFollow) return 'Requested';
    return 'Follow';
  };

  const getFollowButtonIcon = () => {
    if (profile.isFollowing) return 'account-check';
    if (profile.hasRequestedFollow) return 'clock-outline';
    return 'account-plus';
  };

  return (
    <View style={styles.container}>
      {/* Avatar and Stats */}
      <View style={styles.topSection}>
        <View style={styles.avatarContainer}>
          {profile.avatar ? (
            <Avatar.Image size={100} source={{ uri: profile.avatar }} />
          ) : (
            <Avatar.Text
              size={100}
              label={profile.name.substring(0, 2).toUpperCase()}
              style={styles.avatar}
            />
          )}
          {profile.isPrivate && (
            <View style={styles.privateBadge}>
              <MaterialCommunityIcons name="lock" size={16} color="#fff" />
            </View>
          )}
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.postCount}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.followerCount}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.followingCount}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>
      </View>

      {/* Name and Bio */}
      <View style={styles.infoSection}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{profile.name}</Text>
          {profile.isPrivate && (
            <MaterialCommunityIcons name="lock" size={16} color="#65676b" />
          )}
        </View>
        {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        {isOwnProfile ? (
          <Button
            mode="outlined"
            onPress={onEditPress}
            icon="pencil"
            style={styles.editButton}
            labelStyle={styles.editButtonLabel}
          >
            Edit Profile
          </Button>
        ) : (
          <>
            <Button
              mode={profile.isFollowing ? 'outlined' : 'contained'}
              onPress={onFollowPress}
              icon={getFollowButtonIcon()}
              style={[
                styles.followButton,
                profile.isFollowing && styles.followingButton,
              ]}
              labelStyle={styles.followButtonLabel}
              disabled={profile.isBlocked}
            >
              {getFollowButtonLabel()}
            </Button>

            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  size={24}
                  onPress={() => setMenuVisible(true)}
                  style={styles.menuButton}
                />
              }
            >
              {profile.isBlocked ? (
                <Menu.Item
                  onPress={() => handleMenuAction('unblock')}
                  title="Unblock User"
                  leadingIcon="account-check"
                />
              ) : (
                <>
                  {profile.isMuted ? (
                    <Menu.Item
                      onPress={() => handleMenuAction('unmute')}
                      title="Unmute User"
                      leadingIcon="volume-high"
                    />
                  ) : (
                    <Menu.Item
                      onPress={() => handleMenuAction('mute')}
                      title="Mute User"
                      leadingIcon="volume-off"
                    />
                  )}
                  <Menu.Item
                    onPress={() => handleMenuAction('block')}
                    title="Block User"
                    leadingIcon="block-helper"
                  />
                </>
              )}
            </Menu>
          </>
        )}
      </View>

      {/* Blocked/Muted Indicator */}
      {profile.isBlocked && (
        <View style={styles.statusBanner}>
          <MaterialCommunityIcons name="block-helper" size={16} color="#F44336" />
          <Text style={styles.statusText}>You have blocked this user</Text>
        </View>
      )}
      {profile.isMuted && !profile.isBlocked && (
        <View style={[styles.statusBanner, styles.mutedBanner]}>
          <MaterialCommunityIcons name="volume-off" size={16} color="#FF9800" />
          <Text style={[styles.statusText, styles.mutedText]}>You have muted this user</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: communityTheme.colors.surface,
    padding: communityTheme.responsive({
      mobile: communityTheme.spacing.base,
      tablet: communityTheme.spacing.xl,
      desktop: communityTheme.spacing.xxl,
    }),
    borderBottomWidth: 1,
    borderBottomColor: communityTheme.colors.border,
  },
  topSection: {
    flexDirection: communityTheme.responsive({
      mobile: 'row',
      tablet: 'row',
      desktop: 'row',
    }) as any,
    alignItems: 'center',
    marginBottom: communityTheme.spacing.base,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: communityTheme.responsive({
      mobile: communityTheme.spacing.xl,
      tablet: communityTheme.spacing.xxl,
      desktop: communityTheme.spacing.xxl,
    }),
  },
  avatar: {
    backgroundColor: communityTheme.colors.primary,
  },
  privateBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: communityTheme.colors.primary,
    borderRadius: communityTheme.borderRadius.md,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: communityTheme.colors.surface,
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: communityTheme.responsive({
      mobile: communityTheme.typography.fontSize.xxl,
      tablet: communityTheme.typography.fontSize.xxxl,
      desktop: communityTheme.typography.fontSize.xxxl,
    }),
    fontWeight: communityTheme.typography.fontWeight.bold,
    color: communityTheme.colors.text,
    marginBottom: communityTheme.spacing.xs,
  },
  statLabel: {
    fontSize: communityTheme.typography.fontSize.sm,
    color: communityTheme.colors.textSecondary,
  },
  infoSection: {
    marginBottom: communityTheme.spacing.base,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: communityTheme.spacing.sm,
    marginBottom: communityTheme.spacing.xs,
  },
  name: {
    fontSize: communityTheme.responsive({
      mobile: communityTheme.typography.fontSize.xl,
      tablet: communityTheme.typography.fontSize.xxl,
      desktop: communityTheme.typography.fontSize.xxl,
    }),
    fontWeight: communityTheme.typography.fontWeight.bold,
    color: communityTheme.colors.text,
  },
  bio: {
    fontSize: communityTheme.typography.fontSize.base,
    lineHeight: 20,
    color: communityTheme.colors.text,
  },
  actionSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: communityTheme.spacing.sm,
  },
  editButton: {
    flex: 1,
    borderColor: communityTheme.colors.borderDark,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
        ':hover': {
          backgroundColor: communityTheme.colors.surfaceVariant,
        },
      },
    }),
  },
  editButtonLabel: {
    fontSize: communityTheme.typography.fontSize.base,
    fontWeight: communityTheme.typography.fontWeight.semibold,
  },
  followButton: {
    flex: 1,
    backgroundColor: communityTheme.colors.primary,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'background-color 0.2s ease, transform 0.1s ease',
        ':hover': {
          backgroundColor: communityTheme.colors.primaryDark,
        },
        ':active': {
          transform: 'scale(0.98)',
        },
      },
    }),
  },
  followingButton: {
    backgroundColor: communityTheme.colors.transparent,
    borderColor: communityTheme.colors.borderDark,
  },
  followButtonLabel: {
    fontSize: communityTheme.typography.fontSize.base,
    fontWeight: communityTheme.typography.fontWeight.semibold,
  },
  menuButton: {
    margin: 0,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: communityTheme.spacing.sm,
    marginTop: communityTheme.spacing.md,
    padding: communityTheme.spacing.md,
    backgroundColor: '#FEE2E2',
    borderRadius: communityTheme.borderRadius.base,
  },
  mutedBanner: {
    backgroundColor: '#FFF3E0',
  },
  statusText: {
    fontSize: communityTheme.typography.fontSize.sm,
    color: communityTheme.colors.error,
    fontWeight: communityTheme.typography.fontWeight.medium,
  },
  mutedText: {
    color: communityTheme.colors.warning,
  },
});
