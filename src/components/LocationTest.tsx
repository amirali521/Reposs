import React, { useState, useEffect } from 'react';
import { MapPin, Globe, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

export function LocationTest() {
  const [location, setLocation] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [status, setStatus] = useState<'idle' | 'fetching' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const getPosition = () => {
    if (!navigator.geolocation) {
      setStatus('error');
      setErrorMsg('Geolocation not supported');
      return;
    }

    setStatus('fetching');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy
        });
        setStatus('success');
      },
      (err) => {
        console.error(err);
        setStatus('error');
        setErrorMsg(err.message || 'Location permission denied');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <Card className="hardware-card border-none overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <MapPin className="w-5 h-5 text-emerald-500" />
              Spatial Probe
            </CardTitle>
            <CardDescription className="mono-label mt-1">
              GPS & Positioning_v2
            </CardDescription>
          </div>
          <span className={status === 'success' ? 'emerald-badge' : status === 'error' ? 'rose-badge' : 'mono text-[10px] opacity-40 uppercase'}>
            {status}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-32 bg-black/40 rounded border border-dashed border-white/10 flex flex-col items-center justify-center overflow-hidden p-6 relative">
          {status === 'success' && location ? (
            <div className="w-full space-y-3">
              <div className="flex justify-between border-b border-white/5 pb-2 mono text-xs">
                <span className="opacity-50">LATITUDE</span>
                <span className="text-white">{location.lat.toFixed(6)}° N</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2 mono text-xs">
                <span className="opacity-50">LONGITUDE</span>
                <span className="text-white">{location.lng.toFixed(6)}° W</span>
              </div>
              <div className="flex justify-between mono text-xs">
                <span className="opacity-50">ALTITUDE</span>
                <span className="text-white">12.5m MSL</span>
              </div>
            </div>
          ) : status === 'fetching' ? (
            <div className="text-center space-y-2 animate-pulse">
               <Globe className="w-8 h-8 text-emerald-500 mx-auto animate-spin" style={{ animationDuration: '3s' }} />
               <p className="text-[10px] uppercase font-mono text-white/40 tracking-widest">Handshaking Satellites...</p>
            </div>
          ) : (
            <div className="text-center space-y-2">
               <MapPin className="w-8 h-8 text-white/5 mx-auto" />
               <p className="text-[10px] uppercase font-mono text-white/20 tracking-widest">Fix Lost / Searching</p>
            </div>
          )}

          {status === 'error' && (
            <div className="absolute inset-0 bg-rose-500/10 flex flex-col items-center justify-center p-4 text-center">
              <AlertCircle className="w-6 h-6 text-rose-500 mb-1" />
              <p className="font-mono text-[10px] text-rose-200">{errorMsg}</p>
            </div>
          )}
        </div>

        <Button 
          onClick={getPosition} 
          disabled={status === 'fetching'}
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-bold uppercase tracking-widest h-10 rounded-lg shadow-[0_10px_30px_rgba(16,185,129,0.1)]"
        >
          {status === 'fetching' ? 'Acquiring Fix...' : 'Resync Satellites'}
        </Button>
      </CardContent>
    </Card>
  );
}
