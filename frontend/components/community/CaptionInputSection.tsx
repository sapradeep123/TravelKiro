import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Text, HelperText } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface CaptionInputSectionProps {
  caption: string;
  onCaptionChange: (text: string) => void;
  maxLength: number;
}

const CaptionInputSection = React.memo(function CaptionInputSection({
  caption,
  onCaptionChange,
  maxLength = 2000,
}: CaptionInputSectionProps) {
  const remainingChars = maxLength - caption.length;
  const isApproachingLimit = remainingChars <= 100;
  const isAtLimit = remainingChars <= 0;

  return (
    <View style={styles.container}>
      <TextInput
        mode="outlined"
        label="Caption (Optional)"
        placeholder="Share your travel story..."
        value={caption}
        onChangeText={onCaptionChange}
        multiline
        numberOfLines={4}
        maxLength={maxLength}
        style={styles.textInput}
        left={<TextInput.Icon icon="text" />}
      />
      
      {/* Character Counter */}
      <View style={styles.counterContainer}>
        <View style={styles.counterLeft}>
          <MaterialCommunityIcons 
            name={isAtLimit ? "alert-circle" : "information"} 
            size={16} 
            color={isAtLimit ? "#F44336" : isApproachingLimit ? "#FF9800" : "#999"} 
          />
          <Text 
            style={[
              styles.counterText,
              isApproachingLimit && styles.counterWarning,
              isAtLimit && styles.counterError
            ]}
          >
            {remainingChars} characters remaining
          </Text>
        </View>
        
        <Text 
          style={[
            styles.charCount,
            isApproachingLimit && styles.counterWarning,
            isAtLimit && styles.counterError
          ]}
        >
          {caption.length}/{maxLength}
        </Text>
      </View>

      {/* Helper Text */}
      {isApproachingLimit && !isAtLimit && (
        <HelperText type="info" visible={true} style={styles.helperWarning}>
          You're approaching the character limit
        </HelperText>
      )}
      
      {isAtLimit && (
        <HelperText type="error" visible={true} style={styles.helperError}>
          Maximum character limit reached
        </HelperText>
      )}
      
      {!isApproachingLimit && caption.length === 0 && (
        <HelperText type="info" visible={true} style={styles.helperInfo}>
          Add a caption to share your thoughts and experiences
        </HelperText>
      )}
    </View>
  );
});

export default CaptionInputSection;

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  textInput: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  counterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  counterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  counterText: {
    fontSize: 12,
    color: '#999',
  },
  counterWarning: {
    color: '#FF9800',
    fontWeight: '600',
  },
  counterError: {
    color: '#F44336',
    fontWeight: '600',
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },
  helperInfo: {
    fontSize: 12,
    color: '#999',
  },
  helperWarning: {
    fontSize: 12,
    color: '#FF9800',
  },
  helperError: {
    fontSize: 12,
    color: '#F44336',
  },
});
