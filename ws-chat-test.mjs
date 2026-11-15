// Test chat realtime qua WebSocket (STOMP): khách hàng và admin cùng nhận tin trong hội thoại
import { Client } from '@stomp/stompjs';

const [userToken, adminToken] = process.argv.slice(2);
if (!userToken || !adminToken) {
  console.error('Usage: node ws-chat-test.mjs <userToken> <adminToken>');
  process.exit(2);
}

const CUSTOMER_ID = 1;
const STAFF_ID = 5;
const TOPIC = `/topic/chat/${CUSTOMER_ID}/${STAFF_ID}`;
const receivedBy = { user: [], admin: [] };

function makeClient(token, label) {
  const client = new Client({
    brokerURL: `ws://localhost:8080/ws?token=${token}`,
    reconnectDelay: 0,
  });
  client.onConnect = () => {
    client.subscribe(TOPIC, (message) => {
      const chat = JSON.parse(message.body);
      receivedBy[label].push(chat);
    });
  };
  client.onWebSocketError = (e) => {
    console.error(`${label} WS error`, e && e.message);
  };
  client.activate();
  return client;
}

const userClient = makeClient(userToken, 'user');
const adminClient = makeClient(adminToken, 'admin');

const wait = (ms) => new Promise(r => setTimeout(r, ms));

await wait(1500); // chờ cả hai client connect + subscribe
if (!userClient.connected || !adminClient.connected) {
  console.error(`CONNECT FAILED: user=${userClient.connected} admin=${adminClient.connected}`);
  process.exit(1);
}
console.log('CONNECT: both clients connected via JWT handshake');

userClient.publish({
  destination: '/app/chat.send',
  body: JSON.stringify({ customerId: CUSTOMER_ID, staffId: STAFF_ID, message: 'Xin chao, toi muon hoi ve villa' }),
});
await wait(500);

adminClient.publish({
  destination: '/app/chat.send',
  body: JSON.stringify({ customerId: CUSTOMER_ID, staffId: STAFF_ID, message: 'Chao anh, em hoat dong 24/7' }),
});
await wait(800);

const userOk = receivedBy.user.length === 2 && receivedBy.admin.length === 2;
const senderCheck = receivedBy.user.every(m => m.senderName && m.senderId);
console.log(`user received: ${receivedBy.user.length} msgs; admin received: ${receivedBy.admin.length} msgs; senderName populated: ${senderCheck}`);
console.log(`user messages: ${receivedBy.user.map(m => `"${m.message}" (${m.senderName})`).join(' | ')}`);

userClient.deactivate();
adminClient.deactivate();

if (userOk && senderCheck) {
  console.log('WS CHAT TEST: PASS');
  process.exit(0);
} else {
  console.log('WS CHAT TEST: FAIL');
  process.exit(1);
}
