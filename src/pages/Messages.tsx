import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, Search, MoreVertical } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface Message {
  id: number;
  created_at: string;
  phone: string;
  nomewpp: string;
  bot_message: string | null;
  user_message: string | null;
  message_type: string;
}

interface Chat {
  phone: string;
  nomewpp: string;
  patient_name: string | null;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

export default function Messages() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Função para limpar e formatar telefone
  const cleanPhone = (phone: string) => {
    return phone.replace('@s.whatsapp.net', '').replace('@c.us', '');
  };

  // Função para formatar nome
  const getDisplayName = (chat: Chat) => {
    if (chat.patient_name) return chat.patient_name;
    return chat.nomewpp.replace('@s.whatsapp.net', '').replace('@c.us', '');
  };

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat);
    }
  }, [selectedChat]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchChats = async () => {
    const { data, error } = await supabase
      .rpc('get_clinica_chats');

    if (error) {
      console.error('Error fetching chats:', error);
      return;
    }

    // Dedupe por telefone (limpo) mantendo a conversa mais recente
    const byPhone = new Map<string, Chat>();
    (data || []).forEach((c: Chat) => {
      const key = cleanPhone(c.phone);
      const existing = byPhone.get(key);
      if (!existing || new Date(c.last_message_time) > new Date(existing.last_message_time)) {
        byPhone.set(key, c);
      }
    });

    const uniqueChats = Array.from(byPhone.values()).sort(
      (a, b) => new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime()
    );

    setChats(uniqueChats);
  };

  const fetchMessages = async (phone: string) => {
    const { data, error } = await supabase
      .rpc('get_clinica_messages', { p_phone: phone });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    setMessages(data || []);
  };

  const filteredChats = chats.filter(chat =>
    (chat.patient_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    chat.nomewpp.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.phone.includes(searchQuery)
  );

  const selectedChatData = chats.find(chat => chat.phone === selectedChat);

  return (
    <div className="h-screen flex bg-gradient-to-br from-background via-background/95 to-primary/5">
      {/* Sidebar */}
      <div className="w-[400px] border-r border-border flex flex-col bg-card/50 backdrop-blur-sm">
        {/* Header */}
        <div className="h-[60px] bg-card border-b border-border flex items-center justify-between px-4">
          <h1 className="text-xl font-semibold text-foreground">Conversas</h1>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>

        {/* Search */}
        <div className="p-2 bg-card/30">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar conversas"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/50 border-border"
            />
          </div>
        </div>

        {/* Chat List */}
        <ScrollArea className="flex-1">
          {filteredChats.map((chat) => (
            <div
              key={chat.phone}
              onClick={() => setSelectedChat(chat.phone)}
              className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-accent/50 transition-colors ${
                selectedChat === chat.phone ? 'bg-accent' : ''
              }`}
            >
              <Avatar className="h-12 w-12 bg-primary/10">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {getDisplayName(chat).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-semibold text-foreground truncate">
                    {getDisplayName(chat)}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {new Date(chat.last_message_time).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground truncate">{cleanPhone(chat.phone)}</p>
                <p className="text-sm text-muted-foreground truncate mt-1">{chat.last_message}</p>
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="h-[60px] bg-card border-b border-border flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 bg-primary/10">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {selectedChatData ? getDisplayName(selectedChatData).charAt(0).toUpperCase() : '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-medium text-foreground">
                    {selectedChatData ? getDisplayName(selectedChatData) : ''}
                  </h2>
                  <p className="text-xs text-muted-foreground">{selectedChat ? cleanPhone(selectedChat) : ''}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 bg-background/50 p-4">
              <div className="space-y-2">
                {messages.map((msg) => (
                  <div key={msg.id}>
                    {msg.user_message && (
                      <div className="flex justify-end mb-2">
                        <div className="bg-primary text-primary-foreground rounded-lg px-3 py-2 max-w-[65%] shadow-sm">
                          <p className="text-sm">{msg.user_message}</p>
                          <span className="text-xs opacity-70 float-right mt-1">
                            {new Date(msg.created_at).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    )}
                    {msg.bot_message && (
                      <div className="flex justify-start mb-2">
                        <div className="bg-card border border-border text-foreground rounded-lg px-3 py-2 max-w-[65%] shadow-sm">
                          <p className="text-sm">{msg.bot_message}</p>
                          <span className="text-xs text-muted-foreground float-right mt-1">
                            {new Date(msg.created_at).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-background/30">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <MessageSquare className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Mensagens
            </h2>
            <p className="text-muted-foreground text-center max-w-md">
              Selecione uma conversa para visualizar as mensagens
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
