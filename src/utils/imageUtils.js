/**
 * Validates and potentially resizes an image file before upload
 * @param {File} file - The image file to validate
 * @returns {Promise<{valid: boolean, file: File|null, message: string}>} - Validation result
 */
export const validateImage = async (file) => {
  // Check file type
  if (!file.type.match(/image\/(jpeg|jpg|png|gif)/i)) {
    return {
      valid: false,
      file: null,
      message: `Invalid file type: ${file.type}. Only JPEG, PNG and GIF are allowed.`
    };
  }
  
  // Check file size (5MB max)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      file: null,
      message: `File too large: ${file.name} (${(file.size/1024/1024).toFixed(2)}MB). Maximum size is 5MB.`
    };
  }
  
  return {
    valid: true,
    file: file,
    message: 'File is valid'
  };
};

/**
 * Creates a temporary preview URL for an image file
 * @param {File} file - The image file
 * @returns {string} - Object URL
 */
export const createImagePreview = (file) => {
  return URL.createObjectURL(file);
};

/**
 * Cleans up object URLs to prevent memory leaks
 * @param {string[]} urls - Array of object URLs to revoke
 */
export const revokeImagePreviews = (urls) => {
  urls.forEach(url => {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  });
};
