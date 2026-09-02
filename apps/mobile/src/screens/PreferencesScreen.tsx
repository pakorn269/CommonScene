import React, { useState } from 'react';
import { GENRE_OPTIONS, MOOD_OPTIONS, RATING_BADGES } from '@commonscene/ui-tokens';
import type { ContentRating, SubmitPreferencesRequest } from '@commonscene/contracts';

export interface PreferencesScreenProps {
  roomCode: string;
  participantName: string;
  onSubmit: (preferences: SubmitPreferencesRequest) => Promise<void>;
}

export const PreferencesScreen: React.FC<PreferencesScreenProps> = ({
  roomCode,
  participantName,
  onSubmit,
}) => {
  const [preferredGenres, setPreferredGenres] = useState<string[]>([]);
  const [excludedGenres, setExcludedGenres] = useState<string[]>([]);
  const [moods, setMoods] = useState<string[]>([]);
  const [maxRuntime, setMaxRuntime] = useState<number | null>(120);
  const [maxRating, setMaxRating] = useState<ContentRating | null>('PG-13');
  const [avoidTags, setAvoidTags] = useState<string[]>([]);
  const [freeText, setFreeText] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleGenre = (genre: string) => {
    if (preferredGenres.includes(genre)) {
      // Move to excluded
      setPreferredGenres(preferredGenres.filter((g) => g !== genre));
      setExcludedGenres([...excludedGenres, genre]);
    } else if (excludedGenres.includes(genre)) {
      // Remove completely
      setExcludedGenres(excludedGenres.filter((g) => g !== genre));
    } else {
      // Add to preferred
      setPreferredGenres([...preferredGenres, genre]);
    }
  };

  const toggleMood = (mood: string) => {
    if (moods.includes(mood)) {
      setMoods(moods.filter((m) => m !== mood));
    } else {
      setMoods([...moods, mood]);
    }
  };

  const toggleAvoidTag = (tag: string) => {
    if (avoidTags.includes(tag)) {
      setAvoidTags(avoidTags.filter((t) => t !== tag));
    } else {
      setAvoidTags([...avoidTags, tag]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        preferredGenres,
        excludedGenres,
        moods,
        maximumRuntimeMinutes: maxRuntime,
        maximumContentRating: maxRating,
        avoidContentTags: avoidTags,
        freeText: freeText.trim() || null,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <h1 className="header-title" style={{ fontSize: '1.4rem', margin: 0 }}>
          Preferences
        </h1>
        <span className="badge" style={{ backgroundColor: '#2C3A54', color: '#94A3B8' }}>
          Room: {roomCode}
        </span>
      </div>
      <p className="header-subtitle" style={{ marginBottom: 20 }}>
        Hi {participantName}! Choose what you are in the mood for. Tap genres once for preferred,
        twice to exclude.
      </p>

      <form onSubmit={handleSubmit}>
        {/* 1. Genres */}
        <div style={{ marginBottom: 20 }}>
          <label className="input-label">Genres (Tap: Love, Tap again: Exclude)</label>
          <div className="chip-grid">
            {GENRE_OPTIONS.map((genre) => {
              const isSelected = preferredGenres.includes(genre);
              const isExcluded = excludedGenres.includes(genre);
              let chipClass = 'chip';
              if (isSelected) chipClass += ' selected';
              if (isExcluded) chipClass += ' excluded';

              return (
                <button
                  key={genre}
                  type="button"
                  className={chipClass}
                  onClick={() => toggleGenre(genre)}
                >
                  {isExcluded ? `✕ ${genre}` : genre}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Moods */}
        <div style={{ marginBottom: 20 }}>
          <label className="input-label">Mood & Vibe</label>
          <div className="chip-grid">
            {MOOD_OPTIONS.map((mood) => {
              const isSelected = moods.includes(mood);
              return (
                <button
                  key={mood}
                  type="button"
                  className={`chip ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleMood(mood)}
                >
                  {mood}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Runtime */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <label className="input-label" style={{ margin: 0 }}>
              Max Runtime
            </label>
            <span style={{ color: '#818CF8', fontWeight: 600, fontSize: '0.875rem' }}>
              {maxRuntime ? `${maxRuntime} min` : 'Any'}
            </span>
          </div>
          <input
            type="range"
            min="60"
            max="180"
            step="15"
            value={maxRuntime ?? 180}
            onChange={(e) => {
              const val = Number(e.target.value);
              setMaxRuntime(val >= 180 ? null : val);
            }}
            style={{ width: '100%', accentColor: '#6366F1' }}
          />
        </div>

        {/* 4. Content Rating */}
        <div style={{ marginBottom: 20 }}>
          <label className="input-label">Max Content Rating</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {(['G', 'PG', 'PG-13', 'R'] as ContentRating[]).map((r) => {
              const isSelected = maxRating === r;
              const badge = RATING_BADGES[r];
              return (
                <button
                  key={r}
                  type="button"
                  className="btn-secondary"
                  style={{
                    borderColor: isSelected ? badge.color : undefined,
                    backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.2)' : undefined,
                    color: isSelected ? '#FFFFFF' : '#94A3B8',
                    fontWeight: 700,
                    padding: '10px 4px',
                  }}
                  onClick={() => setMaxRating(r)}
                >
                  {r}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Avoid Tags */}
        <div style={{ marginBottom: 20 }}>
          <label className="input-label">Avoid Content</label>
          <div className="chip-grid">
            {['jump scares', 'gore', 'intense action', 'dark secrets'].map((tag) => {
              const isAvoided = avoidTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  className={`chip ${isAvoided ? 'excluded' : ''}`}
                  onClick={() => toggleAvoidTag(tag)}
                >
                  {isAvoided ? `🚫 ${tag}` : tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* 6. Free text notes */}
        <div style={{ marginBottom: 24 }}>
          <label className="input-label" htmlFor="freetext">
            Special Requests (Optional)
          </label>
          <input
            id="freetext"
            className="input-text"
            type="text"
            maxLength={280}
            placeholder="e.g. Something heartwarming for grandma"
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit to TV'}
        </button>
      </form>
    </div>
  );
};
