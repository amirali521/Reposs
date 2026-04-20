import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, HardDrive, AlertCircle } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export function StorageTest() {
  const [quota, setQuota] = useState<{ usage: number; limit: number } | null>(null);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');

  const checkStorage = async () => {
    setStatus('scanning');
    try {
      if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        setQuota({
          usage: estimate.usage || 0,
          limit: estimate.quota || 0
        });
        setStatus('success');
      } else {
        throw new Error('Storage API Unsupported');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  useEffect(() => {
    checkStorage();
  }, []);

  const bytesToGB = (bytes: number) => (bytes / (1024 ** 3)).toFixed(2);
  const usagePercent = quota ? (quota.usage / quota.limit) * 100 : 0;

  return (
    <Card className="hardware-card border-none overflow-hidden h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <Database className="w-5 h-5 text-emerald-500" />
              Storage Integrity
            </CardTitle>
            <CardDescription className="mono-label mt-1">
              Cluster_Volume_Audit
            </CardDescription>
          </div>
          <span className={status === 'success' ? 'emerald-badge' : 'rose-badge'}>{status}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-1">
        <div className="bg-black/40 rounded border border-dashed border-white/10 p-5 space-y-4">
          {quota ? (
            <>
              <div className="space-y-2">
                 <div className="flex justify-between font-mono text-[10px] uppercase">
                    <span className="opacity-40">Local Volume Allocation</span>
                    <span className="text-white">{bytesToGB(quota.limit)} GB</span>
                 </div>
                 <Progress value={usagePercent} className="h-1 bg-white/5" indicatorClassName="bg-emerald-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <p className="mono-label text-[7px] text-white/30">Used Space</p>
                    <p className="text-xs font-mono text-white">{(quota.usage / (1024 ** 2)).toFixed(2)} MB</p>
                 </div>
                 <div className="text-right">
                    <p className="mono-label text-[7px] text-white/30">Free Headroom</p>
                    <p className="text-xs font-mono text-emerald-400">{bytesToGB(quota.limit - quota.usage)} GB</p>
                 </div>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
               <HardDrive className="w-8 h-8 text-white/5 mx-auto animate-pulse" />
               <p className="text-[10px] uppercase font-mono text-white/20 mt-2">Connecting to Disk Interface...</p>
            </div>
          )}
        </div>

        <Button 
          onClick={checkStorage} 
          variant="outline"
          className="w-full border-white/10 hover:bg-white/5 text-[10px] font-bold uppercase tracking-widest h-10 rounded-lg"
        >
          Re-Scan Volumes
        </Button>
      </CardContent>
    </Card>
  );
}
