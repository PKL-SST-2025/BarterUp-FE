// src/pages/Messages.tsx
import type { Component } from "solid-js";
import { createSignal, For, Show, createEffect } from "solid-js";
import { contacts } from "../components/contacts";
import type { Contact } from "../components/contacts";
import Navbar from '../components/Navbar';

export type Message = { id: number; from: "me" | "them"; text: string; timestamp?: string };

const Messages: Component = () => {
  const [selectedContact, setSelectedContact] = createSignal<Contact | null>(null);
  
  // Enhanced messages with timestamps
  // --- Local Persistence Helpers ---
  const LS_MESSAGES_KEY = 'chatMessages';
  const LS_DRAFTS_KEY = 'chatDrafts';

  const buildInitialMessages = () => {
    // Try load from localStorage
    try {
      const raw = localStorage.getItem(LS_MESSAGES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') return parsed as Record<string, Message[]>;
      }
    } catch (e) {
      console.warn('Failed to parse stored messages', e);
    }
    // Fallback initial seeded conversations
    return contacts().reduce((acc, c) => {
      acc[c.name] = [
        { 
          id: 1, 
          from: "them", 
          text: `Hi! I'm ${c.name}. I saw your post about skill sharing and I'm really interested! 🚀`,
          timestamp: new Date(Date.now() - 300000).toISOString()
        },
        {
          id: 2,
          from: "them",
          text: "Would you be interested in exchanging some skills? I can teach you some photography techniques in exchange for web development tips!",
          timestamp: new Date(Date.now() - 240000).toISOString()
        }
      ];
      return acc;
    }, {} as Record<string, Message[]>);
  };

  const buildInitialDrafts = () => {
    try {
      const raw = localStorage.getItem(LS_DRAFTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') return parsed as Record<string,string>;
      }
    } catch (e) {
      console.warn('Failed to parse stored drafts', e);
    }
    return {} as Record<string,string>;
  };

  const [messages, setMessages] = createSignal<Record<string, Message[]>>(buildInitialMessages());
  const [drafts, setDrafts] = createSignal<Record<string, string>>(buildInitialDrafts());

  // Clear helpers
  const clearConversation = (name: string) => {
    const current = { ...messages() };
    delete current[name];
    setMessages(current);
    persistMessages(current);
  };
  const clearAllConversations = () => {
    setMessages({});
    persistMessages({});
    setDrafts({});
    persistDrafts({});
    setSelectedContact(null);
  };
  const clearMyMessages = (name: string) => {
    const current = { ...messages() };
    const list = current[name] || [];
    current[name] = list.filter(m => m.from !== 'me');
    setMessages(current);
    persistMessages(current);
  };

  // Auto-scroll container reference
  let messagesContainer: HTMLDivElement | undefined;

  const persistMessages = (data: Record<string, Message[]>) => {
    try { localStorage.setItem(LS_MESSAGES_KEY, JSON.stringify(data)); } catch {}
  };
  const persistDrafts = (data: Record<string,string>) => {
    try { localStorage.setItem(LS_DRAFTS_KEY, JSON.stringify(data)); } catch {}
  };

  const handleSend = () => {
    const contact = selectedContact();
    if (!contact) return;
    const key = contact.name;
    const text = drafts()[key]?.trim();
    if (!text) return;
    
    const newMessage: Message = { 
      id: Date.now(), 
      from: "me", 
      text, 
      timestamp: new Date().toISOString() 
    };
    const updated: Record<string, Message[]> = {
      ...messages(),
      [key]: [...(messages()[key] || []), newMessage]
    };
    setMessages(updated);
    persistMessages(updated);
    const newDrafts = { ...drafts(), [key]: "" };
    setDrafts(newDrafts);
    persistDrafts(newDrafts);
  };

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div class="font-inter min-h-screen overflow-x-hidden">
      <Navbar />
      
      <div class="pt-16 h-screen flex relative">
        {/* Enhanced Sidebar */}
        <aside class={`w-full md:w-80 h-full glass-strong border-r border-white/10 flex-shrink-0 absolute md:relative z-10 md:z-auto transition-transform duration-300 ${
          selectedContact() ? '-translate-x-full md:translate-x-0' : 'translate-x-0'
        }`} aria-label="Contacts sidebar">
          
          {/* Sidebar Header */}
          <div class="p-6 border-b border-white/10">
            <div class="flex items-center justify-between mb-4">
              <h1 class="text-2xl font-bold text-gradient">Messages</h1>
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span class="text-sm text-gray-300">{contacts().length} contacts</span>
              </div>
            </div>
            
            {/* Search Bar */}
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search conversations..."
                class="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50"
              />
            </div>
          </div>

          {/* Contacts List */}
          <div class="flex-1 overflow-y-auto">
            <Show when={contacts().length === 0}>
              <div class="p-6 text-center">
                <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                  <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                  </svg>
                </div>
                <p class="text-gray-400">No conversations yet</p>
                <p class="text-sm text-gray-500 mt-1">Start connecting with other members!</p>
              </div>
            </Show>
            
            <For each={contacts()}>
              {(contact) => {
                const key = contact.name;
                const contactMessages = messages()[key] || [];
                const lastMessage = contactMessages[contactMessages.length - 1];
                const isSelected = selectedContact()?.name === contact.name;
                
                return (
                  <div
                    onClick={() => setSelectedContact(isSelected ? null : contact)}
                    class={`p-4 border-b border-white/5 cursor-pointer transition-all duration-200 hover:bg-white/5 ${
                      isSelected ? 'bg-primary/10 border-r-2 border-r-primary' : ''
                    }`}
                  >
                    <div class="flex items-center space-x-3">
                      <div class="relative">
                        <img
                          src={contact.avatar}
                          alt={contact.name}
                          class="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                        />
                        <div class="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-900"></div>
                      </div>
                      
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between">
                          <h3 class="font-semibold text-white truncate">{contact.name}</h3>
                          <span class="text-xs text-gray-400">
                            {lastMessage ? formatTime(lastMessage.timestamp) : ''}
                          </span>
                        </div>
                        <p class="text-sm text-gray-400 truncate">
                          {lastMessage?.text || 'Start a conversation...'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }}
            </For>
          </div>
        </aside>

        {/* Enhanced Chat Panel */}
        <main class={`w-full flex-1 flex flex-col glass transition-transform duration-300 ${
          selectedContact() ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
        } min-h-0`}>
          <Show
            when={selectedContact()}
            fallback={
              <div class="flex-1 flex items-center justify-center">
                <div class="text-center">
                  <div class="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                    <svg class="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                    </svg>
                  </div>
                  <h3 class="text-xl font-semibold text-gray-300 mb-2">Welcome to BarterUp Messages</h3>
                  <p class="text-gray-400 max-w-md">
                    Select a conversation from the sidebar to start chatting and arranging skill exchanges
                  </p>
                </div>
              </div>
            }
          >
            {(getContact) => {
              const contact = getContact();
              const key = contact.name;

              // Auto-scroll whenever selected contact changes or messages list updates
              createEffect(() => {
                // track dependencies
                messages();
                selectedContact();
                queueMicrotask(() => {
                  if (messagesContainer) {
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                  }
                });
              });

              return (
                <>
                  {/* Enhanced Chat Header */}
                  <header class="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 glass-strong">
                    <div class="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                      <button 
                        class="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                        onClick={() => setSelectedContact(null)}
                      >
                        <svg class="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                        </svg>
                      </button>
                      
                      <div class="flex items-center space-x-3 flex-1 min-w-0">
                        <div class="relative flex-shrink-0">
                          <img
                            src={contact.avatar}
                            alt={contact.name}
                            class="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-primary/30"
                          />
                          <div class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-400 rounded-full border-2 border-gray-900"></div>
                        </div>
                        <div class="flex-1 min-w-0">
                          <h2 class="font-semibold text-white text-base sm:text-lg truncate">{contact.name}</h2>
                          <p class="text-xs sm:text-sm text-gray-400 truncate">Active now</p>
                        </div>
                      </div>
                    </div>
                    
                    <div class="flex items-center space-x-1 sm:space-x-2">
                      {/* Desktop deselect button */}
                      <button
                        type="button"
                        class="hidden md:inline-flex p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Close conversation"
                        onClick={() => setSelectedContact(null)}
                      >
                        <svg class="w-4 h-4 text-gray-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      {/* Clear this conversation */}
                      <button
                        type="button"
                        class="p-1.5 sm:p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Clear this chat"
                        onClick={() => clearConversation(key)}
                      >
                        <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400 hover:text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      {/* Clear only my messages */}
                      <button
                        type="button"
                        class="p-1.5 sm:p-2 hover:bg-yellow-500/10 rounded-lg transition-colors"
                        title="Clear only my messages"
                        onClick={() => clearMyMessages(key)}
                      >
                        <svg class="w-4 h-4 text-yellow-400 hover:text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M4 6h16M4 10h16M4 18h16M4 14h3m13 0h-3" />
                        </svg>
                      </button>
                      {/* Clear all chats */}
                      <button
                        type="button"
                        class="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Clear ALL chats"
                        onClick={() => clearAllConversations()}
                      >
                        <svg class="w-4 h-4 text-red-400 hover:text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-7 4h8a2 2 0 002-2V7a2 2 0 00-2-2H8a2 2 0 00-2 2v8a2 2 0 002 2zm9 4H6" />
                        </svg>
                      </button>
                      <button class="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <svg class="w-5 h-5 text-gray-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                        </svg>
                      </button>
                      <button class="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <svg class="w-5 h-5 text-gray-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                        </svg>
                      </button>
                    </div>
                  </header>

                  {/* Enhanced Messages Area */}
                  <div class="flex-1 overflow-y-auto p-3 sm:p-6 space-y-2 sm:space-y-3" ref={el => messagesContainer = el}>
                    <For each={(messages()[key] || []) as Message[]}>
                      {(message) => (
                        <div class={`flex items-end gap-1.5 sm:gap-2 ${message.from === "me" ? "justify-end" : "justify-start"}`}>
                          {/* Avatar for received messages */}
                          {message.from === "them" && (
                            <div class="w-6 h-6 sm:w-8 sm:h-8 rounded-full chat-avatar flex-shrink-0 flex items-center justify-center">
                              <span class="text-xs font-semibold text-white">
                                {contact.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          
                          {/* Message bubble */}
                          <div class={`chat-bubble max-w-[280px] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 sm:py-3 rounded-2xl ${
                            message.from === "me"
                              ? "chat-bubble-sent rounded-br-md"
                              : "chat-bubble-received rounded-bl-md"
                          }`}>
                            <p class="text-xs sm:text-sm leading-relaxed font-medium">{message.text}</p>
                            <p class={`text-xs mt-1 sm:mt-1.5 opacity-75 ${
                              message.from === "me" ? "text-black/70" : "text-gray-200"
                            }`}>
                              {formatTime(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      )}
                    </For>
                  </div>

                  {/* Enhanced Message Input */}
                  <footer class="p-3 sm:p-4 border-t border-white/10 glass-strong">
                    <div class="flex items-center space-x-2 sm:space-x-3">
                      <button class="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0">
                        <svg class="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                        </svg>
                      </button>
                      
                      <div class="flex-1 relative">
                        <input
                          type="text"
                          placeholder="Type your message..."
                          value={drafts()[key] || ""}
                          onInput={(e) => {
                            const newDrafts = { ...drafts(), [key]: e.currentTarget.value };
                            setDrafts(newDrafts);
                            persistDrafts(newDrafts);
                          }}
                          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                          class="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 text-sm sm:text-base"
                        />
                      </div>
                      
                      <button 
                        onClick={handleSend}
                        class="btn btn-primary p-2.5 sm:p-3 rounded-xl flex-shrink-0"
                      >
                        <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                        </svg>
                      </button>
                    </div>
                  </footer>
                </>
              );
            }}
          </Show>
        </main>
      </div>
    </div>
  );
};

export default Messages;
