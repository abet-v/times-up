const { PeerServer } = require('peer');

const server = PeerServer({
  port: process.env.PORT || 9000,
  path: '/peerjs',
  allow_discovery: false,
  proxied: true,
  // Enable CORS for cross-origin connections
  corsOptions: {
    origin: '*',
  },
});

console.log(`PeerJS server running on port ${process.env.PORT || 9000}`);

// Track all connected peers
const connectedPeers = new Map();

server.on('connection', (client) => {
  const peerId = client.getId();
  connectedPeers.set(peerId, client);
  console.log(`[CONNECT] Peer "${peerId}" connected. Total peers: ${connectedPeers.size}`);
  console.log(`[PEERS] Active peers: ${Array.from(connectedPeers.keys()).join(', ')}`);
});

server.on('disconnect', (client) => {
  const peerId = client.getId();
  connectedPeers.delete(peerId);
  console.log(`[DISCONNECT] Peer "${peerId}" disconnected. Total peers: ${connectedPeers.size}`);
});

server.on('error', (error) => {
  console.error(`[ERROR] Server error:`, error);
});
