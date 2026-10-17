// Web Speech API Text-to-Speech Engine for NeuroCommerce AI

export class SpatialSpeechEngine {
  private static instance: SpatialSpeechEngine | null = null;
  private synthesis: SpeechSynthesis | null = null;
  private isMuted: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  private constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.synthesis = window.speechSynthesis;
      // Pre-warm voices list on Chromium
      if (typeof window.speechSynthesis.onvoiceschanged !== "undefined") {
        window.speechSynthesis.onvoiceschanged = () => {
          this.synthesis?.getVoices();
        };
      }
      // Load preference from localStorage
      const savedMute = localStorage.getItem("NEUROCOMMERCE_VOICE_MUTED");
      if (savedMute !== null) {
        this.isMuted = savedMute === "true";
      }
    }
  }

  public static getInstance(): SpatialSpeechEngine {
    if (!SpatialSpeechEngine.instance) {
      SpatialSpeechEngine.instance = new SpatialSpeechEngine();
    }
    return SpatialSpeechEngine.instance;
  }

  public speak(
    text: string,
    onStart?: () => void,
    onEnd?: () => void
  ) {
    if (!this.synthesis || this.isMuted || !text.trim()) {
      return;
    }

    try {
      this.stop();

      // Clean markdown tags or parenthetical notes from speech
      const cleanText = text
        .replace(/\(Notice:.*?\)/gi, "")
        .replace(/[#*_`]/g, "")
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.lang = "en-US";

      // Pick preferred natural voice
      const voices = this.synthesis.getVoices();
      const preferred = voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (v.name.includes("Natural") ||
            v.name.includes("Google") ||
            v.name.includes("Samantha") ||
            v.name.includes("Karen") ||
            v.name.includes("Daniel"))
      );
      if (preferred) {
        utterance.voice = preferred;
      }

      utterance.onstart = () => {
        if (onStart) onStart();
      };
      utterance.onend = () => {
        this.currentUtterance = null;
        if (onEnd) onEnd();
      };
      utterance.onerror = () => {
        this.currentUtterance = null;
        if (onEnd) onEnd();
      };

      this.currentUtterance = utterance;
      this.synthesis.speak(utterance);
    } catch (err) {
      console.warn("Speech synthesis notice:", err);
    }
  }

  public stop() {
    if (this.synthesis) {
      try {
        this.synthesis.cancel();
      } catch (e) {}
    }
    this.currentUtterance = null;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (typeof window !== "undefined") {
      localStorage.setItem("NEUROCOMMERCE_VOICE_MUTED", String(muted));
    }
    if (muted) {
      this.stop();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public isSpeaking(): boolean {
    return Boolean(this.synthesis && this.synthesis.speaking);
  }
}

export const speechEngine = SpatialSpeechEngine.getInstance();
