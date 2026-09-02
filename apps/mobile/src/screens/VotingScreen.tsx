import React, { useState } from 'react';
import type { RankedMovie } from '@commonscene/contracts';
import { getMovieById } from '@commonscene/catalog';
import { RATING_BADGES } from '@commonscene/ui-tokens';

export interface VotingScreenProps {
  roomCode: string;
  recommendations: RankedMovie[];
  myVoteMovieId?: string | null;
  onVote: (movieId: string) => Promise<void>;
}

export const VotingScreen: React.FC<VotingScreenProps> = ({
  roomCode,
  recommendations,
  myVoteMovieId,
  onVote,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(myVoteMovieId ?? null);
  const [submitting, setSubmitting] = useState(false);

  const handleVote = async (movieId: string) => {
    setSelectedId(movieId);
    setSubmitting(true);
    try {
      await onVote(movieId);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="header-title" style={{ fontSize: '1.4rem', margin: 0 }}>
            Cast Your Vote
          </h1>
          <span className="badge" style={{ backgroundColor: '#2C3A54', color: '#94A3B8' }}>
            Room: {roomCode}
          </span>
        </div>
        <p className="header-subtitle" style={{ margin: '8px 0 0 0' }}>
          Vote for your favorite option below to help choose tonight&apos;s movie.
        </p>
      </div>

      {recommendations.map((rec, index) => {
        const movie = getMovieById(rec.movieId);
        if (!movie) return null;

        const isVoted = selectedId === movie.id;
        const ratingBadge = RATING_BADGES[movie.contentRating];
        const matchPct = Math.round(rec.score * 100);

        return (
          <div key={movie.id} className={`candidate-card ${isVoted ? 'voted' : ''}`}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 8,
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    color: '#F59E0B',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Option {index + 1} • {matchPct}% Match
                </span>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '2px 0 4px 0' }}>
                  {movie.title}
                </h2>
              </div>
              <span
                className="badge"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: ratingBadge.color,
                  border: `1px solid ${ratingBadge.color}`,
                }}
              >
                {movie.contentRating}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                gap: 8,
                fontSize: '0.8rem',
                color: '#94A3B8',
                marginBottom: 10,
              }}
            >
              <span>{movie.runtimeMinutes} min</span>
              <span>•</span>
              <span>{movie.genres.join(', ')}</span>
            </div>

            <p
              style={{ fontSize: '0.875rem', color: '#CBD5E1', lineHeight: 1.4, marginBottom: 12 }}
            >
              {movie.synopsis}
            </p>

            <div
              style={{
                fontSize: '0.8rem',
                backgroundColor: 'var(--surface-subtle)',
                padding: '8px 12px',
                borderRadius: 8,
                color: '#94A3B8',
                marginBottom: 14,
              }}
            >
              💡 {rec.explanation}
            </div>

            <button
              type="button"
              className={isVoted ? 'btn-primary' : 'btn-secondary'}
              style={{
                backgroundColor: isVoted ? '#10B981' : undefined,
                borderColor: isVoted ? '#10B981' : undefined,
              }}
              disabled={submitting}
              onClick={() => handleVote(movie.id)}
            >
              {isVoted ? '✓ Your Vote Cast' : `Vote for ${movie.title}`}
            </button>
          </div>
        );
      })}
    </div>
  );
};
