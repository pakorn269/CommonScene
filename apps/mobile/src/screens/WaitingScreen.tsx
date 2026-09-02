import React from 'react';
import type { Participant } from '@commonscene/contracts';
import { AVATARS } from '@commonscene/ui-tokens';

export interface WaitingScreenProps {
  roomCode: string;
  participants: Participant[];
  onEditPreferences: () => void;
}

export const WaitingScreen: React.FC<WaitingScreenProps> = ({
  roomCode,
  participants,
  onEditPreferences,
}) => {
  const submittedCount = participants.filter((p) => p.hasSubmittedPreferences).length;

  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          color: '#10B981',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          margin: '0 auto 16px auto',
        }}
      >
        ✓
      </div>

      <h1 className="header-title" style={{ fontSize: '1.5rem' }}>
        Preferences Submitted!
      </h1>
      <p className="header-subtitle">
        Look at the TV screen. When everyone is ready, the host will start the recommendation
        engine.
      </p>

      <div
        style={{
          backgroundColor: 'var(--surface-subtle)',
          borderRadius: 12,
          padding: '16px',
          marginBottom: 24,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#E2E8F0' }}>
            Group Members ({submittedCount}/{participants.length} Ready)
          </span>
          <span className="badge" style={{ backgroundColor: '#2C3A54', color: '#94A3B8' }}>
            {roomCode}
          </span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
          {participants.map((p) => {
            const avatar = AVATARS.find((a) => a.id === p.avatarId) ?? AVATARS[0];
            return (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: 'var(--surface-elevated)',
                  padding: '6px 12px',
                  borderRadius: 20,
                  border: p.hasSubmittedPreferences
                    ? '1px solid #10B981'
                    : '1px solid var(--border)',
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>{avatar.emoji}</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{p.displayName}</span>
                {p.hasSubmittedPreferences && (
                  <span style={{ color: '#10B981', fontSize: '0.75rem' }}>✓</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <button type="button" className="btn-secondary" onClick={onEditPreferences}>
        Edit My Preferences
      </button>
    </div>
  );
};
