import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "../../services/supabase";
import { useUser } from "../authentication/useUser";
import { useUi } from "../../contexts/UiContext";

function ChatView() {
  const { roomId } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();
  const { openSidebar } = useUi();
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState({});
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load room info + members
  useEffect(() => {
    if (!roomId || !user) return;
    loadRoom();
    loadMessages();
    
    // Subscribe to realtime
    const subscription = supabase
      .channel("group_messages")
      .on("postgres_changes", 
        { event: "INSERT", schema: "public", table: "group_messages", filter: `room_id=eq.${roomId}` },
        (payload) => {
          setMessages(prev => {
            if (prev.some(m => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, [roomId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  function scrollToBottom() {
    setTimeout(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, 100);
  }

  async function loadRoom() {
    const { data } = await supabase.from("rooms").select("*, chat_classes(name, unit_name)").eq("id", roomId).single();
    if (data) setRoom(data);

    const { data: memberData } = await supabase
      .from("class_members")
      .select("user_id, role, display_name");
    if (memberData) {
      const m = {}; 
      memberData.forEach(mem => { m[mem.user_id] = mem; });
      setMembers(m);
    }
  }

  async function loadMessages() {
    const { data } = await supabase
      .from("group_messages")
      .select("*")
      .eq("room_id", roomId)
      .order("created_at", { ascending: true })
      .limit(100);
    if (data) setMessages(data);
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;
    
    setSending(true);
    const content = newMessage.trim();
    setNewMessage("");
    
    try {
      // Insert optimistically
      const tempId = "temp_" + Date.now();
      const optimisticMsg = {
        id: tempId,
        room_id: roomId,
        sender_id: user.id,
        content,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, optimisticMsg]);

      const { data, error } = await supabase
        .from("group_messages")
        .insert({ room_id: roomId, sender_id: user.id, content })
        .select()
        .single();

      if (error) throw error;

      // Replace optimistic with real
      setMessages(prev => prev.map(m => m.id === tempId ? data : m));
    } catch (e) {
      console.error(e);
      setNewMessage(content);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  const otherMembers = Object.values(members).filter(m => m.user_id !== user?.id);

  return (
    <div className="relative col-span-2 flex h-screen-safe w-full flex-col md:col-span-1">
      {/* Top Bar */}
      <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <button onClick={openSidebar} className="md:hidden text-xl">☰</button>
        <div>
          <p className="font-semibold">{room?.name || "Loading..."}</p>
          <p className="text-xs text-gray-500">
            {room?.chat_classes?.name} {room?.chat_classes?.unit_name}
            {" • "}{otherMembers.length} anggota
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-center text-gray-400">
            <div>
              <p className="text-3xl mb-2">💬</p>
              <p>Belum ada pesan. Mulai diskusi!</p>
            </div>
          </div>
        )}
        {messages.map(msg => {
          const sender = members[msg.sender_id];
          const isMe = msg.sender_id === user?.id;
          const displayName = sender?.display_name || "User";
          const role = sender?.role || "student";
          
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] ${isMe ? "order-1" : "order-1"}`}>
                {!isMe && (
                  <p className="text-xs text-gray-500 mb-1 ml-1">
                    {role === "teacher" ? "👨‍🏫 " : ""}{displayName}
                  </p>
                )}
                <div className={`rounded-2xl px-4 py-2.5 ${
                  isMe 
                    ? "bg-blue-500 text-white rounded-br-md" 
                    : "bg-gray-100 dark:bg-gray-800 rounded-bl-md"
                }`}>
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                </div>
                <p className={`text-[10px] text-gray-400 mt-0.5 ${isMe ? "text-right mr-1" : "ml-1"}`}>
                  {new Date(msg.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 px-4 py-3 dark:border-gray-700">
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            ref={inputRef}
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Ketik pesan..."
            className="flex-1 rounded-full border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-blue-400 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {sending ? "⏳" : "➤"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatView;
