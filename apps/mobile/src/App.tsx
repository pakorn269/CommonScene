import React, { useState, useCallback } from 'react';
import type {
    Participant,
    RankedMovie,
    Movie,
    WsServerEvent,
    SubmitPreferencesRequest,
} from '@commonscene/contracts';
import { JoinScreen } from './screens/JoinScreen.js';
import { PreferencesScreen } from './screens/PreferencesScreen.js';
import { WaitingScreen } from './screens/WaitingScreen.js';
import { VotingScreen } from './screens/VotingScreen.js';
import { WinnerScreen } from './screens/WinnerScreen.js';
import { useRoomWebSocket } from './hooks/useRoomWebSocket.js';
import { joinRoom, submitPreferences, submitVote } from './api.js';

type AppStep = 'join' | 'preferences' | 'waiting' | 'voting' | 'winner';

export const App: React.FC = () => {
    // URL query param for QR codes (e.g. https://domain.com/?code=ROOM)
    const urlParams = new URLSearchParams(window.location.search);
    const initialCode = urlParams.get('code') ?? '';

    const [step, setStep] = useState<AppStep>('join');
    const [roomCode, setRoomCode] = useState(initialCode);
    const [participantId, setParticipantId] = useState<string | null>(null);
    const [displayName, setDisplayName] = useState('');
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [recommendations, setRecommendations] = useState<RankedMovie[]>([]);
    const [winningMovie, setWinningMovie] = useState<Movie | null>(null);
    const [myVoteMovieId, setMyVoteMovieId] = useState<string | null>(null);

    // WebSocket event handler
    const handleWsEvent = useCallback((event: WsServerEvent) => {
        switch (event.type) {
            case 'room.snapshot':
                setParticipants(event.participants);
                if (event.recommendations && event.recommendations.length > 0) {
                    setRecommendations(event.recommendations);
                    if (event.room.status === 'voting') {
                        setStep('voting');
                    }
                }
                break;

            case 'participant.joined':
                setParticipants((prev) => {
                    if (prev.some((p) => p.id === event.participant.id)) return prev;
                    return [...prev, event.participant];
                });
                break;

            case 'preferences.submitted':
                setParticipants((prev) =>
                    prev.map((p) =>
                        p.id === event.participantId
                            ? { ...p, hasSubmittedPreferences: true }
                            : p
                    )
                );
                break;

            case 'recommendations.ready':
                setRecommendations(event.result.recommendations);
                setStep('voting');
                break;

            case 'room.completed':
                setWinningMovie(event.winningMovie);
                setStep('winner');
                break;

            default:
                break;
        }
    }, []);

    // WebSocket connection hook
    const { isConnected } = useRoomWebSocket({
        roomCode: participantId ? roomCode : null,
        onEvent: handleWsEvent,
    });

    // 1. Join Action
    const handleJoin = async (code: string, name: string, avatar: string) => {
        const res = await joinRoom(code, name, avatar);
        setRoomCode(code);
        setDisplayName(name);
        setParticipantId(res.participant.id);
        setParticipants(res.participants);
        setStep('preferences');
    };

    // 2. Submit Preferences Action
    const handleSubmitPreferences = async (prefs: SubmitPreferencesRequest) => {
        if (!participantId || !roomCode) return;
        await submitPreferences(roomCode, participantId, prefs);
        setStep('waiting');
    };

    // 3. Submit Vote Action
    const handleVote = async (movieId: string) => {
        if (!participantId || !roomCode) return;
        setMyVoteMovieId(movieId);
        await submitVote(roomCode, participantId, movieId);
    };

    // 4. Start New Action
    const handleStartNew = () => {
        setStep('join');
        setRoomCode('');
        setParticipantId(null);
        setDisplayName('');
        setParticipants([]);
        setRecommendations([]);
        setWinningMovie(null);
        setMyVoteMovieId(null);
    };

    return (
        <main>
            {step !== 'join' && (
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.8rem',
                        color: isConnected ? '#4ADE80' : '#FBBF24',
                        marginBottom: 12,
                        padding: '0 4px',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <img
                            src="/logo.png"
                            alt="Logo"
                            style={{ width: 22, height: 22, borderRadius: 6 }}
                        />
                        <span>● {isConnected ? 'Live Sync' : 'Connecting...'}</span>
                    </div>
                    <span style={{ color: '#94A3B8', fontWeight: 600 }}>{displayName}</span>
                </div>
            )}

            {step === 'join' && (
                <JoinScreen initialCode={initialCode} onJoin={handleJoin} />
            )}

            {step === 'preferences' && (
                <PreferencesScreen
                    roomCode={roomCode}
                    participantName={displayName}
                    onSubmit={handleSubmitPreferences}
                />
            )}

            {step === 'waiting' && (
                <WaitingScreen
                    roomCode={roomCode}
                    participants={participants}
                    onEditPreferences={() => setStep('preferences')}
                />
            )}

            {step === 'voting' && (
                <VotingScreen
                    roomCode={roomCode}
                    recommendations={recommendations}
                    myVoteMovieId={myVoteMovieId}
                    onVote={handleVote}
                />
            )}

            {step === 'winner' && winningMovie && (
                <WinnerScreen
                    roomCode={roomCode}
                    winningMovie={winningMovie}
                    onStartNew={handleStartNew}
                />
            )}
        </main>
    );
};
