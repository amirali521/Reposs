import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Cpu, Smartphone, Monitor, Info, Database } from 'lucide-react';

export function SystemInfo() {
  const [info, setInfo] = useState<{
    device: string;
    cores: number;
    ram: string;
    os: string;
    osVersion: string;
    gpu: string;
    engine: string;
    cpuModel: string;
    screen: string;
    storage: string;
  }>({
    device: 'Detecting...',
    cores: 0,
    ram: 'N/A',
    os: 'N/A',
    osVersion: 'N/A',
    gpu: 'Identifying...',
    engine: 'N/A',
    cpuModel: 'Analyzing...',
    screen: '0x0',
    storage: 'Analyzing...'
  });

  useEffect(() => {
    const ua = navigator.userAgent;
    
    // 1. GPU Detection via WebGL
    let gpu = 'Standard Graphics';
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          gpu = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        }
      }
    } catch (e) {
      console.warn('GPU Detection Failed');
    }

    // 2. CPU Vendor Inference
    let cpuModel = 'Unknown SoC';
    if (/Snapdragon|Adreno/i.test(gpu) || /Snapdragon/i.test(ua)) cpuModel = 'Qualcomm Snapdragon';
    else if (/Mali|MT\d+|Dimensity/i.test(gpu) || /MediaTek/i.test(ua)) cpuModel = 'MediaTek Dimensity/Helio';
    else if (/Apple/i.test(gpu) || /iPhone|iPad|Macintosh/i.test(ua)) {
      if (/Macintosh/i.test(ua)) cpuModel = 'Apple Silicon / Intel Core';
      else cpuModel = 'Apple A-Series Bionic';
    }
    else if (/Intel/i.test(gpu) || /Intel/i.test(ua)) cpuModel = 'Intel Core / Xeon';
    else if (/AMD|Radeon/i.test(gpu) || /AMD/i.test(ua)) cpuModel = 'AMD Ryzen / EPYC';
    else if (/Exynos/i.test(gpu) || /Exynos/i.test(ua)) cpuModel = 'Samsung Exynos';
    else if (/Bionic/i.test(ua)) cpuModel = 'Apple Bionic';

    // 3. OS and Version Parsing
    let os = 'Unknown';
    let osVersion = 'N/A';
    
    if (/Windows/i.test(ua)) {
      os = 'Windows';
      const match = ua.match(/Windows NT ([\d.]+)/);
      if (match) {
        const ver = match[1];
        if (ver === '10.0') osVersion = '10/11';
        else if (ver === '6.3') osVersion = '8.1';
        else if (ver === '6.2') osVersion = '8';
        else if (ver === '6.1') osVersion = '7';
        else osVersion = ver;
      }
    } else if (/Android/i.test(ua)) {
      os = 'Android';
      const match = ua.match(/Android ([\d.]+)/);
      osVersion = match ? match[1] : 'N/A';
    } else if (/iPhone|iPad|iPod/i.test(ua)) {
      os = 'iOS';
      const match = ua.match(/OS ([\d_]+)/);
      osVersion = match ? match[1].replace(/_/g, '.') : 'N/A';
    } else if (/Mac/i.test(ua)) {
      os = 'macOS';
      const match = ua.match(/Mac OS X ([\d_]+)/);
      osVersion = match ? match[1].replace(/_/g, '.') : 'N/A';
    } else if (/Linux/i.test(ua)) {
      os = 'Linux';
    }

    // 4. Device Type
    let deviceType = 'Desktop';
    if (/tablet|ipad|playbook|silk/i.test(ua)) deviceType = 'Tablet';
    else if (/Mobile|Android|iP(hone|od)/i.test(ua)) deviceType = 'Smartphone';

    // 5. Memory & Cores
    // @ts-ignore
    const ram = navigator.deviceMemory ? `${navigator.deviceMemory}GB` : '>=4GB';
    const cores = navigator.hardwareConcurrency || 4;

    // 6. Storage (ROM) Inference
    let storage = 'Unknown';
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then(estimate => {
        if (estimate.quota) {
           // Quota is usually a portion of disk. On most systems we can infer capacity.
           const quotaGB = estimate.quota / 1024 / 1024 / 1024;
           let capacity = 'N/A';
           if (quotaGB > 400) capacity = '512GB';
           else if (quotaGB > 200) capacity = '256GB';
           else if (quotaGB > 100) capacity = '128GB';
           else if (quotaGB > 50) capacity = '64GB';
           else if (quotaGB > 25) capacity = '32GB';
           else capacity = `${Math.round(quotaGB * 1.5)}GB Approx`; // Loose estimate
           
           setInfo(prev => ({ ...prev, storage: capacity }));
        }
      });
    }

    setInfo(prev => ({
      ...prev,
      device: deviceType,
      cores,
      ram,
      os,
      osVersion,
      gpu,
      engine: navigator.vendor || 'Blink/V8',
      cpuModel,
      screen: `${window.screen.width}x${window.screen.height}`
    }));
  }, []);

  return (
    <Card className="hardware-card border-none overflow-hidden h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl flex items-center gap-3 text-white">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                {info.device === 'Smartphone' ? <Smartphone className="w-5 h-5 text-emerald-500" /> : <Monitor className="w-5 h-5 text-emerald-500" />}
              </div>
              Kernel Environment
            </CardTitle>
            <CardDescription className="mono-label mt-1 text-[10px] opacity-50 tracking-widest">
              L4_HARDWARE_EVALUATION_REPORT
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-1">
             <span className="emerald-badge">Online</span>
             <span className="text-[8px] font-mono opacity-30 uppercase">Secure_Link</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {/* Section 1: OS & Identity */}
           <div className="space-y-3 bg-black/30 p-4 rounded-xl border border-white/5">
              <p className="text-[9px] font-mono text-emerald-500/60 uppercase tracking-widest mb-2 flex items-center gap-2">
                 <Info className="w-3 h-3" /> System Identity
              </p>
              <div className="space-y-2 font-mono text-[11px]">
                <div className="flex justify-between border-b border-white/5 pb-1.5">
                  <span className="opacity-40">Operating System</span>
                  <span className="text-white font-medium">{info.os} {info.osVersion}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1.5">
                  <span className="opacity-40">Device Storage (ROM)</span>
                  <span className="text-emerald-400 font-bold">{info.storage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-40">Display Matrix</span>
                  <span className="text-white">{info.screen} @{window.devicePixelRatio}x</span>
                </div>
              </div>
           </div>

           {/* Section 2: Compute Resources */}
           <div className="space-y-3 bg-black/30 p-4 rounded-xl border border-white/5">
              <p className="text-[9px] font-mono text-emerald-500/60 uppercase tracking-widest mb-2 flex items-center gap-2">
                 <Cpu className="w-3 h-3" /> Compute Resources
              </p>
              <div className="space-y-2 font-mono text-[11px]">
                <div className="flex justify-between border-b border-white/5 pb-1.5">
                  <span className="opacity-40">Processor SoC</span>
                  <span className="text-emerald-400 font-medium">{info.cpuModel}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1.5">
                  <span className="opacity-40">Core Topology</span>
                  <span className="text-white">{info.cores} Virtual Cores</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-40">Total RAM</span>
                  <span className="text-white font-bold">{info.ram} (Physical Approx)</span>
                </div>
              </div>
           </div>
        </div>

        {/* GPU Specifics - Full Width */}
        <div className="space-y-3 bg-black/30 p-4 rounded-xl border border-white/5">
           <p className="text-[9px] font-mono text-emerald-500/60 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Database className="w-3 h-3" /> Graphics Pipeline
           </p>
           <div className="font-mono text-[10px] space-y-1">
              <div className="flex justify-between border-b border-white/5 pb-1.5">
                 <span className="opacity-40">Renderer</span>
                 <span className="text-white truncate max-w-[280px] md:max-w-none text-right">{info.gpu}</span>
              </div>
           </div>
        </div>
        
        <div className="flex items-center gap-2 px-1 opacity-40">
           <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
           <p className="text-[8px] font-mono uppercase tracking-tighter italic">Low-level device telemetry active via browser-entropy-check.</p>
        </div>
      </CardContent>
    </Card>
  );
}
