/**
 * @commonscene/tv — Root TV Application Component.
 *
 * Implements the complete Fire TV user experience on Vega OS:
 * - Welcome screen with Create Room & Demo Mode
 * - D-pad directional navigation & focus indicators >=3px
 * - Realtime WebSocket synchronization with backend
 * - Back button navigation (BackHandler / Escape)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, BackHandler } from 'react-native';
import type {
  Room,
  Participant,
  RankedMovie,
  Vote,
  Movie,
  WsServerEvent,
} from '@commonscene/contracts';
import { WelcomeScreen } from './screens/WelcomeScreen.js';
import { LobbyScreen } from './screens/LobbyScreen.js';
import { CollectingPreferencesScreen } from './screens/CollectingPreferencesScreen.js';
import { RankingProgressScreen } from './screens/RankingProgressScreen.js';
import { RecommendationResultsScreen } from './screens/RecommendationResultsScreen.js';
import { FinalVotingScreen } from './screens/FinalVotingScreen.js';
import { WinnerScreen } from './screens/WinnerScreen.js';
import { DemoModeScreen } from './screens/DemoModeScreen.js';
import { ErrorScreen } from './screens/ErrorScreen.js';
import { useTVRoomWebSocket } from './hooks/useTVRoomWebSocket.js';
import { createRoom, triggerRanking, finalizeRoom } from './api.js';
import { COLORS } from '@commonscene/ui-tokens';

type TVStep =
  | 'welcome'
  | 'lobby'
  | 'collecting'
  | 'ranking'
  | 'results'
  | 'voting'
  | 'winner'
  | 'demo'
  | 'error';

export const App: React.FC = () => {
  const [step, setStep] = useState<TVStep>('welcome');
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [recommendations, setRecommendations] = useState<RankedMovie[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [winningMovie, setWinningMovie] = useState<Movie | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // WebSocket event handler
  const handleWsEvent = useCallback((event: WsServerEvent) => {
    switch (event.type) {
      case 'room.snapshot':
        setRoom(event.room);
        setParticipants(event.participants);
        if (event.recommendations) {
          setRecommendations(event.recommendations);
        }
        if (event.votes) {
          setVotes(event.votes);
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
            p.id === event.participantId ? { ...p, hasSubmittedPreferences: true } : p,
          ),
        );
        break;

      case 'ranking.started':
        setStep('ranking');
        break;

      case 'recommendations.ready':
        setRecommendations(event.result.recommendations);
        setStep('results');
        break;

      case 'vote.submitted':
        setVotes((prev) => [...prev, event.vote]);
        break;

      case 'room.completed':
        setWinningMovie(event.winningMovie);
        setStep('winner');
        break;

      case 'room.error':
        setErrorMessage(event.message);
        setStep('error');
        break;

      default:
        break;
    }
  }, []);

  // WebSocket Hook
  useTVRoomWebSocket({
    roomCode: room?.code ?? null,
    onEvent: handleWsEvent,
  });

  // Hardware Back Key (Escape / Remote Back)
  useEffect(() => {
    const onBackPress = () => {
      if (step === 'lobby' || step === 'demo' || step === 'error') {
        setStep('welcome');
        return true;
      }
      if (step === 'collecting') {
        setStep('lobby');
        return true;
      }
      if (step === 'results') {
        setStep('collecting');
        return true;
      }
      return false;
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [step]);

  // 1. Create Room
  const handleCreateRoom = async () => {
    try {
      const res = await createRoom('Host TV');
      setRoom(res.room);
      setParticipants([res.hostParticipant]);
      setStep('lobby');
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to connect to API server');
      setStep('error');
    }
  };

  // 2. Start Collecting Preferences
  const handleStartCollecting = () => {
    setStep('collecting');
  };

  // 3. Trigger Ranking Engine
  const handleRunConsensus = async () => {
    if (!room) return;
    setStep('ranking');
    try {
      const result = await triggerRanking(room.code);
      setRecommendations(result.recommendations);
      // Brief pause for calculation transition
      setTimeout(() => setStep('results'), 1200);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to calculate consensus');
      setStep('error');
    }
  };

  // 4. Start Final Vote
  const handleStartVoting = () => {
    setStep('voting');
  };

  // 5. Finalize Winner
  const handleRevealWinner = async () => {
    if (!room || recommendations.length === 0) return;
    // Count votes or choose top recommendation
    const counts: Record<string, number> = {};
    for (const v of votes) {
      counts[v.movieId] = (counts[v.movieId] ?? 0) + 1;
    }

    let winnerId = recommendations[0]?.movieId ?? '';
    let maxVotes = -1;
    for (const rec of recommendations) {
      const c = counts[rec.movieId] ?? 0;
      if (c > maxVotes) {
        maxVotes = c;
        winnerId = rec.movieId;
      }
    }

    try {
      const res = await finalizeRoom(room.code, winnerId);
      setWinningMovie(res.winningMovie);
      setStep('winner');
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to finalize winner');
      setStep('error');
    }
  };

  // 6. Reset Session
  const handleReset = () => {
    setStep('welcome');
    setRoom(null);
    setParticipants([]);
    setRecommendations([]);
    setVotes([]);
    setWinningMovie(null);
    setErrorMessage(null);
  };

  return (
    <View style={styles.container}>
      {step === 'welcome' && (
        <WelcomeScreen onCreateRoom={handleCreateRoom} onDemoMode={() => setStep('demo')} />
      )}

      {step === 'lobby' && room && (
        <LobbyScreen
          roomCode={room.code}
          participants={participants}
          onStartCollecting={handleStartCollecting}
          onBack={handleReset}
        />
      )}

      {step === 'collecting' && room && (
        <CollectingPreferencesScreen
          roomCode={room.code}
          participants={participants}
          onRunConsensus={handleRunConsensus}
          onBack={() => setStep('lobby')}
        />
      )}

      {step === 'ranking' && <RankingProgressScreen />}

      {step === 'results' && (
        <RecommendationResultsScreen
          recommendations={recommendations}
          onStartVoting={handleStartVoting}
          onBack={() => setStep('collecting')}
        />
      )}

      {step === 'voting' && (
        <FinalVotingScreen
          recommendations={recommendations}
          votes={votes}
          onRevealWinner={handleRevealWinner}
        />
      )}

      {step === 'winner' && winningMovie && (
        <WinnerScreen winningMovie={winningMovie} onStartNew={handleReset} />
      )}

      {step === 'demo' && <DemoModeScreen onExit={() => setStep('welcome')} />}

      {step === 'error' && (
        <ErrorScreen
          message={errorMessage ?? 'An unexpected error occurred.'}
          onRetry={handleReset}
          onHome={handleReset}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});

export default App;
