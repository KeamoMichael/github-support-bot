import React, { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message, Agent, RateLimitState } from '../types';
import { Loader2, Send, Paperclip, X, ArrowRight } from 'lucide-react';
import { RateLimitNotification } from './RateLimitNotification';

interface ResponseCardProps {
  agent: Agent;
  messages: Message[];
  isLoading: boolean;
  onSend: (message: string, files: File[]) => void;
  inputText: string;
  setInputText: (text: string) => void;
  rateLimitState: RateLimitState;
}

export const ResponseCard: React.FC<ResponseCardProps> = ({
  agent,
  messages,
  isLoading,
  onSend,
  inputText,
  setInputText,
  rateLimitState
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, previews, agent]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files) as File[];
      setSelectedFiles(prev => [...prev, ...newFiles]);

      const newPreviews: string[] = [];
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = () => {
    if (inputText.trim() || selectedFiles.length > 0) {
      onSend(inputText, selectedFiles);
      setSelectedFiles([]);
      setPreviews([]);
    }
  };

  const isSendReady = (inputText.trim().length > 0 || selectedFiles.length > 0) && !isLoading && !rateLimitState.isLimited;

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] bg-[#F5F5F5] text-gray-800 shadow-inner border border-white h-full flex flex-col transition-all duration-500">
      {/* Header inside card */}
      <div className="px-8 py-5 border-b border-gray-200 flex justify-between items-center bg-white/50 backdrop-blur-sm z-10 transition-colors duration-500">
        <div className="flex items-center gap-4">
          <div className={`relative transition-all duration-500 ${agent.isTriage ? 'scale-90' : 'scale-100'}`}>
            <img src={agent.avatar} alt={agent.name} className="w-12 h-12 rounded-full bg-gray-200 object-cover border-2 border-white shadow-sm" />
            {!agent.isTriage && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full animate-pulse"></span>
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-gray-900 leading-tight flex items-center gap-2">
              {agent.name}
              {agent.isTriage && <span className="text-[10px] bg-gray-200 px-2 py-0.5 rounded-full text-gray-600 font-normal tracking-wide">INTAKE</span>}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">{agent.role}</span>
              {!agent.isTriage && (
                <>
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  <span className="px-1.5 py-0.5 bg-green-100 rounded text-[10px] text-green-700 font-bold tracking-wider">LIVE</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="hidden md:flex gap-4 text-xs text-gray-400 font-medium uppercase tracking-wider">
          <span>{agent.isTriage ? 'Routing...' : 'RAG Enabled'}</span>
          <span>Docs v.Latest</span>
        </div>
      </div>

      {/* Chat Area - min-h-0 allows flex child to shrink and scroll properly */}
      <div className="flex-1 min-h-0 overflow-y-auto p-8 space-y-6 scroll-smooth custom-scrollbar" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 animate-in fade-in duration-700">
            <div className={`w-24 h-24 rounded-full bg-white flex items-center justify-center mb-6 shadow-sm ring-4 ring-gray-100 ${agent.isTriage ? 'p-4' : ''}`}>
              <img src={agent.avatar} alt="Agent" className={`opacity-90 ${agent.isTriage ? 'w-full h-full object-contain' : 'w-16 h-16'}`} />
            </div>
            <p className="text-xl font-bold text-gray-800 mb-2">
              {agent.isTriage ? `Hi! I'm ${agent.name}, your Support Guide.` : `Hello! I'm ${agent.name}.`}
            </p>
            <p className="text-sm max-w-sm text-center leading-relaxed text-gray-500">
              {agent.isTriage
                ? "Welcome to GitHub Expert Support! I'm here to help you navigate our platform and connect you with the right specialist. What brings you here today?"
                : `I specialize in ${agent.description}. How can I help you today?`}
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className="flex items-end gap-2 max-w-[85%] min-w-0">
                {msg.role === 'model' && !msg.isSystemMessage && (
                  <img src={agent.avatar} className="w-8 h-8 rounded-full mb-1 border border-white shadow-sm flex-shrink-0" />
                )}

                {msg.isSystemMessage ? (
                  <div className="flex items-center gap-2 text-xs text-gray-500 my-4 w-full justify-center bg-gray-200/50 py-1.5 px-4 rounded-full border border-gray-200">
                    <ArrowRight size={12} />
                    <span className="break-words">{msg.content}</span>
                  </div>
                ) : (
                  <div
                    className={`rounded-2xl p-5 text-sm leading-relaxed shadow-sm break-words overflow-wrap-anywhere overflow-hidden min-w-0
                            ${msg.role === 'user'
                        ? 'bg-black text-white rounded-br-none'
                        : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                      }`}
                  >
                    {/* Display attachments for user messages if any */}
                    {msg.role === 'user' && msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {msg.attachments.map((att, i) => (
                          <div key={i} className="relative rounded-lg overflow-hidden border border-gray-700">
                            <img
                              src={`data:${att.mimeType};base64,${att.data}`}
                              alt="Attachment"
                              className="h-32 w-auto object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {msg.role === 'model' ? (
                      <div className="markdown-content">
                        <ReactMarkdown
                          components={{
                            code({ node, className, children, ...props }) {
                              const match = /language-(\w+)/.exec(className || '')
                              return match ? (
                                <div className="my-3 rounded-lg overflow-hidden bg-gray-900 border border-gray-800 shadow-md">
                                  <div className="px-3 py-1.5 bg-gray-800 text-[10px] text-gray-400 border-b border-gray-700 flex justify-between items-center uppercase font-bold tracking-wider">
                                    <span>{match[1]}</span>
                                  </div>
                                  <code className={`${className} block p-4 text-xs overflow-x-auto font-mono text-gray-300`} {...props}>
                                    {children}
                                  </code>
                                </div>
                              ) : (
                                <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono text-pink-600 font-semibold" {...props}>
                                  {children}
                                </code>
                              )
                            },
                            p: ({ children }) => <p className="mb-3 last:mb-0 break-words">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc pl-4 mb-3 space-y-1 marker:text-gray-400">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal pl-4 mb-3 space-y-1 marker:text-gray-400">{children}</ol>,
                            h1: ({ children }) => <h1 className="text-lg font-bold mb-2 mt-4 text-gray-900 break-words">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-base font-bold mb-2 mt-3 text-gray-900 break-words">{children}</h2>,
                            a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500 underline underline-offset-2 break-all">{children}</a>
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                )}
              </div>
              {!msg.isSystemMessage && (
                <span className="text-[10px] text-gray-400 mt-2 px-1 font-medium select-none">
                  {msg.role === 'user' ? 'You' : agent.name} • {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex items-start gap-3 animate-pulse">
            <img src={agent.avatar} className="w-8 h-8 rounded-full mt-1 opacity-50 border border-white" />
            <div className="bg-white text-gray-500 rounded-2xl rounded-bl-none p-4 flex items-center gap-3 border border-gray-100 shadow-sm">
              <Loader2 className="animate-spin text-gray-400" size={16} />
              <span className="text-xs font-medium tracking-wide">
                {agent.isTriage ? "Analyzing request..." : "Consulting Knowledge Base..."}
              </span>
            </div>
          </div>
        )}

        {/* Rate Limit Notification */}
        <RateLimitNotification rateLimitState={rateLimitState} />
      </div>

      {/* Input Area - Rounded at bottom to match container */}
      <div className="p-5 bg-white border-t border-gray-200 rounded-b-[2.5rem]">
        {/* Preview Area */}
        {previews.length > 0 && (
          <div className="flex gap-3 mb-4 overflow-x-auto pb-2 scrollbar-none">
            {previews.map((src, idx) => (
              <div key={idx} className="relative group flex-shrink-0">
                <img src={src} alt="Preview" className="h-14 w-14 object-cover rounded-lg border border-gray-200 shadow-sm" />
                <button
                  onClick={() => removeFile(idx)}
                  className="absolute -top-2 -right-2 bg-black text-white border border-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0 flex items-center justify-center w-12 h-12 bg-black text-white rounded-full hover:bg-gray-800 transition-all duration-200 shadow-md"
            title="Attach image"
          >
            <Paperclip size={20} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*"
            multiple
          />

          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                rateLimitState.isLimited
                  ? "Rate limit reached - please wait..."
                  : agent.isTriage
                    ? "Describe your issue (e.g. 'I need help with billing')..."
                    : `Ask ${agent.name} about ${agent.description.split(',')[0]}...`
              }
              className={`w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 rounded-full py-3.5 pl-6 pr-14 focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all text-sm shadow-inner ${rateLimitState.isLimited ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              disabled={isLoading || rateLimitState.isLimited}
            />
            <button
              onClick={handleSend}
              disabled={!isSendReady}
              className={`absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300
                        ${isSendReady
                  ? 'bg-black text-white shadow-md hover:scale-110'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
            >
              <Send size={18} fill={isSendReady ? "white" : "currentColor"} className={isSendReady ? "ml-0.5" : ""} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};