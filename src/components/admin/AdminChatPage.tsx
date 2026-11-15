import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import { chatApi, ChatMsg, User as ApiUser } from '../../utils/api';

interface AdminChatPageProps {
  currentUserApi: ApiUser | null;
}

interface Conversation {
  customerId: number;
  name: string;
  lastMessage: string;
  count: number;
}

/**
 * Hộp thư chat cho admin: danh sách khách đã nhắn, chọn hội thoại
 * để trả lời realtime qua WebSocket (topic /topic/chat/{customerId}/{adminId}).
 */
export default function AdminChatPage({ currentUserApi }: AdminChatPageProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [text, setText] = useState('');
  const [connected, setConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const adminId = currentUserApi?.id;

  const loadConversations = async () => {
    if (!adminId) return;
    try {
      const chats = await chatApi.getByStaff(adminId);
      const map = new Map<number, Conversation>();
      for (const c of chats) {
        const existing = map.get(c.customerId);
        if (existing) {
          existing.lastMessage = c.message;
          existing.count += 1;
        } else {
          map.set(c.customerId, {
            customerId: c.customerId,
            name: c.senderId === c.customerId && c.senderName ? c.senderName : `Khách #${c.customerId}`,
            lastMessage: c.message,
            count: 1,
          });
        }
      }
      setConversations(Array.from(map.values()));
    } catch {
      // bỏ qua lỗi load danh sách
    }
  };

  useEffect(() => { loadConversations(); }, [adminId]);

  // Mở hội thoại: tải lịch sử + subscribe realtime + đánh dấu đã đọc
  useEffect(() => {
    if (!selected || !adminId) return;
    chatApi.getBetween(selected, adminId).then(setMessages).catch(() => {});
    chatApi.markAllAsRead(selected, adminId).catch(() => {});

    const client = new Client({
      brokerURL: `ws://localhost:8080/ws?token=${localStorage.getItem('rr_token') || ''}`,
      reconnectDelay: 5000,
    });
    client.onConnect = () => {
      setConnected(true);
      client.subscribe(`/topic/chat/${selected}/${adminId}`, (message) => {
        const chat: ChatMsg = JSON.parse(message.body);
        setMessages(prev => (prev.some(m => m.id === chat.id) ? prev : [...prev, chat]));
        loadConversations();
      });
    };
    client.onWebSocketClose = () => setConnected(false);
    client.activate();
    clientRef.current = client;
    return () => {
      client.deactivate();
      clientRef.current = null;
      setConnected(false);
    };
  }, [selected, adminId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selected]);

  const send = async () => {
    const msg = text.trim();
    if (!msg || selected === null || !adminId) return;
    setText('');
    const client = clientRef.current;
    if (client && client.connected) {
      client.publish({
        destination: '/app/chat.send',
        body: JSON.stringify({ customerId: selected, staffId: adminId, message: msg }),
      });
    } else {
      try {
        const saved = await chatApi.sendRest(selected, adminId, msg);
        setMessages(prev => (prev.some(m => m.id === saved.id) ? prev : [...prev, saved]));
        loadConversations();
      } catch (e) {
        alert(e instanceof Error ? e.message : 'Gửi tin nhắn thất bại');
      }
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="mb-5">
        <h2 className="font-display text-2xl text-navy font-semibold">Tin Nhắn Khách Hàng</h2>
        <p className="text-muted text-sm mt-0.5">
          Trả lời trực tiếp khách hàng · {connected ? 'WebSocket đã kết nối' : 'WebSocket chờ kết nối'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Danh sách hội thoại */}
        <div className="bg-white rounded-2xl shadow-sm border border-cream-dark overflow-hidden">
          <div className="px-4 py-3 border-b border-cream-dark">
            <h3 className="font-semibold text-navy text-sm">Hội Thoại</h3>
          </div>
          <div className="divide-y divide-cream-dark max-h-96 overflow-y-auto">
            {conversations.length === 0 && (
              <p className="text-center text-muted text-xs py-10">Chưa có khách nào nhắn tin</p>
            )}
            {conversations.map(c => (
              <button
                key={c.customerId}
                onClick={() => setSelected(c.customerId)}
                className={`w-full text-left px-4 py-3 hover:bg-cream/60 transition-colors ${
                  selected === c.customerId ? 'bg-cream border-l-2 border-gold' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-navy text-sm font-semibold truncate">{c.name}</p>
                  <span className="text-[10px] text-muted bg-cream px-1.5 py-0.5 rounded-full shrink-0">{c.count} tin</span>
                </div>
                <p className="text-muted text-xs truncate mt-0.5">{c.lastMessage}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Cửa sổ tin nhắn */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-cream-dark flex flex-col min-h-96">
          {selected === null ? (
            <div className="flex-1 flex items-center justify-center text-muted text-sm py-20">
              Chọn một hội thoại để bắt đầu trả lời
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-cream-dark">
                <p className="text-navy text-sm font-semibold">
                  {conversations.find(c => c.customerId === selected)?.name || `Khách #${selected}`}
                </p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-cream max-h-96 min-h-80">
                {messages.map(m => {
                  const mine = m.senderId === adminId;
                  return (
                    <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm ${
                        mine ? 'bg-navy text-cream rounded-br-sm' : 'bg-white text-navy border border-cream-dark rounded-bl-sm'
                      }`}>
                        {!mine && m.senderName && (
                          <p className="text-[10px] text-teal font-semibold mb-0.5">{m.senderName}</p>
                        )}
                        <p className="whitespace-pre-wrap break-words">{m.message}</p>
                        <p className={`text-[10px] mt-1 ${mine ? 'text-cream/50' : 'text-muted'}`}>
                          {m.createdAt ? new Date(m.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
              <div className="p-3 border-t border-cream-dark flex gap-2">
                <input
                  type="text"
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') send(); }}
                  placeholder="Nhập tin nhắn trả lời..."
                  className="flex-1 px-3 py-2 text-sm rounded-xl border border-cream-dark text-navy bg-cream"
                />
                <button
                  onClick={send}
                  className="px-4 py-2 rounded-xl bg-navy text-gold text-sm font-semibold hover:bg-navy-light transition-colors"
                >
                  Gửi
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
