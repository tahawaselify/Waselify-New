import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabaseClient';
import { X, Send, User, Search, Clock } from 'lucide-react';

type Profile = { id: string; email: string; role?: string };
type DirectMessage = {
  id: string;
  sender_id: string | null;
  recipient_id: string | null;
  content: string;
  created_at: string;
};

const formatTime = (iso: string) => new Date(iso).toLocaleString();

const DirectMessageModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [channel, setChannel] = useState<any>(null);

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return profiles.filter(p => p.email?.toLowerCase().includes(s));
  }, [profiles, search]);

  useEffect(() => {
    const loadUsers = async () => {
      if (!isOpen) return;
      const { data: current } = await supabase.auth.getUser();
      const currentId = current?.user?.id;
      const { data } = await supabase.from('profiles').select('id, email, role');
      const list = (data as Profile[] | null) || [];
      setProfiles(list.filter(p => p.id !== currentId));
    };
    loadUsers();
  }, [isOpen]);

  const loadThread = async (user: Profile) => {
    setSelectedUser(user);
    const { data: current } = await supabase.auth.getUser();
    const me = current?.user?.id as string;
    const { data } = await supabase
      .from('user_direct_messages')
      .select('*')
      .or(`and(sender_id.eq.${me},recipient_id.eq.${user.id}),and(sender_id.eq.${user.id},recipient_id.eq.${me}))`)
      .order('created_at', { ascending: true });
    setMessages((data as DirectMessage[] | null) || []);

    // realtime
    if (channel) {
      supabase.removeChannel(channel);
      setChannel(null);
    }
    const c = supabase
      .channel(`dm-${me}-${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'user_direct_messages',
        filter: `or(and(sender_id.eq.${me},recipient_id.eq.${user.id}),and(sender_id.eq.${user.id},recipient_id.eq.${me}))`
      }, (payload: any) => setMessages(prev => [...prev, payload.new as DirectMessage]))
      .subscribe();
    setChannel(c);
  };

  const send = async () => {
    if (!selectedUser || !newMessage.trim()) return;
    setIsSending(true);
    try {
      const { data: current } = await supabase.auth.getUser();
      const me = current?.user?.id as string;
      const { error } = await supabase.from('user_direct_messages').insert({
        sender_id: me,
        recipient_id: selectedUser.id,
        content: newMessage.trim(),
      });
      if (error) throw error;
      // Also create a notification for the recipient so they see it immediately
      await supabase.from('notifications').insert({
        user_id: selectedUser.id,
        title: 'New direct message',
        message: newMessage.trim().slice(0, 140),
        type: 'info',
        is_read: false,
        created_at: new Date().toISOString(),
      });
      setNewMessage('');
    } catch (e) {
      console.error('DM send error', e);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden grid grid-cols-1 md:grid-cols-3">
        {/* Left: users */}
        <div className="border-r">
          <div className="p-4 flex items-center justify-between border-b">
            <div className="flex items-center gap-2">
              <User size={18} className="text-gray-700" />
              <span className="font-semibold">Users</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => { onClose(); if (channel) { supabase.removeChannel(channel); setChannel(null);} }}>
              <X size={18} />
            </Button>
          </div>
          <div className="p-3">
            <div className="relative">
              <Search size={14} className="absolute left-2 top-2.5 text-gray-400" />
              <Input className="pl-7" placeholder="Search email" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="overflow-y-auto h-full p-2 space-y-2">
            {filtered.map(u => (
              <button key={u.id} onClick={() => loadThread(u)} className={`w-full text-left p-3 rounded-lg border ${selectedUser?.id === u.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}`}>
                <div className="text-sm font-medium">{u.email}</div>
                <div className="text-xs text-gray-500">{u.role || 'user'}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: thread */}
        <div className="md:col-span-2 flex flex-col">
          <div className="p-4 border-b">
            {selectedUser ? (
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500">Chat with</div>
                  <div className="font-semibold">{selectedUser.email}</div>
                </div>
                <Badge>Direct</Badge>
              </div>
            ) : (
              <div className="text-sm text-gray-500">Select a user to start messaging</div>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-sm text-gray-500">No messages yet.</div>
            ) : (
              messages.map(m => (
                <div key={m.id} className={`flex ${m.sender_id !== selectedUser?.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${m.sender_id !== selectedUser?.id ? 'bg-blue-600 text-white' : 'bg-white border'}`}>
                    <div className="whitespace-pre-wrap break-words">{m.content}</div>
                    <div className={`text-[10px] mt-1 ${m.sender_id !== selectedUser?.id ? 'text-blue-100' : 'text-gray-500'}`}><Clock size={10} className="inline mr-1" />{formatTime(m.created_at)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-3 border-t flex items-center gap-2">
            <Textarea rows={2} placeholder="Type your message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
            <Button onClick={send} disabled={!selectedUser || isSending || !newMessage.trim()} className="flex items-center gap-2">
              <Send size={16} />
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectMessageModal;


