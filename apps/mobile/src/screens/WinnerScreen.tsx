import React from 'react';
import type { Movie } from '@commonscene/contracts';
import { RATING_BADGES } from '@commonscene/ui-tokens';

export interface WinnerScreenProps {
  roomCode: string;
  winningMovie: Movie;
  onStartNew: () => void;
}

export const WinnerScreen: React.FC<WinnerScreenProps> = ({
  roomCode,
  winningMovie,
  onStartNew,
}) => {
  const ratingBadge = RATING_BADGES[winningMovie.contentRating];

  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
        <span className="badge" style={{ backgroundColor: '#2C3A54', color: '#94A3B8' }}>
          Room: {roomCode}
        </span>
      </div>
      <div style={{ fontSize: '3rem', marginBottom: 8 }}>🍿 🎉</div>
      <span
        style={{
          fontSize: '0.85rem',
          fontWeight: 800,
          color: '#F59E0B',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}
      >
        Tonight&apos;s Winner
      </span>

      <h1 className="header-title" style={{ fontSize: '1.75rem', marginTop: 4, marginBottom: 8 }}>
        {winningMovie.title}
      </h1>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 8,
          fontSize: '0.875rem',
          color: '#94A3B8',
          marginBottom: 16,
        }}
      >
        <span>{winningMovie.releaseYear}</span>
        <span>•</span>
        <span>{winningMovie.runtimeMinutes} min</span>
        <span>•</span>
        <span style={{ color: ratingBadge.color, fontWeight: 700 }}>
          {winningMovie.contentRating}
        </span>
      </div>

      <div
        style={{
          backgroundColor: 'var(--surface-subtle)',
          borderRadius: 12,
          padding: '16px',
          textAlign: 'left',
          marginBottom: 24,
        }}
      >
        <p style={{ fontSize: '0.9rem', color: '#E2E8F0', lineHeight: 1.5, marginBottom: 12 }}>
          {winningMovie.synopsis}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {winningMovie.genres.map((g) => (
            <span
              key={g}
              style={{
                fontSize: '0.75rem',
                backgroundColor: 'var(--surface-elevated)',
                padding: '4px 8px',
                borderRadius: 6,
                color: '#94A3B8',
              }}
            >
              {g}
            </span>
          ))}
        </div>
      </div>

      <p style={{ fontSize: '0.875rem', color: '#94A3B8', marginBottom: 20 }}>
        Enjoy the movie on your TV!
      </p>

      <button type="button" className="btn-secondary" onClick={onStartNew}>
        Join Another Room
      </button>
    </div>
  );
};
