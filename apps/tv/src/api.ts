/**
 * @commonscene/tv — TV API Client.
 *
 * Communicates with the Fastify backend from Vega OS.
 * In the Vega Virtual Device (QEMU), the host machine is at 10.0.2.2.
 */

import type {
  CreateRoomResponse,
  JoinRoomResponse,
  RecommendationResult,
  Room,
  Movie,
} from '@commonscene/contracts';

// In Vega simulator, host dev server is at 10.0.2.2:3001
const API_BASE = 'http://10.0.2.2:3001/api/v1';

export async function createRoom(
  hostDisplayName = 'Fire TV Host',
  hostAvatarId = 'avatar-1',
): Promise<CreateRoomResponse> {
  const res = await fetch(`${API_BASE}/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hostDisplayName, hostAvatarId }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to create room (${res.status})`);
  }

  return res.json();
}

export async function getRoom(roomCode: string): Promise<{
  room: Room;
  participants: JoinRoomResponse['participants'];
  recommendations?: RecommendationResult['recommendations'];
}> {
  const res = await fetch(`${API_BASE}/rooms/${roomCode}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to get room (${res.status})`);
  }
  return res.json();
}

export async function triggerRanking(roomCode: string): Promise<RecommendationResult> {
  const res = await fetch(`${API_BASE}/rooms/${roomCode}/rank`, {
    method: 'POST',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to rank movies (${res.status})`);
  }

  return res.json();
}

export async function finalizeRoom(
  roomCode: string,
  winningMovieId: string,
): Promise<{ room: Room; winningMovie: Movie }> {
  const res = await fetch(`${API_BASE}/rooms/${roomCode}/finalize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ winningMovieId }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to finalize room (${res.status})`);
  }

  return res.json();
}
