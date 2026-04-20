import React, { useState, useRef, useEffect } from 'react';
import { Mic, CheckCircle2, AlertCircle, Activity, Square, Play, Trash2, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from "motion/react";

export function MicrophoneTest() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording' | 'review'>('idle');
  const [audioLevel, setAudioLevel] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
  
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startTest = async () => {
    try {
      setStatus('testing');
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(mediaStream);
      
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(mediaStream);
      const analyzer = audioContext.createAnalyser();
      analyzer.fftSize = 256;
      source.connect(analyzer);
      analyzerRef.current = analyzer;

      const updateLevel = () => {
        const dataArray = new Uint8Array(analyzer.frequencyBinCount);
        analyzer.getByteFrequencyData(dataArray);
        
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        setAudioLevel(average / 128);
        
        rafRef.current = requestAnimationFrame(updateLevel);
      };
      
      updateLevel();
      setStatus('success');
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Microphone access denied');
    }
  };

  const startRecording = () => {
    if (!stream) return;
    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      const url = URL.createObjectURL(blob);
      setAudioBlobUrl(url);
      setRecordingStatus('review');
      
      setTimeout(() => wipeData(), 30000);
    };
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setRecordingStatus('recording');
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const wipeData = () => {
    if (audioBlobUrl) {
      URL.revokeObjectURL(audioBlobUrl);
      setAudioBlobUrl(null);
    }
    setRecordingStatus('idle');
    chunksRef.current = [];
  };

  const stopTest = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    wipeData();
    setStatus('idle');
    setAudioLevel(0);
  };

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (audioBlobUrl) URL.revokeObjectURL(audioBlobUrl);
    };
  }, [stream, audioBlobUrl]);

  return (
    <Card className="hardware-card border-none overflow-hidden h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <Mic className="w-5 h-5 text-emerald-500" />
              Audio Array
            </CardTitle>
            <CardDescription className="mono-label mt-1">
              Acoustic Spectrograph_01
            </CardDescription>
          </div>
          <span className={status === 'success' ? 'emerald-badge' : status === 'error' ? 'rose-badge' : 'mono text-[10px] opacity-40 uppercase'}>
            {status}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col">
        <div className="flex-1 bg-black/40 rounded border border-dashed border-white/10 flex flex-col items-center justify-center overflow-hidden p-6 relative">
          {recordingStatus === 'review' && audioBlobUrl ? (
             <div className="w-full space-y-4 text-center">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                   <Play className="w-6 h-6 text-emerald-500" />
                </div>
                <audio src={audioBlobUrl} controls className="w-full h-8" />
                <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest animate-pulse">Auto-Wipe in 30s</p>
             </div>
          ) : status === 'success' ? (
            <div className="w-full space-y-4">
               <div className="flex justify-between items-end gap-1 h-12">
                {Array.from({ length: 40 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="bg-emerald-500/20 w-full border-t border-emerald-500/50 transition-all duration-75"
                    style={{ 
                      height: `${Math.max(10, (Math.random() * 20) + (audioLevel * 80))}%`,
                      borderColor: audioLevel > 0.8 ? '#f43f5e' : '#10B981'
                    }}
                  />
                ))}
              </div>
              <div className="flex justify-between mono text-[10px] uppercase opacity-60">
                <span>MIC_IN_SYNC</span>
                <span className={audioLevel > 0.8 ? "text-rose-400 animate-pulse" : "text-emerald-400"}>
                   {recordingStatus === 'recording' ? "BUFFERING..." : (audioLevel > 0.8 ? "PEAK DETECT" : "GAIN NORM")}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-2">
               <Activity className="w-8 h-8 text-white/5 mx-auto" />
               <p className="text-[10px] uppercase font-mono text-white/20 tracking-widest">Listening for Input...</p>
            </div>
          )}

          <AnimatePresence>
            {recordingStatus === 'recording' && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="absolute top-2 right-2 flex items-center gap-2 bg-rose-500/20 border border-rose-500/40 px-2 py-1 rounded text-[8px] font-bold text-rose-400 uppercase tracking-widest"
              >
                Recording
              </motion.div>
            )}
          </AnimatePresence>

          {status === 'error' && (
            <div className="absolute inset-0 bg-rose-500/10 flex flex-col items-center justify-center p-4 text-center">
              <AlertCircle className="w-6 h-6 text-rose-500 mb-1" />
              <p className="font-mono text-[10px] text-rose-200">{errorMsg}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {status === 'idle' || status === 'error' ? (
            <Button 
              onClick={startTest} 
              className="col-span-2 bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-bold uppercase tracking-widest h-10 rounded-lg"
            >
              Test Microphone
            </Button>
          ) : (
            <>
              {recordingStatus === 'idle' ? (
                <Button 
                  onClick={startRecording}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-bold uppercase tracking-widest h-10 rounded-lg"
                >
                  <Activity className="w-3 h-3 mr-2" />
                  Capture Sample
                </Button>
              ) : recordingStatus === 'recording' ? (
                <Button 
                  onClick={stopRecording}
                  className="bg-rose-500 hover:bg-rose-400 text-white text-[10px] font-bold uppercase tracking-widest h-10 rounded-lg"
                >
                  <Square className="w-3 h-3 mr-2" />
                  Stop Sample
                </Button>
              ) : (
                <Button 
                  onClick={wipeData}
                  className="bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest h-10 rounded-lg"
                >
                  <Trash2 className="w-3 h-3 mr-2" />
                  Wipe Audio
                </Button>
              )}
              <Button 
                onClick={stopTest} 
                variant="outline" 
                className="border-white/10 hover:bg-white/5 text-[10px] font-bold uppercase tracking-widest h-10 rounded-lg"
              >
                Terminate
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
