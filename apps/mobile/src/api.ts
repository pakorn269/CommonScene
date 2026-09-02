/**
 * API Client for CommonScene Mobile Web Application.
 */

import type { JoinRoomResponse, SubmitPreferencesRequest, Vote } from '@commonscene/contracts';

const API_BASE =
  window.location.port === '5173' ? `http://${window.location.hostname}:3001/api/v1` : '/api/v1';

export async function joinRoom(
  roomCode: string,
  displayName: string,
  avatarId: string,
): Promise<JoinRoomResponse> {
  const res = await fetch(`${API_BASE}/rooms/${roomCode}/participants`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ displayName, avatarId }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || `Failed to join room (${res.status})`);
  }

  return res.json();
}

export async function getRoom(roomCode: string) {
  const res = await fetch(`${API_BASE}/rooms/${roomCode}`);
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || `Failed to get room (${res.status})`);
  }
  return res.json();
}

export async function submitPreferences(
  roomCode: string,
  participantId: string,
  preferences: SubmitPreferencesRequest,
) {
  const res = await fetch(
    `${API_BASE}/rooms/${roomCode}/participants/${participantId}/preferences`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(preferences),
    },
  );

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || `Failed to submit preferences`);
  }

  return res.json();
}

export async function submitVote(
  roomCode: string,
  participantId: string,
  movieId: string,
): Promise<{ vote: Vote }> {
  const res = await fetch(`${API_BASE}/rooms/${roomCode}/votes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-participant-id': participantId,
    },
    body: JSON.stringify({ movieId, rank: 1 }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || `Failed to submit vote`);
  }

  return res.json();
}
