export const IMAGE_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];
export const DOC_ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_DOC_SIZE = 10 * 1024 * 1024; // 10MB

export type FileBucket = 'public' | 'private';
export type MinioBucket = {
  PUBLIC: 'public';
  PRIVATE: 'private';
};
