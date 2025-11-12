/**
 * Validation utilities for community module forms
 */

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface PostValidationData {
  caption?: string;
  mediaUrls?: string[];
  locationId?: string;
  customCountry?: string;
  customState?: string;
  customArea?: string;
}

export interface CommentValidationData {
  text: string;
}

export interface ProfileValidationData {
  name?: string;
  bio?: string;
}

/**
 * Validate post creation data
 */
export function validatePost(data: PostValidationData): ValidationResult {
  const errors: Record<string, string> = {};

  // Caption validation
  if (data.caption) {
    const trimmedCaption = data.caption.trim();
    if (trimmedCaption.length > 2000) {
      errors.caption = 'Caption must be 2000 characters or less';
    }
  }

  // Location validation - at least one location field required
  const hasLocation = data.locationId || data.customCountry || data.customState || data.customArea;
  if (!hasLocation) {
    errors.location = 'Please select or enter a location';
  }

  // Custom location validation
  if (data.customCountry && data.customCountry.length > 100) {
    errors.customCountry = 'Country name must be 100 characters or less';
  }
  if (data.customState && data.customState.length > 100) {
    errors.customState = 'State/region name must be 100 characters or less';
  }
  if (data.customArea && data.customArea.length > 100) {
    errors.customArea = 'Area name must be 100 characters or less';
  }

  // Media validation
  if (!data.mediaUrls || data.mediaUrls.length === 0) {
    errors.media = 'Please add at least one photo or video';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate comment data
 */
export function validateComment(data: CommentValidationData): ValidationResult {
  const errors: Record<string, string> = {};

  const trimmedText = data.text.trim();

  if (!trimmedText) {
    errors.text = 'Comment cannot be empty';
  } else if (trimmedText.length > 500) {
    errors.text = 'Comment must be 500 characters or less';
  } else if (trimmedText.length < 1) {
    errors.text = 'Comment must be at least 1 character';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate profile update data
 */
export function validateProfile(data: ProfileValidationData): ValidationResult {
  const errors: Record<string, string> = {};

  // Name validation
  if (data.name !== undefined) {
    const trimmedName = data.name.trim();
    if (!trimmedName) {
      errors.name = 'Name cannot be empty';
    } else if (trimmedName.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    } else if (trimmedName.length > 50) {
      errors.name = 'Name must be 50 characters or less';
    }
  }

  // Bio validation
  if (data.bio !== undefined && data.bio.trim().length > 500) {
    errors.bio = 'Bio must be 500 characters or less';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate report data
 */
export function validateReport(category: string, reason?: string): ValidationResult {
  const errors: Record<string, string> = {};

  const validCategories = ['spam', 'harassment', 'inappropriate', 'other'];
  if (!validCategories.includes(category)) {
    errors.category = 'Please select a valid report category';
  }

  if (reason && reason.trim().length > 500) {
    errors.reason = 'Reason must be 500 characters or less';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Sanitize text input by trimming and removing excessive whitespace
 */
export function sanitizeText(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

/**
 * Check if a string contains only whitespace
 */
export function isEmptyOrWhitespace(text: string): boolean {
  return !text || text.trim().length === 0;
}
