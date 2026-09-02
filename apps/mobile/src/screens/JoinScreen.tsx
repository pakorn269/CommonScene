import React, { useState } from 'react';
import { AVATARS } from '@commonscene/ui-tokens';

export interface JoinScreenProps {
    initialCode?: string;
    onJoin: (roomCode: string, displayName: string, avatarId: string) => Promise<void>;
}

export const JoinScreen: React.FC<JoinScreenProps> = ({
    initialCode = '',
    onJoin,
}) => {
    const [code, setCode] = useState(initialCode);
    const [name, setName] = useState('');
    const [avatarId, setAvatarId] = useState('avatar-1');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const cleanCode = code.trim().toUpperCase();
        const cleanName = name.trim();

        if (cleanCode.length !== 4) {
            setError('Room code must be exactly 4 letters.');
            return;
        }
        if (!cleanName) {
            setError('Please enter a nickname.');
            return;
        }

        setLoading(true);
        try {
            await onJoin(cleanCode, cleanName, avatarId);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to join room.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card">
            <h1 className="header-title">CommonScene</h1>
            <p className="header-subtitle">
                Join your group session on the TV and find a movie everyone loves.
            </p>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 20 }}>
                    <label className="input-label" htmlFor="room-code">
                        Room Code
                    </label>
                    <input
                        id="room-code"
                        className="input-text input-code"
                        type="text"
                        maxLength={4}
                        placeholder="CODE"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        autoFocus={!initialCode}
                    />
                </div>

                <div style={{ marginBottom: 20 }}>
                    <label className="input-label" htmlFor="nickname">
                        Your Nickname
                    </label>
                    <input
                        id="nickname"
                        className="input-text"
                        type="text"
                        maxLength={20}
                        placeholder="e.g. Alex"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoFocus={Boolean(initialCode)}
                    />
                </div>

                <div style={{ marginBottom: 24 }}>
                    <label className="input-label">Pick an Avatar</label>
                    <div className="avatar-grid">
                        {AVATARS.map((av) => (
                            <button
                                key={av.id}
                                type="button"
                                className={`avatar-item ${avatarId === av.id ? 'selected' : ''}`}
                                style={{ backgroundColor: av.bg }}
                                onClick={() => setAvatarId(av.id)}
                                aria-label={av.label}
                            >
                                {av.emoji}
                            </button>
                        ))}
                    </div>
                </div>

                {error && (
                    <div
                        style={{
                            color: '#FCA5A5',
                            backgroundColor: 'rgba(239, 68, 68, 0.15)',
                            padding: '10px 14px',
                            borderRadius: 8,
                            fontSize: '0.875rem',
                            marginBottom: 16,
                        }}
                    >
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading || code.length !== 4 || !name.trim()}
                >
                    {loading ? 'Joining Room...' : 'Join Group'}
                </button>
            </form>
        </div>
    );
};
