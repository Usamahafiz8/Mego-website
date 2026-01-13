'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuthStore } from '@/lib/store/authStore';
import { messagesApi, getImageUrl } from '@/lib/api';
import { Send, Mic, Image as ImageIcon, Smile, Paperclip } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface ConversationUser {
  id: string;
  name?: string;
  fullName?: string;
  userName?: string;
  phone?: string;
  profileImage?: string;
  ProfileImage?: string;
  image?: string;
  Image?: string;
}

interface Conversation {
  id: string;
  // Backend may send either aggregated otherUser or user1/user2 like mobile app
  otherUser?: ConversationUser;
  user1?: ConversationUser;
  user2?: ConversationUser;
  lastMessage?: {
    content: string;
    createdAt: string;
  };
  unreadCount: number;
}

interface Message {
  id: string;
  content: string;
  type: string;
  senderId: string;
  createdAt: string;
  imageUrl?: string;
  voiceUrl?: string;
}

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(
    searchParams.get('conversation') || null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Helper to derive "other user" similar to mobile app logic (user1/user2)
  const getOtherUser = (conversation: Conversation): ConversationUser | undefined => {
    if (conversation.otherUser) {
      return conversation.otherUser;
    }

    const myId = user?.id;
    const u1 = conversation.user1;
    const u2 = conversation.user2;

    if (!u1 && !u2) return undefined;
    if (!myId) return u1 || u2;

    if (u1?.id === myId) return u2 || u1;
    if (u2?.id === myId) return u1 || u2;
    return u1 || u2;
  };

  useEffect(() => {
    // Removed authentication redirect - page accessible without login
    // if (!isAuthenticated) {
    //   router.push('/login');
    //   return;
    // }

    const fetchConversations = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      try {
        const response = await messagesApi.getConversations();
        const conversationsList = response.data || [];
        setConversations(conversationsList);

        // Check if user parameter is passed (for starting new conversation)
        const userId = searchParams.get('user');
        if (userId && !selectedConversation) {
          // Find existing conversation with this user
          const existingConv = conversationsList.find(
            (c: Conversation) => c.otherUser?.id === userId
          );

          if (existingConv) {
            setSelectedConversation(existingConv.id);
          } else {
            // Create new conversation
            try {
              const newConvResponse = await messagesApi.startConversation(userId);
              const newConv = newConvResponse.data;
              setConversations([newConv, ...conversationsList]);
              setSelectedConversation(newConv.id);
            } catch (error: any) {
              toast.error(error.response?.data?.message || 'Failed to start conversation');
            }
          }
        } else if (conversationsList.length > 0 && !selectedConversation) {
          setSelectedConversation(conversationsList[0].id);
        }
      } catch (error) {
        toast.error('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if authenticated, otherwise set loading to false immediately
    if (isAuthenticated) {
      fetchConversations();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, searchParams, selectedConversation]);

  useEffect(() => {
    if (selectedConversation) {
      const fetchMessages = async () => {
        try {
          const response = await messagesApi.getMessages(selectedConversation);
          setMessages(response.data || []);
        } catch (error) {
          toast.error('Failed to load messages');
        }
      };

      fetchMessages();
    }
  }, [selectedConversation]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation || sending) return;

    const textToSend = messageText.trim();
    setMessageText(''); // Clear input immediately for better UX
    setSending(true);

    try {
      // Use sendTextMessage which matches the mobile app's endpoint: /Messages/{conversationId}/text
      await messagesApi.sendTextMessage(selectedConversation, textToSend);

      // Refresh messages to show the new message
      const response = await messagesApi.getMessages(selectedConversation);
      setMessages(response.data || []);

      // Refresh conversations to update last message
      const convResponse = await messagesApi.getConversations();
      setConversations(convResponse.data || []);

      toast.success('Message sent');
    } catch (error: any) {
      // Restore message text on error
      setMessageText(textToSend);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send message';
      toast.error(errorMessage);
      console.error('Send message error:', error);
    } finally {
      setSending(false);
    }
  };

  const selectedConv = conversations.find((c) => c.id === selectedConversation);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 animate-fadeInUp">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-900 dark:text-white mb-4">
            Messages
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Chat with buyers and sellers
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-300px)]">
          {/* Conversations List */}
          <div className="bg-white dark:bg-gray-900/50 rounded-2xl border-2 border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col shadow-soft">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white">Conversations</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <p className="text-gray-600 dark:text-gray-400">No conversations yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {conversations.map((conversation) => {
                    const otherUser = getOtherUser(conversation);
                    const displayName =
                      otherUser?.name ||
                      otherUser?.fullName ||
                      otherUser?.userName ||
                      otherUser?.phone ||
                      'User';
                    const profileImage =
                      otherUser?.profileImage ||
                      otherUser?.ProfileImage ||
                      otherUser?.image ||
                      otherUser?.Image;

                    return (
                      <button
                        key={conversation.id}
                        onClick={() => setSelectedConversation(conversation.id)}
                        className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${selectedConversation === conversation.id
                            ? 'bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-500'
                            : ''
                          }`}
                      >
                        <div className="flex items-center space-x-3">
                          {profileImage ? (
                            <Image
                              src={getImageUrl(profileImage)}
                              alt={displayName}
                              width={48}
                              height={48}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center">
                              <span className="text-white font-medium">
                                {displayName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                {displayName}
                              </h3>
                              {conversation.unreadCount > 0 && (
                                <span className="bg-primary-500 text-white text-xs rounded-full px-2 py-1">
                                  {conversation.unreadCount}
                                </span>
                              )}
                            </div>
                            {conversation.lastMessage && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                {conversation.lastMessage.content}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900/50 rounded-2xl border-2 border-gray-100 dark:border-gray-800 flex flex-col shadow-soft">
            {selectedConversation && selectedConv ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-3">
                  {(() => {
                    const otherUser = getOtherUser(selectedConv);
                    const displayName =
                      otherUser?.name ||
                      otherUser?.fullName ||
                      otherUser?.userName ||
                      otherUser?.phone ||
                      'User';
                    const profileImage =
                      otherUser?.profileImage ||
                      otherUser?.ProfileImage ||
                      otherUser?.image ||
                      otherUser?.Image;

                    return (
                      <>
                        {profileImage ? (
                          <Image
                            src={getImageUrl(profileImage)}
                            alt={displayName}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center">
                            <span className="text-white font-medium">
                              {displayName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {displayName}
                          </h3>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-600 dark:text-gray-400">No messages yet</p>
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isOwn = message.senderId === user?.id;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${isOwn
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                              }`}
                          >
                            {message.imageUrl && (
                              <Image
                                src={getImageUrl(message.imageUrl)}
                                alt="Message image"
                                width={200}
                                height={200}
                                className="rounded mb-2"
                              />
                            )}
                            {message.voiceUrl && (
                              <audio controls className="w-full mb-2">
                                <source src={getImageUrl(message.voiceUrl)} />
                              </audio>
                            )}
                            <p>{message.content}</p>
                            <p
                              className={`text-xs mt-1 ${isOwn ? 'text-primary-100' : 'text-gray-500 dark:text-gray-400'
                                }`}
                            >
                              {new Date(message.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <Paperclip className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={sending || !messageText.trim()}
                      className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className={`w-5 h-5 ${sending ? 'animate-pulse' : ''}`} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-gray-600 dark:text-gray-400">Select a conversation to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}

