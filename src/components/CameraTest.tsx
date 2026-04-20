import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCcw, CheckCircle2, AlertCircle, FlipHorizontal, Video, Square, Play, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from "motion/react";

export function CameraTest() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording' | 'review'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoBlobUrl, setVideoBlobUrl] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(devices => {
      const videoDevices = devices.filter(d => d.kind === 'videoinput');
      setDevices(videoDevices);
    });
  }, []);

  const startTest = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      setStatus('testing');
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: facingMode } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStatus('success');
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Camera access denied');
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
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setVideoBlobUrl(url);
      setRecordingStatus('review');
      
      // Auto-Wipe Timer (Simulation)
      setTimeout(() => {
        wipeData();
      }, 30000); // 30s auto-wipe
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
    if (videoBlobUrl) {
      URL.revokeObjectURL(videoBlobUrl);
      setVideoBlobUrl(null);
    }
    setRecordingStatus('idle');
    chunksRef.current = [];
  };

  const toggleCamera = () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);
    if (status === 'success') {
      navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: newMode } 
      }).then(ms => {
        if (stream) stream.getTracks().forEach(track => track.stop());
        setStream(ms);
        if (videoRef.current) videoRef.current.srcObject = ms;
      });
    }
  };

  const stopTest = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    wipeData();
    setStatus('idle');
  };

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
      if (videoBlobUrl) URL.revokeObjectURL(videoBlobUrl);
    };
  }, [stream, videoBlobUrl]);

  return (
    <Card className="hardware-card border-none overflow-hidden h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <Camera className="w-5 h-5 text-emerald-500" />
              Vision Sensor
            </CardTitle>
            <CardDescription className="mono-label mt-1">
              Live Hardware Stream: {facingMode === 'user' ? 'FacePort_0' : 'Global_Lens_1'}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={status === 'success' ? 'emerald-badge' : status === 'error' ? 'rose-badge' : 'mono text-[10px] opacity-40 uppercase'}>
              {status}
            </span>
            {devices.length > 1 && recordingStatus === 'idle' && (
               <button onClick={toggleCamera} title="Flip Lens" className="p-2 bg-white/5 rounded-lg text-emerald-500 hover:bg-emerald-500/10 transition-all border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                  <FlipHorizontal className="w-4 h-4" />
               </button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col">
        <div className="relative aspect-video bg-black/40 rounded border border-dashed border-white/10 flex items-center justify-center overflow-hidden flex-1">
          {recordingStatus === 'review' && videoBlobUrl ? (
            <video 
              src={videoBlobUrl} 
              autoPlay 
              controls 
              className="w-full h-full object-cover"
            />
          ) : status === 'success' && stream ? (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center p-6 space-y-4">
              <div className="w-16 h-16 border border-white/10 rounded-full flex items-center justify-center mx-auto opacity-20">
                <div className="w-8 h-8 border-2 border-emerald-500 rounded-full opacity-50 animate-pulse"></div>
              </div>
              <p className="text-[10px] uppercase font-mono text-white/30 text-center tracking-widest">
                 {status === 'testing' ? 'Handshaking Sensor...' : 'Awaiting initialization'}
              </p>
            </div>
          )}
          
          <AnimatePresence>
            {recordingStatus === 'recording' && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute top-4 left-4 flex items-center gap-2 bg-rose-500/80 backdrop-blur px-3 py-1 rounded-full border border-rose-400"
              >
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Recording Source</span>
              </motion.div>
            )}
          </AnimatePresence>

          {recordingStatus === 'review' && (
             <div className="absolute top-4 right-4 bg-emerald-500/80 backdrop-blur px-3 py-1 rounded-full text-[9px] font-bold text-black uppercase tracking-widest">
                Review: Auto-Wipe in 30s
             </div>
          )}

          {status === 'error' && (
            <div className="absolute inset-0 bg-rose-500/10 flex flex-col items-center justify-center p-4 text-center">
              <AlertCircle className="w-8 h-8 text-rose-500 mb-2" />
              <p className="font-mono text-xs text-rose-200">{errorMsg}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {status === 'idle' || status === 'error' ? (
            <Button 
              onClick={startTest} 
              className="col-span-2 bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-bold uppercase tracking-widest h-10 rounded-lg"
            >
              Test Camera
            </Button>
          ) : (
            <>
              {recordingStatus === 'idle' ? (
                <Button 
                  onClick={startRecording}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-bold uppercase tracking-widest h-10 rounded-lg"
                >
                  <Video className="w-3 h-3 mr-2" />
                  Test Record
                </Button>
              ) : recordingStatus === 'recording' ? (
                <Button 
                  onClick={stopRecording}
                  className="bg-rose-500 hover:bg-rose-400 text-white text-[10px] font-bold uppercase tracking-widest h-10 rounded-lg shadow-lg shadow-rose-500/20"
                >
                  <Square className="w-3 h-3 mr-2" />
                  Stop & Review
                </Button>
              ) : (
                <Button 
                  onClick={wipeData}
                  className="bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest h-10 rounded-lg"
                >
                  <Trash2 className="w-3 h-3 mr-2" />
                  Wipe Memory
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
