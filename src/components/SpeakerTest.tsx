import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Phone, Music, CheckCircle2, Play, Square, Settings2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { cn } from '../lib/utils';

export function SpeakerTest() {
  const [activeMode, setActiveMode] = useState<'idle' | 'media' | 'call'>('idle');
  const [deviceConfig, setDeviceConfig] = useState<'single' | 'stereo' | 'dedicated'>('single');
  const [availableOutputs, setAvailableOutputs] = useState<MediaDeviceInfo[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);

  useEffect(() => {
    // Detect audio output devices
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then(devices => {
        const outputs = devices.filter(d => d.kind === 'audiooutput');
        setAvailableOutputs(outputs);
        
        // Logical detection: If there are multiple outputs, assume dedicated earpiece/speakers
        if (outputs.length > 1) {
          setDeviceConfig('dedicated');
        } else if (window.screen.width < 500) { // Simple mobile check
          setDeviceConfig('single');
        } else {
          setDeviceConfig('stereo');
        }
      });
    }
  }, []);

  const playTone = async (mode: 'media' | 'call') => {
    setActiveMode(mode);
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }

    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') await ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (mode === 'media') {
      // Full rich sound for main speakers
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
    } else {
      // Filtered sound for earpiece simulation
      osc.type = 'square'; // Buzzier
      osc.frequency.setValueAtTime(1000, ctx.currentTime); // High pitch communication freq
      gain.gain.setValueAtTime(0.1, ctx.currentTime); // Much quieter
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1000;
      filter.Q.value = 5; // Very narrow
      osc.connect(filter);
      filter.connect(gain);
    }

    if (mode === 'media') {
      osc.connect(gain);
    }
    
    gain.connect(ctx.destination);
    osc.start();
    oscillatorRef.current = osc;
  };

  const stopTone = () => {
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current.disconnect();
    }
    setActiveMode('idle');
  };

  return (
    <Card className="hardware-card border-none overflow-hidden h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <Volume2 className="w-5 h-5 text-emerald-500" />
              Acoustic Output
            </CardTitle>
            <CardDescription className="mono-label mt-1">
              Transducer_Verification_v2
            </CardDescription>
          </div>
          <span className="mono text-[10px] text-emerald-500/60 uppercase tracking-widest bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1.5">
             {deviceConfig} Array <span className="opacity-40 text-[9px] tabular-nums">[{availableOutputs.length}]</span>
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col">
        <div className="flex-1 bg-black/40 rounded border border-dashed border-white/10 p-6 flex flex-col items-center justify-center relative overflow-hidden">
           <div className="relative">
              <div className={cn(
                "w-24 h-24 rounded-full border-2 border-white/5 flex items-center justify-center transition-all duration-500",
                activeMode !== 'idle' ? "scale-110 border-emerald-500/20" : ""
              )}>
                 {activeMode === 'call' ? (
                   <Phone className={cn("w-8 h-8", activeMode === 'call' ? "text-emerald-500" : "text-white/20")} />
                 ) : (
                   <Music className={cn("w-8 h-8", activeMode === 'media' ? "text-emerald-500" : "text-white/20")} />
                 )}
              </div>
              
              {activeMode !== 'idle' && (
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-full h-full rounded-full border border-emerald-500 animate-ping opacity-20" />
                </div>
              )}
           </div>

           <div className="mt-8 text-center space-y-1">
              <p className="text-[10px] font-mono text-white/40 uppercase tracking-[0.2em]">
                 {activeMode === 'idle' ? 'Select Output Vector' : `${activeMode.toUpperCase()} CHANNEL ENGAGED`}
              </p>
              {availableOutputs.length > 1 && (
                <p className="text-[8px] font-mono text-emerald-500/40">{availableOutputs.length} Output Nodes Enumerated</p>
              )}
           </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
           <Button 
             onClick={() => activeMode === 'media' ? stopTone() : playTone('media')}
             disabled={activeMode === 'call'}
             className={cn(
               "h-14 flex flex-col gap-1 transition-all rounded-xl border border-transparent",
               activeMode === 'media' ? "bg-white/10 border-white/20 text-white" : "bg-emerald-500 hover:bg-emerald-400 text-black"
             )}
           >
              {activeMode === 'media' ? <Square className="w-3 h-3" /> : <Music className="w-3 h-3" />}
              <span className="text-[9px] font-bold uppercase tracking-widest">Multimedia</span>
           </Button>

           <Button 
             onClick={() => activeMode === 'call' ? stopTone() : playTone('call')}
             disabled={activeMode === 'media'}
             className={cn(
               "h-14 flex flex-col gap-1 transition-all rounded-xl border border-transparent",
               activeMode === 'call' ? "bg-white/10 border-white/20 text-white" : "bg-blue-500 hover:bg-blue-400 text-white"
             )}
           >
              {activeMode === 'call' ? <Square className="w-3 h-3" /> : <Phone className="w-3 h-3" />}
              <span className="text-[9px] font-bold uppercase tracking-widest">Call Earpiece</span>
           </Button>
        </div>

        <div className="bg-white/5 border border-white/5 rounded-lg p-3 flex items-center gap-3">
           <Settings2 className="w-4 h-4 text-emerald-500 opacity-50" />
           <p className="text-[8px] font-mono text-white/40 leading-relaxed uppercase">
              {deviceConfig === 'single' 
                ? "Unified Speaker detected. System handles both functions via shared hardware." 
                : "Dedicated Call Module detected. Verify isolation between top/bottom transducers."}
           </p>
        </div>
      </CardContent>
    </Card>
  );
}
