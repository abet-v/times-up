import Peer from 'peerjs';
import type { DataConnection } from 'peerjs';

// Generate a short readable ID (6 chars)
export function generateShortId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Create a host peer with a specific ID
export function createHostPeer(peerId: string): Promise<Peer> {
  return new Promise((resolve, reject) => {
    const peer = new Peer(peerId, {
      debug: import.meta.env.DEV ? 2 : 0,
    });

    peer.on('open', () => {
      resolve(peer);
    });

    peer.on('error', (err) => {
      reject(err);
    });
  });
}

// Connect to a host peer
export function connectToHost(hostPeerId: string): Promise<{ peer: Peer; connection: DataConnection }> {
  return new Promise((resolve, reject) => {
    const peer = new Peer();

    peer.on('open', () => {
      const connection = peer.connect(hostPeerId, {
        reliable: true,
      });

      connection.on('open', () => {
        resolve({ peer, connection });
      });

      connection.on('error', (err) => {
        reject(err);
      });
    });

    peer.on('error', (err) => {
      reject(err);
    });
  });
}

// P2P Message types
export type P2PMessage =
  | { type: 'player-join'; name: string; peerId: string }
  | { type: 'player-confirmed'; playerId: string }
  | { type: 'word-add'; word: string }
  | { type: 'word-remove'; word: string }
  | { type: 'words-complete'; words: string[] }
  | { type: 'sync-players'; players: { id: string; name: string; wordsCompleted: boolean; wordCount: number }[] }
  | { type: 'game-started' }
  | { type: 'error'; message: string };

// Remote player state (tracked by host)
export interface RemotePlayer {
  id: string;
  name: string;
  peerId: string;
  connection: DataConnection;
  words: string[];
  wordsCompleted: boolean;
}

// Connection status
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

// Generate join URL
export function getJoinUrl(peerId: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/join/${peerId}`;
}
