export type TimelineViewMode = 'timeline' | 'photos' | 'videos';

export type TimelinePreferences = {
  viewMode: TimelineViewMode;
  activeTag: string | null;
  activeMonth: string | null;
};

const favoritePostsStorageKey = 'moments.favorite-posts';
const timelinePreferencesStorageKey = 'moments.timeline-preferences';

const defaultPreferences: TimelinePreferences = {
  viewMode: 'timeline',
  activeTag: null,
  activeMonth: null,
};

const canUseStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const isViewMode = (value: unknown): value is TimelineViewMode =>
  value === 'timeline' || value === 'photos' || value === 'videos';

export const loadFavoritePostIds = () => {
  if (!canUseStorage()) {
    return [] as string[];
  }

  try {
    const raw = window.localStorage.getItem(favoritePostsStorageKey);
    if (!raw) {
      return [] as string[];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [] as string[];
  }
};

export const saveFavoritePostIds = (postIds: Iterable<string>) => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(favoritePostsStorageKey, JSON.stringify([...postIds]));
};

export const loadTimelinePreferences = (): TimelinePreferences => {
  if (!canUseStorage()) {
    return defaultPreferences;
  }

  try {
    const raw = window.localStorage.getItem(timelinePreferencesStorageKey);
    if (!raw) {
      return defaultPreferences;
    }

    const parsed = JSON.parse(raw) as Partial<TimelinePreferences>;
    return {
      viewMode: isViewMode(parsed.viewMode) ? parsed.viewMode : defaultPreferences.viewMode,
      activeTag: typeof parsed.activeTag === 'string' && parsed.activeTag ? parsed.activeTag : null,
      activeMonth: typeof parsed.activeMonth === 'string' && parsed.activeMonth ? parsed.activeMonth : null,
    };
  } catch {
    return defaultPreferences;
  }
};

export const saveTimelinePreferences = (preferences: TimelinePreferences) => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(timelinePreferencesStorageKey, JSON.stringify(preferences));
};
