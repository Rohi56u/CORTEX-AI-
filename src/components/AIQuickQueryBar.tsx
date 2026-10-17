"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Send, Sparkles, Volume2, VolumeX, RotateCcw } from "lucide-react";
import { speechEngine } from "@/lib/speechSynthesis";

interface AIQuickQueryBarProps {
  onSearchQuery: (query: string) => void;
  isProcessing?: boolean;
  voiceSummary?: string;
}

export default function AIQuickQueryBar({
  onSearchQuery,
  isProcessing = false,
  voiceSummary = "",
}: AIQuickQueryBarProps) {
  const [queryText, setQueryText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isVoiceMuted, setIsVoiceMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const speechRecognitionRef = useRef<any>(null);

  useEffect(() => {
    setIsVoiceMuted(speechEngine.getMuted());

    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setQueryText(transcript);
            onSearchQuery(transcript);
          }
          setIsListening(false);
        };

        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        speechRecognitionRef.current = recognition;
      }
    }
  }, [onSearchQuery]);

  const toggleMic = () => {
    if (!speechRecognitionRef.current) {
      alert("Speech recognition is not supported in this browser. You can type directly.");
      return;
    }

    if (isListening) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
    } else {
      try {
        speechRecognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn("Speech start notice:", err);
      }
    }
  };

  const handleToggleVoice = () => {
    const nextMute = !isVoiceMuted;
    speechEngine.setMuted(nextMute);
    setIsVoiceMuted(nextMute);
  };

  const handleReplayVoice = () => {
    if (voiceSummary) {
      setIsSpeaking(true);
      speechEngine.speak(
        voiceSummary,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (queryText.trim()) {
      onSearchQuery(queryText.trim());
      setQueryText("");
    }
  };

  const quickPrompts = [
    "Modern Leather",
    "Scandinavian Dining",
    "Warm Ambient Lamp",
    "Curved Velvet Sofa",
    "Under $600",
  ];

  return (
    <div className="w-full max-w-xl mx-auto px-2 pointer-events-auto transition-all duration-300">
      <div className="bg-slate-900/85 backdrop-blur-2xl border border-slate-700/70 hover:border-cyan-500/50 rounded-2xl shadow-2xl p-1.5 sm:p-2 transition-all">
        {/* Main Input Form */}
        <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
          {/* AI Voice Toggle Icon */}
          <button
            type="button"
            onClick={handleToggleVoice}
            className={`p-2 rounded-xl transition-all active:scale-95 cursor-pointer ${
              isVoiceMuted
                ? "bg-slate-800 text-slate-500 hover:text-slate-300"
                : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
            }`}
            title={isVoiceMuted ? "Unmute AI Voice Agent" : "Mute AI Voice Agent"}
          >
            {isVoiceMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* Replay Voice Summary Button */}
          {voiceSummary && !isVoiceMuted && (
            <button
              type="button"
              onClick={handleReplayVoice}
              className={`p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all active:scale-95 cursor-pointer ${
                isSpeaking ? "animate-pulse text-cyan-300" : ""
              }`}
              title="Speak AI Reasoning Aloud"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Text Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              placeholder="Ask AI: 'Show velvet sofa', 'Find dining set'..."
              className="w-full pl-3 pr-2 py-1.5 rounded-xl bg-slate-950/70 border border-slate-700/60 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-cyan-400/80 transition-colors"
            />
          </div>

          {/* Mic Button */}
          <button
            type="button"
            onClick={toggleMic}
            className={`p-2 rounded-xl border transition-all active:scale-95 cursor-pointer ${
              isListening
                ? "bg-rose-500 text-white border-rose-400 animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.5)]"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700/60"
            }`}
            title={isListening ? "Listening... Speak now" : "Speak to AI"}
          >
            {isListening ? <Mic className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          </button>

          {/* Submit Search Button */}
          <button
            type="submit"
            disabled={isProcessing}
            className="p-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-md"
            title="Ask AI"
          >
            {isProcessing ? (
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
          </button>
        </form>

        {/* Quick Suggestion Pills (Expandable or on focus) */}
        {isExpanded && (
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 pb-0.5 px-1 scrollbar-none animate-in fade-in slide-in-from-top-1">
            <span className="text-[9px] font-mono text-slate-500 shrink-0">Try:</span>
            {quickPrompts.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setQueryText(p);
                  onSearchQuery(p);
                }}
                className="px-2 py-0.5 rounded-lg bg-slate-800/80 hover:bg-cyan-950/60 hover:border-cyan-500/40 border border-slate-700/60 text-[10px] font-mono text-slate-300 hover:text-cyan-300 whitespace-nowrap transition-all cursor-pointer"
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
