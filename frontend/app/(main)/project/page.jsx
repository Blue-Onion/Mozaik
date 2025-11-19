"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";

const RANDOM_MESSAGES = [
  "Breaking equations...",
  "Summoning calculus demons...",
  "Aligning vectors...",
  "Rendering smooth transitions...",
  "Teaching Manim new tricks...",
  "Stirring Bézier curves...",
  "Tickling the integrals...",
];

export default function Page() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [messages, setMessages] = useState([]);
  const intervalRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, videoReady]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startLoading = () => {
    setIsLoading(true);
    setVideoReady(false);
    
    // Add user message to chat
    setMessages(prev => [...prev, { type: "user", content: prompt }]);

    // Start cycling random messages
    setLoadingText(pickRandom());
    intervalRef.current = window.setInterval(() => {
      setLoadingText(pickRandom());
    }, 2200);

    // Simulate generation time
    setTimeout(() => {
      setIsLoading(false);
      setVideoReady(true);
      if (intervalRef.current) clearInterval(intervalRef.current);
      
      // Add system message when video is ready
      setMessages(prev => [...prev, { 
        type: "system", 
        content: "Animation ready — preview it on the right." 
      }]);
    }, 10000);
  };

  const handleSend = () => {
    if (!prompt.trim()) return;
    startLoading();
    setPrompt("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-gradient-to-br from-white to-gray-50/50">
      {/* LEFT — Chat Panel */}
      <div className="flex flex-col h-screen border-r border-gray-200/60">
        <div className="p-6 pb-4 flex flex-col gap-4 flex-1">
          <header className="flex items-center justify-between">
            <Link href="/" className="group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-100">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-indigo-700 transition-all">
                  Mozaik
                </h1>
              </div>
            </Link>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white backdrop-blur-sm border border-gray-300 shadow-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">Ready</span>
            </div>
          </header>

          {/* Chat Container */}
          <div className="flex-1 flex flex-col rounded-2xl bg-white backdrop-blur-sm shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {/* Welcome Message */}
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Welcome to Mozaik</h3>
                  <p className="text-gray-500 text-sm max-w-sm mx-auto">
                    Describe your animation and I'll create it using Manim. Be specific about colors, timing, and mathematical concepts.
                  </p>
                </div>
              )}

              {/* Chat Messages */}
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                      message.type === "user"
                        ? "bg-gradient-to-br from-blue-500 to-indigo-500 text-white"
                        : "bg-gray-50 text-gray-800 border border-gray-200"
                    }`}
                  >
                    <div className="text-sm leading-relaxed">{message.content}</div>
                  </div>
                </div>
              ))}

              {/* Loading Message */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 shadow-sm border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      </div>
                      <span className="text-xs font-medium text-blue-600">Mozaik</span>
                    </div>
                    <div className="text-sm text-blue-800">{loadingText}</div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 bg-white/80">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 bg-white backdrop-blur-sm transition-all"
                    placeholder="Describe your animation (e.g., 'Animate the integration of x² from 0 to 1 with blue curve and shaded area')"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <kbd className="px-2 py-1 text-xs text-gray-400 bg-gray-100 rounded border border-gray-300">↵</kbd>
                  </div>
                </div>

                <button
                  onClick={handleSend}
                  disabled={isLoading || !prompt.trim()}
                  className="rounded-xl px-6 py-3 bg-gradient-to-br from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium shadow-lg shadow-blue-200 hover:shadow-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                      </svg>
                      <span>Send</span>
                    </>
                  )}
                </button>
              </div>
              <footer className="text-xs text-gray-400 mt-3 text-center">
                Tip: Mention specific colors, durations, and mathematical concepts for best results
              </footer>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT — Video Preview Panel */}
      <div className="flex flex-col h-screen bg-white">
        <div className="p-6 pb-4 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Preview</h2>
              <p className="text-gray-500 text-sm">Real-time animation output</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white backdrop-blur-sm border border-gray-300 shadow-sm">
              <div className={`w-2 h-2 rounded-full ${videoReady ? 'bg-green-500' : isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-sm font-medium text-gray-700">
                {videoReady ? 'Ready' : isLoading ? 'Generating' : 'Waiting'}
              </span>
            </div>
          </div>

          {/* Video Container */}
          <div className="flex-1 flex flex-col rounded-2xl overflow-hidden bg-white shadow-lg border border-gray-200">
            {/* Video Content Area */}
            <div className="flex-1 flex items-center justify-center p-6">
              {!videoReady && !isLoading && (
                <div className="text-center max-w-md">
                  <div className="w-20 h-20 bg-linear-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-gray-200 shadow-sm">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No Animation Yet</h3>
                  <p className="text-gray-500 text-sm">
                    Your animation will appear here once generated. Describe what you want to see in the chat panel.
                  </p>
                </div>
              )}

              {!videoReady && isLoading && (
                <div className="w-full max-w-4xl">
                  <div className="flex flex-col lg:flex-row gap-6 p-4">
                    {/* Video Skeleton */}
                    <div className="flex-1">
                      <div className="skeleton-video rounded-xl overflow-hidden relative bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300">
                        <div className="video-shimmer absolute inset-0" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="flex justify-center mb-4">
                              <div className="flex space-x-2">
                                <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse"></div>
                                <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                              </div>
                            </div>
                            <div className="text-gray-700 font-semibold text-lg">{loadingText}</div>
                            <div className="text-gray-500 text-sm mt-2">This usually takes 10-30 seconds</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mt-4 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div className="progress-shimmer h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                      </div>
                    </div>

                    {/* Metadata Skeleton */}
                    <div className="lg:w-80 flex-shrink-0 space-y-4">
                      <div className="h-12 rounded-xl skeleton" />
                      <div className="h-8 rounded-xl skeleton" />
                      <div className="h-24 rounded-xl skeleton" />
                      <div className="space-y-2">
                        <div className="h-10 rounded-lg skeleton" />
                        <div className="h-10 rounded-lg skeleton" />
                        <div className="h-10 rounded-lg skeleton" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {videoReady && (
                <div className="w-full max-w-4xl">
                  <div className="rounded-xl overflow-hidden shadow-xl bg-black border border-gray-300">
                    <video
                      src="/output.mp4"
                      controls
                      autoPlay
                      className="w-full h-auto max-h-[480px] object-contain"
                    />
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex-1">
                      <div className="text-lg font-semibold text-gray-800">Your Animation</div>
                      <div className="text-gray-500 text-sm">Generated from your prompt</div>
                    </div>
                    <div className="flex gap-3">
                      <button className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-white transition-all flex items-center gap-2 bg-white">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                      </button>
                      <button className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white transition-all flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Global Styles */}
      <style jsx global>{`
        .skeleton {
          position: relative;
          overflow: hidden;
          background: linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%);
        }

        .skeleton::after {
          content: "";
          position: absolute;
          left: -150px;
          top: 0;
          height: 100%;
          width: 150px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
          animation: shimmer 1.5s infinite;
        }

        .skeleton-video {
          height: 400px;
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
        }

        .video-shimmer::after {
          content: "";
          position: absolute;
          left: -150px;
          top: 0;
          height: 100%;
          width: 150px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent);
          animation: shimmer 2s infinite;
        }

        .progress-shimmer {
          animation: progress 2s ease-in-out infinite;
        }

        @keyframes shimmer {
          0% { transform: translateX(0); }
          100% { transform: translateX(1000px); }
        }

        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(1000px); }
        }
      `}</style>
    </div>
  );
}

function pickRandom() {
  return RANDOM_MESSAGES[Math.floor(Math.random() * RANDOM_MESSAGES.length)];
}