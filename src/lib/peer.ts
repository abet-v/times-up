import Peer from 'peerjs';
import type { DataConnection } from 'peerjs';

// Generate a short readable ID (6 chars)
export function generateShortId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// PeerJS server configuration
export const peerServerConfig = {
  host: 'vinsup-peer.fly.dev',
  port: 443,
  path: '/peerjs',
  secure: true,
};

// ICE server configuration for better connectivity
export const iceServers = {
  iceServers: [
    // STUN servers (free, for direct connections)
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun.stunprotocol.org:3478' },
  ],
  iceCandidatePoolSize: 10,
};

// Create a host peer with a specific ID
export function createHostPeer(peerId: string): Promise<Peer> {
  return new Promise((resolve, reject) => {
    const peer = new Peer(peerId, {
      ...peerServerConfig,
      debug: 2, // Enable debug to see what's happening
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
    const peer = new Peer({ ...peerServerConfig, debug: 2 });

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
