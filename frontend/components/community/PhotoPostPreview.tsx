import React, { useState } from 'react';
import { View, StyleSheet, Image, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { Button, Text, Card, ProgressBar, Avatar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SelectedImage } from './ImagePickerSection';
import { Location } from '../../src/types';

interface PhotoPostPreviewProps {
  images: SelectedImage[];
  caption: string;
  location: Location | null;
  userName: string;
  userAvatar?: string;
  onEdit: () => void;
  onSubmit: () => void;
  uploading: boolean;
  uploadProgress: number;
}

const { width: screenWidth } = Dimensions.get('window');
const modalWidth = Math.min(screenWidth - 32, 600); // Max 600px width
const imageHeight = 400; // Fixed height for better control

export default function PhotoPostPreview({
  images,
  caption,
  location,
  userName,
  userAvatar,
  onEdit,
  onSubmit,
  uploading,
  uploadProgress,
}: PhotoPostPreviewProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const formatLocationDisplay = (loc: Location): string => {
    return `${loc.area}, ${loc.state}, ${loc.country}`;
  };

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / modalWidth);
    setCurrentImageIndex(index);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={true}>
      <View style={styles.content}>
        {/* Post Card Preview */}
        <Card style={styles.postCard}>
          {/* Post Header */}
          <View style={styles.postHeader}>
            <View style={styles.postUserInfo}>
              {userAvatar ? (
                <Avatar.Image size={48} source={{ uri: userAvatar }} />
              ) : (
                <Avatar.Text
                  size={48}
                  label={userName.substring(0, 2).toUpperCase()}
                  style={styles.postAvatar}
                />
              )}
              <View style={styles.postUserDetails}>
                <Text style={styles.postUserName}>{userName}</Text>
                <Text style={styles.postTimestamp}>Just now</Text>
              </View>
            </View>
          </View>

          {/* Caption */}
          {caption && (
            <View style={styles.captionContainer}>
              <Text style={styles.captionText}>{caption}</Text>
            </View>
          )}

          {/* Images Carousel */}
          {images.length > 0 && (
            <View style={styles.imageCarouselContainer}>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                style={styles.imageCarousel}
              >
                {images.map((image, index) => (
                  <Image
                    key={`${image.uri}-${index}`}
                    source={{ uri: image.uri }}
                    style={styles.carouselImage}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>

              {/* Image Counter */}
              {images.length > 1 && (
                <View style={styles.imageCounter}>
                  <Text style={styles.imageCounterText}>
                    {currentImageIndex + 1}/{images.length}
                  </Text>
                </View>
              )}

              {/* Pagination Dots */}
              {images.length > 1 && (
                <View style={styles.paginationDots}>
                  {images.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.dot,
                        index === currentImageIndex && styles.dotActive,
                      ]}
                    />
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Location Tag */}
          {location && (
            <View style={styles.locationContainer}>
              <MaterialCommunityIcons name="map-marker" size={16} color="#667eea" />
              <Text style={styles.locationText}>{formatLocationDisplay(location)}</Text>
            </View>
          )}

          {/* Post Actions Preview */}
          <View style={styles.postActions}>
            <View style={styles.postAction}>
              <MaterialCommunityIcons name="heart-outline" size={20} color="#666" />
              <Text style={styles.actionText}>React</Text>
            </View>
            <View style={styles.postAction}>
              <MaterialCommunityIcons name="comment-outline" size={20} color="#666" />
              <Text style={styles.actionText}>Comment</Text>
            </View>
            <View style={styles.postAction}>
              <MaterialCommunityIcons name="share-outline" size={20} color="#666" />
              <Text style={styles.actionText}>Share</Text>
            </View>
          </View>
        </Card>

        {/* Upload Progress */}
        {uploading && (
          <View style={styles.uploadingContainer}>
            <ProgressBar progress={uploadProgress} color="#667eea" style={styles.progressBar} />
            <Text style={styles.uploadingText}>
              Uploading your post... {Math.round(uploadProgress * 100)}%
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 0,
  },
  postCard: {
    marginBottom: 0,
    backgroundColor: '#fff',
    elevation: 0,
    shadowOpacity: 0,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  postUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postAvatar: {
    backgroundColor: '#667eea',
  },
  postUserDetails: {
    marginLeft: 12,
  },
  postUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  postTimestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  captionContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  captionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  imageCarouselContainer: {
    position: 'relative',
  },
  imageCarousel: {
    width: '100%',
  },
  carouselImage: {
    width: modalWidth,
    height: imageHeight,
  },
  imageCounter: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  imageCounterText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ddd',
  },
  dotActive: {
    backgroundColor: '#667eea',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  locationText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    color: '#666',
  },
  uploadingContainer: {
    backgroundColor: '#f0f4ff',
    padding: 20,
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  uploadingText: {
    fontSize: 15,
    color: '#667eea',
    textAlign: 'center',
    fontWeight: '600',
  },
});
