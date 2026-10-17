"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { PageHeader } from "@/components/layout/app-header";
import { Icon } from "@/components/ui/icon";
import { useSignedInSession } from "@/features/auth/session-context";
import { askAssistant, MAX_QUESTION_LENGTH, SUGGESTED_QUESTIONS, type AssistantReply } from "@/features/assistant/assistant";
import { useSpeechInput } from "@/features/assistant/use-speech-input";
import { roleShortLabel } from "@/features/roles/roles";
import { cn } from "@/lib/cn";
import { getRepository } from "@/lib/data/repositories";
import { wibDayKey } from "@/lib/format";

type Message = { id: number; from: "user"; text: string } | { id: number; from: "assistant"; reply: AssistantReply };

export function AssistantChat() {
  const { role } = useSignedInSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const nextId = useRef(1);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const speech = useSpeechInput(useCallback((text: string) => setDraft(text), []));

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, thinking]);

  async function send(question: string) {
    const text = question.trim();
    if (!text || thinking) return;
    setMessages((m) => [...m, { id: nextId.current++, from: "user", text }]);
    setDraft("");
    setThinking(true);
    try {
      const reply = await askAssistant(text, { role, today: wibDayKey(new Date()), repo: getRepository() });
      setMessages((m) => [...m, { id: nextId.current++, from: "assistant", reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { id: nextId.current++, from: "assistant", reply: { kind: "unknown", text: "Maaf, terjadi gangguan. Coba lagi sebentar." } },
      ]);
    } finally {
      setThinking(false);
      inputRef.current?.focus();
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    void send(draft);
  }

  return (
    <div className="flex h-dvh flex-col">
      <div className="border-b border-line">
        <PageHeader
          title="Tanya Serupa"
          subtitle={`Menjawab sesuai izin role ${roleShortLabel(role)}`}
          backHref="/beranda"
        />
      </div>

      <div role="log" aria-live="polite" aria-label="Percakapan" className="flex flex-1 flex-col gap-3.5 overflow-y-auto px-4 py-4">
        {messages.length === 0 && <Intro />}
        {messages.map((m) =>
          m.from === "user" ? (
            <div key={m.id} className="max-w-[80%] self-end rounded-[18px] rounded-br-[4px] bg-primary px-3.5 py-3 text-[14.5px] text-primary-on">
              {m.text}
            </div>
          ) : (
            <AssistantBubble key={m.id} reply={m.reply} />
          ),
        )}
        {thinking && (
          <div className="flex gap-1.5 self-start rounded-[18px] border border-line bg-surface px-4 py-3" aria-label="Sedang menjawab">
            {[0, 1, 2].map((i) => (
              <span key={i} className="size-[7px] animate-bounce rounded-full bg-primary" style={{ animationDelay: `${i * 120}ms` }} />
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="flex gap-2 overflow-x-auto px-4 pt-2.5">
        {SUGGESTED_QUESTIONS.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => void send(q)}
            disabled={thinking}
            className="min-h-10 flex-none rounded-full border border-line-strong bg-surface px-3.5 text-[13px] text-ink"
          >
            {q}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="pb-safe flex items-center gap-2 px-4 pt-2.5">
        <label htmlFor="pertanyaan" className="sr-only">
          Tulis pertanyaan
        </label>
        <input
          ref={inputRef}
          id="pertanyaan"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={MAX_QUESTION_LENGTH}
          placeholder="Tanya soal KO, stok, SPK…"
          autoComplete="off"
          enterKeyHint="send"
          className="h-[50px] min-w-0 flex-1 rounded-full border border-line-strong bg-surface px-[18px] text-[15px] placeholder:text-ink-muted"
        />
        {speech.supported && (
          <button
            type="button"
            aria-label={speech.listening ? "Berhenti merekam" : "Bicara"}
            aria-pressed={speech.listening}
            onClick={speech.listening ? speech.stop : speech.start}
            className={cn(
              "flex size-[50px] flex-none items-center justify-center rounded-full border",
              speech.listening ? "border-danger bg-danger-soft text-danger-ink" : "border-line-strong bg-surface text-ink",
            )}
          >
            <Icon name="mic" size={20} />
          </button>
        )}
        <button
          type="submit"
          aria-label="Kirim"
          disabled={!draft.trim() || thinking}
          className="flex size-[50px] flex-none items-center justify-center rounded-full bg-primary text-primary-on disabled:opacity-50"
        >
          <Icon name="send" size={20} />
        </button>
      </form>
    </div>
  );
}

function Intro() {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-[#1F2D4D] text-[#E8C79E]">
        <Icon name="sparkle" size={28} />
      </span>
      <p className="font-bold">Tanya data perusahaan dengan bahasa sehari-hari</p>
      <p className="text-sm text-ink-muted text-pretty">
        Jawaban hanya dari data yang boleh kamu lihat, selalu dengan sumber. Kalau datanya tidak ada, aku bilang “Belum ada data”.
      </p>
    </div>
  );
}

function AssistantBubble({ reply }: { reply: AssistantReply }) {
  const refused = reply.kind === "refused";
  return (
    <div className="flex max-w-[88%] flex-col gap-2 self-start">
      <div className="flex gap-2.5 whitespace-pre-line rounded-[18px] rounded-bl-[4px] border border-line bg-surface p-3.5 text-[14.5px] leading-relaxed">
        {refused && <Icon name="lock" size={20} className="mt-0.5 flex-none text-accent-ink" />}
        <div className="flex flex-col gap-1.5">
          <span>{reply.text}</span>
          {refused && reply.suggestion && <span className="text-[13px] text-ink-soft">{reply.suggestion}</span>}
        </div>
      </div>
      {(reply.kind === "answer" || reply.kind === "no_data") && reply.sources.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Sumber">
          {reply.sources.map((s) => (
            <li key={s.label} className="rounded-full bg-primary-soft px-2.5 py-1 font-mono text-xs font-semibold text-primary">
              Sumber: {s.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
