import { Mic, Send, MessageSquare, Plus, Trash2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { api } from '../../api';

function parseSSEStream(reader, { onAnswer, onStatus, onReasoning, onDone, onError }) {
  const decoder = new TextDecoder();
  let buffer = '';

  function processLines() {
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;

      try {
        const event = JSON.parse(trimmed.slice(6));

        if (event.type === 'answer') {
          onAnswer(event.content || '');
        }

        if (event.type === 'status') {
          onStatus(event.content || '');
        }

        if (event.type === 'reasoning') {
          onReasoning?.(event.content || '');
        }

        if (event.type === 'done') {
          onDone(event.conversation_id || null);
          return true;
        }
      } catch {
        // Skip malformed events
      }
    }
    return false;
  }

  return reader.read().then(function pump({ done, value }) {
    if (done) {
      onDone(null);
      return;
    }

    buffer += decoder.decode(value, { stream: true });
    const finished = processLines();

    if (finished) return;

    return reader.read().then(pump);
  }).catch((err) => {
    onError(err);
  });
}

export function AIQueryInterface() {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [error, setError] = useState(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [reasoningContent, setReasoningContent] = useState('');
  const [showReasoning, setShowReasoning] = useState(false);

  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    api.getConversations().then((data) => {
      setConversations(data || []);
      setIsLoadingConversations(false);
    }).catch(() => {
      setIsLoadingConversations(false);
    });
  }, []);

  const loadConversation = useCallback(async (id) => {
    setError(null);
    setActiveConversationId(id);
    setMessages([]);
    try {
      const data = await api.getConversationMessages(id);
      const flat = (data || []).flatMap((m) => [
        ...(m.user ? [{ role: 'user', content: m.user }] : []),
        ...(m.assistant ? [{ role: 'assistant', content: m.assistant }] : []),
      ]);
      setMessages(flat);
    } catch {
      setError('Failed to load conversation messages.');
    }
  }, []);

  const handleNewChat = useCallback(() => {
    setActiveConversationId(null);
    setMessages([]);
    setStreamingContent('');
    setError(null);
    setStatusMessage('');
    setReasoningContent('');
    setShowReasoning(false);
  }, []);

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || isStreaming) return;

    setInputText('');
    setError(null);
    setStatusMessage('');
    setReasoningContent('');
    setShowReasoning(false);

    const userMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setIsStreaming(true);
    setStreamingContent('');

    try {
      const res = await api.chatStream(text, activeConversationId);

      if (!res) {
        setError('Authentication error. Please log in again.');
        setIsStreaming(false);
        return;
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setError(errData.detail || errData.message || `Request failed (${res.status})`);
        setIsStreaming(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setError('No response stream available.');
        setIsStreaming(false);
        return;
      }

      abortRef.current = reader;

      let assistantContent = '';

      await parseSSEStream(reader, {
        onAnswer: (content) => {
          assistantContent += content;
          setStreamingContent(assistantContent);
        },
        onStatus: (content) => {
          setStatusMessage(content);
        },
        onReasoning: (content) => {
          setReasoningContent((prev) => prev + content);
        },
        onDone: (conversationId) => {
          setIsStreaming(false);
          setStreamingContent('');
          setStatusMessage('');

          if (assistantContent) {
            setMessages((prev) => [...prev, { role: 'assistant', content: assistantContent }]);
          }

          if (conversationId) {
            setActiveConversationId(conversationId);
            api.getConversations().then((data) => {
              setConversations(data || []);
            }).catch(() => {});
          }
        },
        onError: (err) => {
          setIsStreaming(false);
          setStatusMessage('');
          setError(err.message || 'Stream error occurred.');
          if (assistantContent) {
            setMessages((prev) => [...prev, { role: 'assistant', content: assistantContent }]);
          }
        },
      });
    } catch (err) {
      setIsStreaming(false);
      if (err.name !== 'AbortError') {
        setError(err.message || 'Failed to send message.');
      }
    }
  }, [inputText, isStreaming, activeConversationId]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleDeleteConversation = useCallback(async (id, e) => {
    e.stopPropagation();
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) {
      handleNewChat();
    }
  }, [activeConversationId, handleNewChat]);

  return (
    <div className="rounded-lg shadow-md overflow-hidden pb-3" style={{
      background: 'linear-gradient(168.52deg, rgba(255, 122, 88, 0.41) 0%, rgb(255, 122, 88) 75.273%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)',
      boxShadow: '2px 2px 6px rgba(0, 0, 0, 0.19)',
    }}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 mx-[2%] mt-3">
        <button
          onClick={() => setShowSidebar((s) => !s)}
          className="flex items-center gap-1 px-2 md:px-3 py-1.5 rounded-md bg-white/30 hover:bg-white/50 transition-colors text-[10px] md:text-xs font-poppins text-text-primary"
          title={showSidebar ? 'Hide conversations' : 'Show conversations'}
        >
          {showSidebar ? <ChevronLeft size={12} className="md:size-[14]" /> : <ChevronRight size={12} className="md:size-[14]" />}
          <MessageSquare size={12} className="md:size-[14]" />
          <span className="hidden md:inline">Conversations</span>
        </button>

        <button
          onClick={handleNewChat}
          className="flex items-center gap-1 px-2 md:px-3 py-1.5 rounded-md bg-white/30 hover:bg-white/50 transition-colors text-[10px] md:text-xs font-poppins text-text-primary ml-auto"
          title="New conversation"
        >
          <Plus size={12} className="md:size-[14]" />
          <span className="hidden md:inline">New Chat</span>
        </button>
      </div>

      <div className="mx-[2%] mt-2 flex flex-col md:flex-row gap-2">
        {/* Sidebar — full-width strip on mobile, side panel on desktop */}
        {showSidebar && (
          <div className="w-full md:w-[30%] shrink-0 bg-white/70 rounded-lg p-2 max-h-[30vh] md:max-h-[60vh] overflow-y-auto order-first">
            <div className="flex items-center justify-between md:hidden mb-1">
              <span className="text-[10px] font-poppins font-medium text-text-secondary">Conversations</span>
              <button
                onClick={() => setShowSidebar(false)}
                className="p-0.5 rounded hover:bg-white/60 transition-colors"
              >
                <ChevronLeft size={12} />
              </button>
            </div>
            {isLoadingConversations ? (
              <div className="flex items-center justify-center py-3">
                <Loader2 size={14} className="animate-spin text-text-secondary" />
              </div>
            ) : conversations.length === 0 ? (
              <p className="text-[10px] font-poppins text-text-secondary text-center py-3">
                No conversations yet
              </p>
            ) : (
              <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-1 md:pb-0">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => {
                      loadConversation(conv.id);
                    }}
                    className={`shrink-0 md:w-full text-left flex items-center gap-1 px-2 py-1.5 rounded text-[10px] font-poppins transition-colors whitespace-nowrap md:whitespace-normal ${
                      activeConversationId === conv.id
                        ? 'bg-white/80 text-text-primary font-medium'
                        : 'text-text-secondary hover:bg-white/50'
                    }`}
                  >
                    <MessageSquare size={10} className="shrink-0" />
                    <span className="truncate max-w-[80px] md:max-w-none flex-1">{conv.title || conv.id.slice(0, 8)}</span>
                    <button
                      onClick={(e) => handleDeleteConversation(conv.id, e)}
                      className="opacity-0 hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-white/60"
                      title="Delete conversation"
                    >
                      <Trash2 size={10} />
                    </button>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Main Chat Area */}
        <div className="flex-1 min-w-0">
          {/* Messages */}
          <div className="bg-white rounded-lg p-[4%] md:p-5 min-h-[35vh] md:min-h-[40vh] max-h-[60vh] md:max-h-[70vh] overflow-y-auto">
            {messages.length === 0 && !isStreaming ? (
              <div className="flex items-center justify-center h-full py-[15%]">
                <p className="font-poppins text-xs md:text-sm text-text-secondary text-center">
                  {activeConversationId
                    ? 'Select a conversation or start a new chat'
                    : 'Ask a question about your revenue cycle data'}
                </p>
              </div>
            ) : (
              <div className="space-y-4 md:space-y-5">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[90%] md:max-w-[80%] rounded-lg px-[3%] md:px-4 py-2 md:py-3 font-poppins text-xs md:text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-primary-muted text-text-primary rounded-tr-sm'
                          : 'bg-surface-muted text-text-secondary prose prose-sm max-w-none'
                      }`}
                    >
                      {msg.role === 'user' ? msg.content : (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                      )}
                    </div>
                  </div>
                ))}

                {/* Status indicator (progress bar style) */}
                {isStreaming && statusMessage && !streamingContent && (
                  <div className="flex justify-start">
                    <div className="rounded-lg px-[3%] md:px-4 py-2 md:py-3 font-poppins text-xs md:text-sm bg-surface-muted text-text-secondary flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin shrink-0" />
                      <span>{statusMessage}</span>
                    </div>
                  </div>
                )}

                {/* Streaming answer */}
                {isStreaming && streamingContent && (
                  <div className="flex justify-start">
                    <div className="max-w-[90%] md:max-w-[80%] rounded-lg px-[3%] md:px-4 py-2 md:py-3 font-poppins text-xs md:text-sm leading-relaxed bg-surface-muted text-text-secondary prose prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{streamingContent}</ReactMarkdown>
                      <span className="inline-block w-1 h-4 md:w-1.5 md:h-5 bg-primary-light animate-pulse ml-1 rounded-sm align-middle" />
                    </div>
                  </div>
                )}

                {/* Waiting cursor when streaming but no content yet */}
                {isStreaming && !streamingContent && !statusMessage && (
                  <div className="flex justify-start">
                    <div className="rounded-lg px-[3%] md:px-4 py-2 md:py-3 font-poppins text-xs md:text-sm bg-surface-muted text-text-secondary flex items-center gap-2">
                      <span className="inline-block w-1.5 h-4 md:w-2 md:h-5 bg-primary-light animate-pulse rounded-sm align-middle" />
                    </div>
                  </div>
                )}

                {/* Collapsible reasoning block */}
                {reasoningContent && (
                  <div className="flex justify-start">
                    <div className="max-w-[90%] md:max-w-[80%] rounded-lg px-[3%] md:px-4 py-2 md:py-3 font-poppins text-[11px] md:text-xs bg-surface-muted/50 text-text-secondary border border-surface-border">
                      <button
                        onClick={() => setShowReasoning((s) => !s)}
                        className="flex items-center gap-1.5 text-primary-light hover:text-primary transition-colors"
                      >
                        <ChevronRight size={12} className={`transition-transform ${showReasoning ? 'rotate-90' : ''}`} />
                        {showReasoning ? 'Hide' : 'Show'} reasoning
                      </button>
                      {showReasoning && (
                        <pre className="mt-2 whitespace-pre-wrap font-poppins text-[10px] md:text-[11px] leading-relaxed text-text-secondary max-h-[300px] overflow-y-auto">
                          {reasoningContent}
                        </pre>
                      )}
                    </div>
                  </div>
                )}

                <div />
              </div>
            )}

            {error && (
              <div className="mt-2 p-[2%] md:p-2 rounded bg-danger-light/50 border border-danger-accent/30">
                <p className="font-poppins text-[9px] md:text-[10px] text-danger-dark">{error}</p>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="mt-3 md:mt-4">
            <div
              className="flex items-center gap-2 md:gap-3 rounded-xl px-[3%] md:px-4 py-2 md:py-3"
              style={{
                background: 'rgba(255, 255, 255, 0.3)',
                boxShadow: '0.5px 0.5px 1px rgba(0, 0, 0, 0.25)',
              }}
            >
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent outline-none font-poppins text-xs md:text-[15px] text-text-primary leading-tight placeholder:text-text-primary/70"
                placeholder="Ask a question..."
                disabled={isStreaming}
                aria-label="AI query input"
              />
              <button
                onClick={handleSend}
                disabled={isStreaming || !inputText.trim()}
                className="p-1.5 md:p-2 rounded-md hover:bg-white/20 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                {isStreaming ? (
                  <Loader2 size={18} className="md:size-[20] animate-spin text-text-primary" />
                ) : (
                  <Send size={18} className="md:size-[20] text-text-primary" />
                )}
              </button>
              <button
                className="p-1.5 md:p-2 rounded-md hover:bg-white/20 transition-colors cursor-pointer"
                aria-label="Voice input"
              >
                <Mic size={18} className="md:size-[20] text-text-primary" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
