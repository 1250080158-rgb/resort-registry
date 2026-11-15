import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import { chatApi, ChatMsg, User as ApiUser } from '../../utils/api';

interface ChatWidgetProps {
  currentUserApi: ApiUser;
}

/**
 * Widget chat nổi (góc phải dưới) cho khách hàng, chat realtime qua WebSocket
 * với nhân viên hỗ trợ; gửi dự phòng qua REST khi WS mất kết nối.
 */
export default function ChatWidget({ currentUserApi }: ChatWidgetProps) {
  const [open, setOpen] = useState(false);
  const [staff, setStaff] = useState<ApiUser | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [text, setText] = useState('');
  const [connected, setConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open || staff) return;
    chatApi.getSupport().then(setStaff).catch(() => {});
  }, [open, staff]);

  useEffect(() => {
    if (!open || !staff) return;
    chatApi.getBetween(currentUserApi.id, staff.id).then(setMessages).catch(() => {});

    const client = new Client({
      brokerURL: `ws://localhost:8080/ws?token=${localStorage.getItem('rr_token') || ''}`,
      reconnectDelay: 5000,
    });
    client.onConnect = () => {
      setConnected(true);
      client.subscribe(`/topic/chat/${currentUserApi.id}/${staff.id}`, (message) => {
        const chat: ChatMsg = JSON.parse(message.body);
        setMessages(prev => (prev.some(m => m.id === chat.id) ? prev : [...prev, chat]));
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
  }, [open, staff, currentUserApi.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const send = async () => {
    const msg = text.trim();
    if (!msg || !staff) return;
    setText('');
    const client = clientRef.current;
    if (client && client.connected) {
      client.publish({
        destination: '/app/chat.send',
        body: JSON.stringify({ customerId: currentUserApi.id, staffId: staff.id, message: msg }),
      });
    } else {
      try {
        const saved = await chatApi.sendRest(currentUserApi.id, staff.id, msg);
        setMessages(prev => (prev.some(m => m.id === saved.id) ? prev : [...prev, saved]));
      } catch (e) {
        alert(e instanceof Error ? e.message : 'Gửi tin nhắn thất bại');
      }
    }
  };

  return (
    <>
      {/* Nút nổi */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-navy text-gold shadow-2xl hover:bg-navy-light transition-colors flex items-center justify-center text-2xl"
        title="Chat với nhân viên hỗ trợ"
      >
        {open ? '×' : '💬'}
      </button>

      {/* Panel chat */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-cream-dark overflow-hidden animate-fadeIn">
          <div className="bg-navy px-4 py-3 flex items-center gap-3">
            <img
              src={staff?.avatar || ''}
              alt={staff?.name || 'Nhân viên hỗ trợ'}
              className="w-9 h-9 rounded-full object-cover border border-gold/40"
            />
            <div className="min-w-0">
              <p className="text-cream text-sm font-semibold truncate">
                {staff ? staff.name : 'Đang kết nối...'}
              </p>
              <p className="text-xs flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-success' : 'bg-warning'}`} />
                <span className={connected ? 'text-cream/60' : 'text-warning/80'}>
                  {connected ? 'Đang hoạt động' : 'Chế độ chờ'}
                </span>
              </p>
            </div>
          </div>

          <div className="h-72 overflow-y-auto p-4 space-y-3 bg-cream">
            {messages.length === 0 && (
              <p className="text-center text-muted text-xs py-8">
                Hãy gửi tin nhắn đầu tiên — chúng tôi luôn sẵn sàng hỗ trợ!
              </p>
            )}
            {messages.map(m => {
              const mine = m.senderId === currentUserApi.id;
              return (
                <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                    mine ? 'bg-navy text-cream rounded-br-sm' : 'bg-white text-navy border border-cream-dark rounded-bl-sm'
                  }`}>
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

          <div className="p-3 border-t border-cream-dark flex gap-2 bg-white">
            <input
              type="text"
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') send(); }}
              placeholder="Nhập tin nhắn..."
              className="flex-1 px-3 py-2 text-sm rounded-xl border border-cream-dark text-navy bg-cream"
            />
            <button
              onClick={send}
              className="px-4 py-2 rounded-xl bg-navy text-gold text-sm font-semibold hover:bg-navy-light transition-colors"
            >
              Gửi
            </button>
          </div>
        </div>
      )}
    </>
  );
}
