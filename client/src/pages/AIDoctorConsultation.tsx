import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Stethoscope, Send, Bot, User, AlertTriangle, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';
import { aiApi } from '@/services/api';
import type { DoctorConsultationResponse } from '@/types';
import { SafetyDisclaimer } from '@/components/common/SafetyDisclaimer';

interface Message {
  id: string;
  sender: 'user' | 'doctor';
  text: string;
  timestamp: string;
  urgencyLevel?: 'normal' | 'caution' | 'emergency';
  suggestedActions?: string[];
}

export function AIDoctorConsultation() {
  const location = useLocation();
  const state = (location.state as {
    medicineName?: string;
    harmfulReason?: string;
    interactionDetails?: string;
    addictionRisk?: string;
  }) || {};

  const [medicineName, setMedicineName] = useState(state.medicineName || '');
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Initialize with initial consultation if navigated with context
  useEffect(() => {
    const initialQuery = state.harmfulReason || state.interactionDetails || state.addictionRisk
      ? `I need advice regarding ${state.medicineName || 'this medicine'} which has been flagged.`
      : '';

    if (state.medicineName || initialQuery) {
      handleConsultation(
        initialQuery || `What safety precautions should I know about ${state.medicineName}?`,
        state.medicineName,
        state.harmfulReason,
        state.interactionDetails,
        state.addictionRisk
      );
    } else {
      // Welcome message
      setMessages([
        {
          id: 'welcome',
          sender: 'doctor',
          text: 'Hello! I am your **MediShield Online AI Doctor Assistant**. How can I help you today? You can ask me about harmful medicines, drug interactions, side effects, or safety guidelines.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          urgencyLevel: 'normal',
          suggestedActions: [
            'Is this medicine safe with my existing prescription?',
            'What should I do if I suspect a fake or harmful medicine?',
            'What are common emergency reaction warning signs?',
          ],
        },
      ]);
    }
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleConsultation = async (
    queryText: string,
    medName?: string,
    harmful?: string,
    interaction?: string,
    addiction?: string
  ) => {
    if (!queryText.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);
    setError(null);

    try {
      const res: DoctorConsultationResponse = await aiApi.consultDoctor({
        medicineName: medName || medicineName || undefined,
        userQuery: queryText,
        harmfulReason: harmful || state.harmfulReason,
        interactionDetails: interaction || state.interactionDetails,
        addictionRisk: addiction || state.addictionRisk,
      });

      const doctorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'doctor',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        urgencyLevel: res.urgencyLevel,
        suggestedActions: res.suggestedActions,
      };

      setMessages((prev) => [...prev, doctorMsg]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Consultation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleConsultation(inputQuery);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600 shadow-sm">
              <Stethoscope className="h-6 w-6" />
            </div>
            Online AI Doctor Assistant
          </h1>
          <p className="page-subtitle">
            Instant AI medical consultation & guidance for harmful, suspicious, or high-risk medications.
          </p>
        </div>

        {medicineName && (
          <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs text-amber-800 font-medium">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            Consulting on: <span className="font-bold">{medicineName}</span>
          </div>
        )}
      </div>

      <SafetyDisclaimer />

      {/* Main Chat Container */}
      <div className="card overflow-hidden flex flex-col h-[620px] border border-slate-200 shadow-lg rounded-2xl bg-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-primary-950 to-slate-900 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-white font-bold">
                <Stethoscope className="h-5 w-5" />
              </div>
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-slate-900" />
            </div>
            <div>
              <h2 className="font-semibold text-sm sm:text-base flex items-center gap-2">
                Dr. MediShield AI
                <span className="rounded bg-primary-500/30 px-2 py-0.5 text-[10px] uppercase font-bold text-primary-200 border border-primary-400/30">
                  Assistant
                </span>
              </h2>
              <p className="text-xs text-slate-300">24/7 Pharmacology & Harmful Medicine Consultant</p>
            </div>
          </div>

          <button
            onClick={() => {
              setMessages([]);
              setMedicineName('');
            }}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            New Consultation
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white text-xs font-semibold shadow-sm ${
                  msg.sender === 'user' ? 'bg-slate-800' : 'bg-primary-600'
                }`}
              >
                {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              <div className="space-y-2 flex-1 min-w-0">
                <div
                  className={`rounded-2xl px-4 py-3 text-sm shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-primary-600 text-white rounded-tr-none'
                      : msg.urgencyLevel === 'emergency'
                      ? 'bg-red-50 border-2 border-red-300 text-red-950 rounded-tl-none'
                      : msg.urgencyLevel === 'caution'
                      ? 'bg-amber-50 border border-amber-300 text-amber-950 rounded-tl-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                  }`}
                >
                  <div className="whitespace-pre-line leading-relaxed font-sans">{msg.text}</div>

                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="mt-3 border-t border-slate-200/80 pt-3">
                      <p className="text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5 text-primary-500" />
                        Suggested Actions:
                      </p>
                      <ul className="space-y-1">
                        {msg.suggestedActions.map((act, idx) => (
                          <li
                            key={idx}
                            onClick={() => handleConsultation(act)}
                            className="text-xs text-primary-700 bg-primary-50 hover:bg-primary-100 p-2 rounded-lg cursor-pointer flex items-center gap-1.5 transition font-medium border border-primary-200/60"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 text-primary-600 shrink-0" />
                            {act}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <span className={`block text-[10px] mt-2 text-right ${msg.sender === 'user' ? 'text-primary-100' : 'text-slate-400'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 mr-auto">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white shadow-sm">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 text-sm text-slate-500 flex items-center gap-2 shadow-sm">
                <div className="h-2 w-2 rounded-full bg-primary-500 animate-bounce" />
                <div className="h-2 w-2 rounded-full bg-primary-500 animate-bounce [animation-delay:0.2s]" />
                <div className="h-2 w-2 rounded-full bg-primary-500 animate-bounce [animation-delay:0.4s]" />
                <span className="text-xs ml-1">Analyzing pharmacology records...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200 space-y-3">
          {/* Quick Prompts */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 font-medium shrink-0">Quick Ask:</span>
            {[
              'What should I do if this medicine is suspicious?',
              'Is it safe with alcohol or blood pressure meds?',
              'How to report counterfeit medicine?',
            ].map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleConsultation(prompt)}
                className="shrink-0 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 font-medium transition"
              >
                {prompt}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask the Online AI Doctor about medicine safety, symptoms, or harmful risks..."
              className="input-field flex-1 text-sm py-2.5"
            />
            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="btn-primary py-2.5 px-5 shrink-0"
            >
              <Send className="h-4 w-4" />
              Send
            </button>
          </form>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
