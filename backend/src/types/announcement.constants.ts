// Announcement system constants

export const ANNOUNCEMENT_CONSTANTS = {
  // Pagination defaults
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,

  // Content limits
  MAX_TITLE_LENGTH: 200,
  MAX_CONTENT_LENGTH: 10000,

  // Cache TTL (in seconds)
  CACHE_TTL: {
    PUBLISHED_ANNOUNCEMENTS: 300, // 5 minutes
    UNREAD_COUNT: 60, // 1 minute
    ANALYTICS: 1800, // 30 minutes
  },

  // Priority weights for sorting
  PRIORITY_WEIGHTS: {
    urgent: 4,
    high: 3,
    normal: 2,
    low: 1,
  },

  // Notification settings
  NOTIFICATION: {
    PREVIEW_LENGTH: 100,
    BATCH_SIZE: 100,
    RETRY_ATTEMPTS: 3,
  },

  // Analytics
  ANALYTICS: {
    DATE_FORMAT: 'YYYY-MM-DD',
    DEFAULT_DAYS: 30,
  },
} as const;

// Error codes
export const ANNOUNCEMENT_ERROR_CODES = {
  ANNOUNCEMENT_NOT_FOUND: 'ANNOUNCEMENT_NOT_FOUND',
  ANNOUNCEMENT_EXPIRED: 'ANNOUNCEMENT_EXPIRED',
  INVALID_PUBLISH_DATE: 'INVALID_PUBLISH_DATE',
  INVALID_EXPIRY_DATE: 'INVALID_EXPIRY_DATE',
  CANNOT_DELETE_PUBLISHED: 'CANNOT_DELETE_PUBLISHED',
  UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const;

// Status transitions
export const ALLOWED_STATUS_TRANSITIONS: Record<string, string[]> = {
  draft: ['published', 'deleted'],
  published: ['archived'],
  archived: ['published', 'deleted'],
  deleted: [], // Cannot transition from deleted
};

// Helper function for type-safe status transition checking
export function canTransitionTo(currentStatus: string, targetStatus: string): boolean {
  const allowedTransitions = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
  return allowedTransitions.includes(targetStatus);
}

// Cache keys
export const CACHE_KEYS = {
  PUBLISHED_ANNOUNCEMENTS: (filters: string) => `announcements:published:${filters}`,
  UNREAD_COUNT: (userId: string) => `announcements:unread:${userId}`,
  ANNOUNCEMENT_DETAIL: (id: string) => `announcements:detail:${id}`,
  ANALYTICS: (id: string) => `announcements:analytics:${id}`,
} as const;