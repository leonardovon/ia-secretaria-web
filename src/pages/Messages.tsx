import { useState, useEffect } from 'react';
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

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat);
    }
  }, [selectedChat]);

  const fetchChats = async () => {
    const { data, error } = await supabase
      .rpc('get_clinica_chats');

    if (error) {
      console.error('Error fetching chats:', error);
      return;
    }

    setChats(data || []);
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
    <div className="h-screen flex bg-[#111b21]">
      {/* Sidebar */}
      <div className="w-[400px] border-r border-[#2a3942] flex flex-col bg-[#111b21]">
        {/* Header */}
        <div className="h-[60px] bg-[#202c33] flex items-center justify-between px-4">
          <h1 className="text-xl font-semibold text-[#e9edef]">Conversas</h1>
          <Button variant="ghost" size="icon" className="text-[#aebac1] hover:bg-[#2a3942]">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>

        {/* Search */}
        <div className="p-2 bg-[#111b21]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#8696a0]" />
            <Input
              placeholder="Pesquisar conversas"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#202c33] border-none text-[#e9edef] placeholder:text-[#8696a0]"
            />
          </div>
        </div>

        {/* Chat List */}
        <ScrollArea className="flex-1">
          {filteredChats.map((chat) => (
            <div
              key={chat.phone}
              onClick={() => setSelectedChat(chat.phone)}
              className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-[#2a3942] ${
                selectedChat === chat.phone ? 'bg-[#2a3942]' : ''
              }`}
            >
              <Avatar className="h-12 w-12 bg-[#6b7c85]">
                <AvatarFallback className="bg-[#6b7c85] text-[#e9edef]">
                  {(chat.patient_name || chat.nomewpp).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-medium text-[#e9edef] truncate">
                    {chat.patient_name || chat.nomewpp}
                  </h3>
                  <span className="text-xs text-[#8696a0]">
                    {new Date(chat.last_message_time).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-sm text-[#67757f] text-xs truncate">{chat.phone}</p>
                <p className="text-sm text-[#8696a0] truncate">{chat.last_message}</p>
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
            <div className="h-[60px] bg-[#202c33] flex items-center justify-between px-4 border-b border-[#2a3942]">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 bg-[#6b7c85]">
                  <AvatarFallback className="bg-[#6b7c85] text-[#e9edef]">
                    {(selectedChatData?.patient_name || selectedChatData?.nomewpp || '?').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-medium text-[#e9edef]">
                    {selectedChatData?.patient_name || selectedChatData?.nomewpp}
                  </h2>
                  <p className="text-xs text-[#8696a0]">{selectedChat}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 bg-[#0b141a] p-4">
              <div className="space-y-2">
                {messages.map((msg) => (
                  <div key={msg.id}>
                    {msg.user_message && (
                      <div className="flex justify-end mb-2">
                        <div className="bg-[#005c4b] text-[#e9edef] rounded-lg px-3 py-2 max-w-[65%]">
                          <p className="text-sm">{msg.user_message}</p>
                          <span className="text-xs text-[#8696a0] float-right mt-1">
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
                        <div className="bg-[#202c33] text-[#e9edef] rounded-lg px-3 py-2 max-w-[65%]">
                          <p className="text-sm">{msg.bot_message}</p>
                          <span className="text-xs text-[#8696a0] float-right mt-1">
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
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#0b141a]">
            <MessageSquare className="h-24 w-24 text-[#3b4a54] mb-4" />
            <h2 className="text-2xl font-light text-[#e9edef] mb-2">
              WhatsApp Web
            </h2>
            <p className="text-[#8696a0] text-center max-w-md">
              Selecione uma conversa para visualizar as mensagens
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
