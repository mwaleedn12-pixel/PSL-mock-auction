"use client";

import React, { useState } from "react";
import { soundEngine } from "@/lib/audio";
import { Volume2, VolumeX, Mic, MicOff } from "lucide-react";

export const AudioToggle: React.FC = () => {
  const [soundOn, setSoundOn] = useState<boolean>(soundEngine.isEnabled());
  const [voiceOn, setVoiceOn] = useState<boolean>(soundEngine.isVoiceEnabled());

  const toggleSound = () => {
    const next = !soundOn;
    soundEngine.setEnabled(next);
    setSoundOn(next);
    if (next) soundEngine.playBidSound();
  };

  const toggleVoice = () => {
    const next = !voiceOn;
    soundEngine.setVoiceEnabled(next);
    setVoiceOn(next);
    if (next) soundEngine.speakAnnouncement("Voice announcer active");
  };

  return (
    <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-700/60 rounded-full px-2 py-1 text-xs">
      <button
        onClick={toggleSound}
        title={soundOn ? "Mute Auction Sounds" : "Unmute Auction Sounds"}
        className={`p-1.5 rounded-full transition-colors ${
          soundOn
            ? "text-emerald-400 hover:bg-emerald-500/20"
            : "text-slate-500 hover:bg-slate-800"
        }`}
      >
        {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
      </button>

      <div className="w-[1px] h-3.5 bg-slate-700" />

      <button
        onClick={toggleVoice}
        title={voiceOn ? "Turn off Voice Announcer" : "Turn on Voice Announcer"}
        className={`p-1.5 rounded-full transition-colors ${
          voiceOn
            ? "text-amber-400 hover:bg-amber-500/20"
            : "text-slate-500 hover:bg-slate-800"
        }`}
      >
        {voiceOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
      </button>
    </div>
  );
};
