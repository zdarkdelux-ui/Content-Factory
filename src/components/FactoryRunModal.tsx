import React, { useEffect, useState } from 'react';
import { useStore } from '../lib/store';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from './ui/dialog';
import { Progress } from './ui/progress';
import { 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Settings, 
  Layout, 
  Search, 
  HelpCircle, 
  ImageIcon, 
  Zap,
  ChevronRight
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { 
  generateContentStructure, 
  generateSEOMeta, 
  generateFAQ, 
  generateImagePrompt 
} from '../services/geminiService';
import { toast } from 'sonner';

export const FactoryRunModal: React.FC = () => {
  const { 
    factoryRun, 
    setFactoryStatus, 
    contentUnits, 
    updateContentUnit, 
    selectedUnitIds, 
    aeoMode,
    clearSelection
  } = useStore();
  
  const [logs, setLogs] = useState<{ id: string, message: string, type: 'info' | 'success' | 'error' }[]>([]);

  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setLogs(prev => [{ id: Math.random().toString(), message, type }, ...prev].slice(0, 50));
  };

  useEffect(() => {
    if (factoryRun.isActive && factoryRun.stage === 'Complete' && factoryRun.current === 0) {
      processBatch();
    }
  }, [factoryRun.isActive]);

  const processBatch = async () => {
    if (factoryRun.isActive) return;

    const unitsToProcess = contentUnits.filter(u => selectedUnitIds.includes(u.id));
    if (unitsToProcess.length === 0) {
      toast.error('No topics selected for the run.');
      return;
    }

    setFactoryStatus({ 
      isActive: true, 
      total: unitsToProcess.length, 
      current: 0, 
      stage: 'Structure',
      errors: [] 
    });
    setLogs([]);
    addLog(`Initiating Factory Run for ${unitsToProcess.length} items...`, 'info');

    for (let i = 0; i < unitsToProcess.length; i++) {
      const unit = unitsToProcess[i];
      setFactoryStatus({ current: i + 1, currentItemTopic: unit.topic });
      addLog(`Processing [${i + 1}/${unitsToProcess.length}]: ${unit.topic}`, 'info');

      try {
        // 1. Structure
        setFactoryStatus({ stage: 'Structure' });
        addLog(`Generating blueprint structure...`, 'info');
        const structure = await generateContentStructure(unit.topic, unit.type, [unit.primaryKeyword, ...unit.secondaryKeywords], aeoMode);
        updateContentUnit(unit.id, { structure, status: 'Structure Ready' });
        addLog(`Structure completed.`, 'success');

        // 2. SEO Meta & Short Desc
        setFactoryStatus({ stage: 'SEO' });
        addLog(`Generating meta tags and short description...`, 'info');
        const meta = await generateSEOMeta(unit.topic, unit.type, [unit.primaryKeyword, ...unit.secondaryKeywords], aeoMode);
        
        // Generate short description for AEO/GEO snippets
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const shortDescResponse = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Generate a 2-3 sentence punchy summary for: "${unit.topic}". \nFocus: Direct answer for AI snippets.`,
        });
        const shortDescription = shortDescResponse.text;

        if (meta) {
          updateContentUnit(unit.id, { 
            title: meta.title, 
            description: meta.description, 
            h1: meta.h1, 
            slug: meta.slug,
            shortDescription,
            status: 'SEO Ready'
          });
          addLog(`SEO Meta and Short Description generated.`, 'success');
        }

        // 3. FAQ
        setFactoryStatus({ stage: 'FAQ' });
        addLog(`Generating FAQ blocks...`, 'info');
        const faq = await generateFAQ(unit.topic, 5, aeoMode);
        updateContentUnit(unit.id, { faq });
        addLog(`FAQ blocks completed.`, 'success');

        // 4. Image Prompt
        setFactoryStatus({ stage: 'Image' });
        addLog(`Generating image prompt...`, 'info');
        const imagePrompt = await generateImagePrompt(unit.topic);
        updateContentUnit(unit.id, { imagePrompt });
        addLog(`Image prompt completed.`, 'success');

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        addLog(`Error processing ${unit.topic}: ${errorMsg}`, 'error');
        setFactoryStatus({ errors: [...factoryRun.errors, `${unit.topic}: ${errorMsg}`] });
      }
    }

    setFactoryStatus({ isActive: false, stage: 'Complete' });
    addLog(`Factory Run completed.`, 'success');
    toast.success(`Factory Run completed for ${unitsToProcess.length} items.`);
  };

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'Structure': return <Layout className="w-5 h-5 text-blue-500" />;
      case 'SEO': return <Search className="w-5 h-5 text-amber-500" />;
      case 'FAQ': return <HelpCircle className="w-5 h-5 text-emerald-500" />;
      case 'Image': return <ImageIcon className="w-5 h-5 text-purple-500" />;
      case 'Content': return <Zap className="w-5 h-5 text-primary" />;
      default: return <CheckCircle2 className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <Dialog open={factoryRun.isActive} onOpenChange={(open) => !factoryRun.isActive && setFactoryStatus({ isActive: open })}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-white border-border shadow-2xl rounded-2xl">
        <div className="bg-slate-50 border-b border-border p-6">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <Settings className="w-6 h-6 text-white animate-spin-slow" />
              </div>
              <div>
                <DialogTitle className="text-xl font-black text-foreground tracking-tight">Mass Factory Run</DialogTitle>
                <DialogDescription className="text-xs font-medium text-slate-500 uppercase tracking-widest">
                   Production Line Activity
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="mt-8 space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-end mb-1">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Current Job</span>
                  <p className="text-sm font-bold text-foreground truncate max-w-[400px]">
                    {factoryRun.currentItemTopic || 'Preparing queue...'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Progress</span>
                  <p className="text-sm font-black text-primary">
                    {factoryRun.current} <span className="text-slate-300 font-medium">/</span> {factoryRun.total}
                  </p>
                </div>
              </div>
              <Progress value={(factoryRun.current / (factoryRun.total || 1)) * 100} className="h-3 bg-slate-200" />
            </div>

            <div className="grid grid-cols-4 gap-4">
              {['Structure', 'SEO', 'FAQ', 'Image'].map((s) => (
                <div key={s} className={`p-4 rounded-xl border transition-all ${
                  factoryRun.stage === s 
                    ? 'bg-white border-primary shadow-md ring-1 ring-primary/10' 
                    : 'bg-slate-50/50 border-slate-100 opacity-60'
                }`}>
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className={`p-2 rounded-lg ${factoryRun.stage === s ? 'bg-primary/10' : 'bg-slate-100'}`}>
                      {getStageIcon(s)}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider">{s}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 bg-white min-h-[300px] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Real-time Event Log</h4>
            <Badge variant="outline" className="text-[10px] font-bold border-slate-100 bg-slate-50">
               {logs.length} Operations logged
            </Badge>
          </div>
          
          <ScrollArea className="flex-1 max-h-[250px] border border-slate-50 rounded-lg bg-slate-50/30">
            <div className="p-4 space-y-2">
              {logs.length === 0 ? (
                <div className="py-12 text-center text-slate-300 italic text-xs font-medium uppercase tracking-widest">
                   Production line idle
                </div>
              ) : logs.map((log) => (
                <div key={log.id} className="flex items-start gap-2 text-xs font-medium leading-relaxed">
                  <span className="mt-1">
                    {log.type === 'success' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                    {log.type === 'error' && <AlertCircle className="w-3 h-3 text-rose-500" />}
                    {log.type === 'info' && <ChevronRight className="w-3 h-3 text-slate-300" />}
                  </span>
                  <span className={
                    log.type === 'success' ? 'text-emerald-700' :
                    log.type === 'error' ? 'text-rose-700' :
                    'text-slate-600'
                  }>
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="mt-6 flex justify-end gap-3">
             <Button variant="outline" onClick={() => setFactoryStatus({ isActive: false })} disabled={factoryRun.stage !== 'Complete' && !factoryRun.errors.length}>
               Close Console
             </Button>
             {!factoryRun.isActive && factoryRun.stage === 'Complete' && (
               <Button onClick={() => {
                 clearSelection();
                 setFactoryStatus({ isActive: false });
               }}>
                 Acknowledge & Finalize
               </Button>
             )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
