import React, { useState, useEffect, useRef } from 'react';
import { learningService, documentService } from '../services/api';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import type { UploadedDocument } from '../types';
import {
  Bot,
  Send,
  Sparkles,
  FileText,
  Copy,
  Check,
  RotateCcw,
  PlusCircle,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Cpu,
  Trash2,
  Code2,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{
    source_index: number;
    page_number: number;
    snippet: string;
    score: number;
  }>;
}

export const AILearningAssistant: React.FC = () => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<number | null>(null);
  const [expandedSources, setExpandedSources] = useState<Record<number, boolean>>({});
  const [lastFailedQuery, setLastFailedQuery] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const starterQuestions = [
    'Explain binary search in simple terms with code.',
    'What is the difference between supervised and unsupervised learning?',
    'Teach me React hooks with code examples.',
    'Generate a 12-week study plan for becoming a full-stack developer.',
    'Give me practice questions for Python with solutions.',
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const fetchInitialData = async () => {
    try {
      const [convRes, docRes] = await Promise.all([
        learningService.listConversations(),
        documentService.listDocuments(),
      ]);
      setConversations(convRes.data);
      setDocuments(docRes.data);
      if (convRes.data.length > 0) {
        selectConversation(convRes.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load chat data', err);
    }
  };

  const selectConversation = async (id: number) => {
    setActiveConvId(id);
    try {
      const res = await learningService.getConversation(id);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartNewChat = () => {
    setActiveConvId(null);
    setMessages([]);
    setInputQuery('');
    setLastFailedQuery(null);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || loading) return;

    setInputQuery('');
    setLastFailedQuery(null);

    const tempUserMsg: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content: query,
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const res = await learningService.sendChatMessage(
        query,
        activeConvId || undefined,
        selectedDocIds.length > 0 ? selectedDocIds : undefined
      );

      setActiveConvId(res.data.conversation_id);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: res.data.response,
          sources: res.data.sources || [],
        },
      ]);

      // Refresh conversations list
      const convListRes = await learningService.listConversations();
      setConversations(convListRes.data);
    } catch (err: any) {
      setLastFailedQuery(query);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: 'Sorry, I encountered an issue processing your question. Please verify your connection or click Retry.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyText = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const toggleSourceDrawer = (id: number) => {
    setExpandedSources((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Render markdown with formatted code blocks
  const renderFormattedMarkdown = (content: string) => {
    const blocks = content.split('\n\n');
    return blocks.map((block, i) => {
      // Code blocks
      if (block.startsWith('```') && block.endsWith('```')) {
        const lines = block.split('\n');
        const lang = lines[0].replace('```', '').trim() || 'code';
        const code = lines.slice(1, -1).join('\n');
        return (
          <div key={i} className="my-3 rounded-xl overflow-hidden border border-[#252A40] bg-[#0A0C16]">
            <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#141829] border-b border-[#252A40] text-[10px] font-mono text-gray-400">
              <span className="uppercase text-cyan-400 font-bold">{lang}</span>
              <button
                onClick={() => navigator.clipboard.writeText(code)}
                className="hover:text-white flex items-center space-x-1"
                title="Copy code"
              >
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </button>
            </div>
            <pre className="p-3 text-xs font-mono text-gray-200 overflow-x-auto custom-scrollbar">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      // Headers
      if (block.startsWith('### ')) {
        return (
          <h4 key={i} className="text-sm font-bold text-white mt-4 mb-2 flex items-center space-x-2">
            <span className="w-1.5 h-3.5 rounded-full bg-cyan-400 inline-block" />
            <span>{block.replace('### ', '')}</span>
          </h4>
        );
      }
      if (block.startsWith('#### ')) {
        return (
          <h5 key={i} className="text-xs font-bold text-violet-300 mt-3 mb-1">
            {block.replace('#### ', '')}
          </h5>
        );
      }

      // Bullet list
      if (block.startsWith('- ') || block.startsWith('* ')) {
        const items = block.split('\n');
        return (
          <ul key={i} className="my-2 space-y-1 pl-4 text-xs text-gray-300">
            {items.map((item, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-cyan-400 font-bold mt-1 text-xs">•</span>
                <span>{item.replace(/^[-*]\s*/, '')}</span>
              </li>
            ))}
          </ul>
        );
      }

      // Quotes / callouts
      if (block.startsWith('> ')) {
        return (
          <blockquote key={i} className="my-2 pl-3 border-l-2 border-violet-500 text-xs italic text-violet-200 bg-violet-950/20 py-1.5 rounded-r-lg">
            {block.replace(/^>\s*/, '')}
          </blockquote>
        );
      }

      // Regular text paragraph
      return (
        <p key={i} className="my-1.5 text-xs sm:text-sm text-gray-300 leading-relaxed whitespace-pre-line">
          {block}
        </p>
      );
    });
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-4 max-w-7xl mx-auto">
      
      {/* Left Sidebar: Conversations & Uploaded Documents */}
      <aside className="w-full lg:w-72 bg-[#111426] border border-[#252A40] rounded-2xl flex flex-col shrink-0 overflow-hidden">
        
        {/* New Chat Action */}
        <div className="p-3 border-b border-[#252A40]">
          <Button
            variant="primary"
            size="sm"
            className="w-full"
            onClick={handleStartNewChat}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            New Conversation
          </Button>
        </div>

        {/* Conversation History List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-gray-500">
            Recent Chats ({conversations.length})
          </div>

          {conversations.length === 0 ? (
            <div className="p-4 text-center text-xs text-gray-500">
              No previous chats found.
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = activeConvId === conv.id;
              return (
                <button
                  key={conv.id}
                  onClick={() => selectConversation(conv.id)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between group ${
                    isActive
                      ? 'bg-violet-600/20 text-violet-200 border border-violet-500/40 shadow-neon-violet'
                      : 'text-gray-400 hover:text-white hover:bg-[#141829]'
                  }`}
                >
                  <div className="flex items-center space-x-2 overflow-hidden pr-2">
                    <MessageSquare className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                    <span className="truncate">{conv.title || 'Conversation'}</span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono shrink-0">
                    {conv.message_count || 1}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Document Filter Drawer in Sidebar */}
        <div className="p-3 border-t border-[#252A40] bg-[#0D1020]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 flex items-center space-x-1">
              <FileText className="w-3 h-3 text-violet-400" />
              <span>Grounded Docs ({documents.length})</span>
            </span>
            {selectedDocIds.length > 0 && (
              <button
                onClick={() => setSelectedDocIds([])}
                className="text-[10px] text-violet-400 hover:underline"
              >
                Clear
              </button>
            )}
          </div>

          <div className="space-y-1 max-h-24 overflow-y-auto custom-scrollbar">
            {documents.length === 0 ? (
              <p className="text-[11px] text-gray-500">
                Upload PDFs in <Link to="/learning-library" className="text-violet-400 underline">Library</Link> for citations.
              </p>
            ) : (
              documents.map((doc) => {
                const isChecked = selectedDocIds.includes(doc.id);
                return (
                  <label
                    key={doc.id}
                    className="flex items-center space-x-2 text-[11px] text-gray-300 cursor-pointer hover:text-white"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        setSelectedDocIds((prev) =>
                          isChecked ? prev.filter((id) => id !== doc.id) : [...prev, doc.id]
                        );
                      }}
                      className="rounded border-[#252A40] bg-[#111426] text-violet-600 focus:ring-0 w-3 h-3"
                    />
                    <span className="truncate">{doc.filename}</span>
                  </label>
                );
              })
            )}
          </div>
        </div>

      </aside>

      {/* Main Chat Interface */}
      <main className="flex-1 bg-[#111426] border border-[#252A40] rounded-2xl flex flex-col overflow-hidden">
        
        {/* Chat Header */}
        <div className="px-6 py-3.5 border-b border-[#252A40] flex items-center justify-between bg-[#0D1020]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-400 p-0.5 shadow-neon-violet">
              <div className="w-full h-full bg-[#111426] rounded-[10px] flex items-center justify-center">
                <Bot className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <span>AI Technical Tutor</span>
                <Badge variant="cyan" size="sm">RAG Grounded</Badge>
              </h3>
              <p className="text-[11px] text-gray-400">
                Ask coding questions, explore algorithms, and ground answers in your uploaded materials.
              </p>
            </div>
          </div>

          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleStartNewChat}>
              Clear Chat
            </Button>
          )}
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
          {messages.length === 0 ? (
            /* Empty State & Starter Prompts */
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-violet-600/20 text-violet-400 flex items-center justify-center shadow-neon-violet">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="max-w-md space-y-2">
                <h4 className="text-base font-bold text-white">How can I help you learn today?</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  I can explain core computer science concepts, review code snippets, synthesize notes, and help you close specific skill gaps.
                </p>
              </div>

              {/* Starter Question Pills */}
              <div className="w-full max-w-xl space-y-2 pt-2">
                <span className="text-[11px] font-mono text-gray-500 uppercase tracking-wider block mb-2">
                  Suggested Prompts
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                  {starterQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(q)}
                      className="p-3 rounded-xl bg-[#0D1020] border border-[#252A40] hover:border-violet-500/50 hover:bg-[#141829] text-xs text-gray-300 hover:text-white transition-all line-clamp-2"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Live Message Bubbles */
            messages.map((msg) => {
              const isUser = msg.role === 'user';
              const hasSources = msg.sources && msg.sources.length > 0;
              const sourcesOpen = expandedSources[msg.id];

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-2xl rounded-2xl p-4 sm:p-5 shadow-lg text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-br-xs'
                        : 'bg-[#0D1020] border border-[#252A40] text-gray-200 rounded-bl-xs'
                    }`}
                  >
                    {!isUser ? (
                      <div>
                        {renderFormattedMarkdown(msg.content)}

                        {/* Citation Sources Drawer */}
                        {hasSources && (
                          <div className="mt-4 pt-3 border-t border-[#252A40]">
                            <button
                              onClick={() => toggleSourceDrawer(msg.id)}
                              className="text-[11px] font-semibold text-cyan-400 hover:underline flex items-center space-x-1"
                            >
                              <span>Grounded Sources ({msg.sources?.length})</span>
                              {sourcesOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>

                            {sourcesOpen && (
                              <div className="mt-2 space-y-1.5">
                                {msg.sources?.map((s) => (
                                  <div
                                    key={s.source_index}
                                    className="p-2.5 rounded-lg bg-[#111426] border border-[#252A40] text-[11px] text-gray-400"
                                  >
                                    <span className="font-semibold text-cyan-300 block mb-0.5">
                                      Source [{s.source_index}] • Page {s.page_number}
                                    </span>
                                    <p className="line-clamp-2 italic text-gray-300">"{s.snippet}"</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="whitespace-pre-line">{msg.content}</p>
                    )}
                  </div>

                  {/* Actions under Assistant Message (Copy & Retry) */}
                  {!isUser && (
                    <div className="flex items-center space-x-2 text-[11px] text-gray-500 pl-2">
                      <button
                        onClick={() => handleCopyText(msg.content, msg.id)}
                        className="hover:text-white flex items-center space-x-1 transition-colors"
                      >
                        {copiedMsgId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Answer</span>
                          </>
                        )}
                      </button>

                      {lastFailedQuery && (
                        <button
                          onClick={() => handleSendMessage(lastFailedQuery)}
                          className="hover:text-cyan-400 flex items-center space-x-1 transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Retry</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Assistant Loading Indicator */}
          {loading && (
            <div className="flex items-center space-x-2 p-4 bg-[#0D1020] border border-[#252A40] rounded-2xl max-w-xs text-xs text-gray-400">
              <Bot className="w-4 h-4 text-cyan-400 animate-spin" />
              <span>AI is thinking & referencing concepts...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Multiline Chat Input Area */}
        <div className="p-3 sm:p-4 border-t border-[#252A40] bg-[#0D1020]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-end gap-2"
          >
            <div className="relative flex-1">
              <textarea
                ref={textareaRef}
                rows={2}
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask technical question... (Enter to send, Shift+Enter for newline)"
                className="w-full bg-[#111426] text-xs sm:text-sm text-gray-100 placeholder-gray-500 rounded-xl p-3 pr-4 border border-[#252A40] focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/40 resize-none custom-scrollbar"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!inputQuery.trim() || loading}
              isLoading={loading}
              className="h-11 px-4 shrink-0"
              rightIcon={<Send className="w-4 h-4" />}
            >
              Send
            </Button>
          </form>
          <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono mt-1.5 px-1">
            <span>Press Enter to send, Shift + Enter for new line</span>
            <span>SkillMap AI Learning Engine</span>
          </div>
        </div>

      </main>

    </div>
  );
};
