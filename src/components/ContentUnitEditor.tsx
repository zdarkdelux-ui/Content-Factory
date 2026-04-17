/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Search, 
  Save, 
  Trash2, 
  Copy, 
  Check, 
  Layout, 
  Type as TypeIcon, 
  HelpCircle, 
  Image as ImageIcon, 
  FileText, 
  PenTool,
  ArrowLeft,
  Loader2,
  MoreVertical,
  History,
  Eye,
  FileCode,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useStore } from '../lib/store';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { 
  generateContentStructure, 
  generateSEOMeta, 
  generateFAQ, 
  generateImagePrompt,
  humanizeText 
} from '../services/geminiService';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

interface EditorProps {
  unitId: string;
}

export default function ContentUnitEditor({ unitId }: EditorProps) {
  const { contentUnits, updateContentUnit, deleteContentUnit } = useStore();
  const unit = contentUnits.find(u => u.id === unitId);
  
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState('summary');
  const [copyStatus, setCopyStatus] = useState<Record<string, boolean>>({});

  if (!unit) return <div className="p-8 text-neutral-500 font-medium">Topic not found.</div>;

  const handleGenerate = async (type: string, fn: () => Promise<any>) => {
    setLoading(prev => ({ ...prev, [type]: true }));
    try {
      const result = await fn();
      if (result) {
        if (type === 'meta') {
          updateContentUnit(unitId, { 
            title: result.title, 
            description: result.description, 
            h1: result.h1, 
            slug: result.slug 
          });
        } else if (type === 'structure') {
          updateContentUnit(unitId, { structure: result });
        } else if (type === 'faq') {
          updateContentUnit(unitId, { faq: result });
        } else if (type === 'imagePrompt') {
          updateContentUnit(unitId, { imagePrompt: result });
        } else if (type === 'humanize') {
          updateContentUnit(unitId, { humanizedContent: result, status: 'Humanized' });
        }
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} generated`);
      }
    } catch (e) {
      toast.error(`Failed to generate ${type}`);
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopyStatus({ ...copyStatus, [key]: true });
    setTimeout(() => setCopyStatus({ ...copyStatus, [key]: false }), 2000);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
      
      {/* Editor Main Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side: Parameters / Structure */}
        <div className="w-1/3 border-r border-border bg-white flex flex-col overflow-hidden shadow-sm">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col h-full">
            <div className="px-6 py-4 flex justify-between items-center bg-slate-50/30 sticky top-0 z-10 border-b border-border">
              <TabsList className="bg-slate-100 border border-slate-200 h-9 p-0.5 rounded-lg">
                <TabsTrigger value="summary" className="text-[10px] font-bold uppercase tracking-tight h-8 data-[state=active]:bg-white data-[state=active]:shadow-sm">Summary</TabsTrigger>
                <TabsTrigger value="structure" className="text-[10px] font-bold uppercase tracking-tight h-8 data-[state=active]:bg-white data-[state=active]:shadow-sm">Structure</TabsTrigger>
                <TabsTrigger value="faq" className="text-[10px] font-bold uppercase tracking-tight h-8 data-[state=active]:bg-white data-[state=active]:shadow-sm">FAQ</TabsTrigger>
                <TabsTrigger value="image" className="text-[10px] font-bold uppercase tracking-tight h-8 data-[state=active]:bg-white data-[state=active]:shadow-sm">Media</TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-hidden relative">
              <ScrollArea className="h-full">
                <div className="p-6 space-y-8">
                  
                  {/* Summary Tab */}
                  <TabsContent value="summary" className="m-0 space-y-8">
                    <section className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500">SEO Configuration</h3>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 text-primary hover:bg-primary/5 font-bold text-[10px]"
                          onClick={() => handleGenerate('meta', () => generateSEOMeta(unit.topic, unit.type, [unit.primaryKeyword, ...unit.secondaryKeywords]))}
                          disabled={loading.meta}
                        >
                          {loading.meta ? <Loader2 className="w-3 h-3 animate-spin mr-1.5" /> : <Sparkles className="w-3 h-3 mr-1.5" />}
                          Re-Optimize
                        </Button>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                            Title Tag <span className="text-[10px] lowercase font-medium">({unit.title?.length || 0}/60)</span>
                          </label>
                          <div className="relative">
                            <Input 
                              value={unit.title || ''} 
                              onChange={e => updateContentUnit(unitId, { title: e.target.value })}
                              placeholder="Captivating SEO title..." 
                              className="bg-white border-border pr-10 text-foreground font-medium rounded-lg"
                            />
                            <button onClick={() => copyToClipboard(unit.title || '', 'title')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors">
                              {copyStatus.title ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                            Meta Description <span className="text-[10px] lowercase font-medium">({unit.description?.length || 0}/160)</span>
                          </label>
                          <div className="relative">
                            <Textarea 
                              value={unit.description || ''} 
                              onChange={e => updateContentUnit(unitId, { description: e.target.value })}
                              placeholder="Engaging summary for search results..." 
                              className="bg-white border-border min-h-[100px] text-slate-600 text-sm leading-relaxed rounded-lg resize-none"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">H1 Heading</label>
                            <Input 
                              value={unit.h1 || ''} 
                              onChange={e => updateContentUnit(unitId, { h1: e.target.value })}
                              className="bg-white border-border rounded-lg text-sm" 
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Slug</label>
                            <Input 
                              value={unit.slug || ''} 
                              onChange={e => updateContentUnit(unitId, { slug: e.target.value })}
                              className="bg-slate-50 border-border rounded-lg font-mono text-xs text-slate-500" 
                            />
                          </div>
                        </div>
                      </div>
                    </section>

                    <Separator className="bg-slate-100" />

                    <section className="space-y-4">
                      <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Keyword Targets</h3>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Primary Keyword</label>
                        <Input value={unit.primaryKeyword} className="bg-slate-50 border-border rounded-lg text-xs font-bold text-slate-600 h-9" disabled />
                      </div>
                    </section>
                  </TabsContent>

                  {/* Structure Tab */}
                  <TabsContent value="structure" className="m-0 space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                        Content Blueprint
                      </h3>
                      <Button 
                        variant="default" 
                        size="sm" 
                        onClick={() => handleGenerate('structure', () => generateContentStructure(unit.topic, unit.type, [unit.primaryKeyword]))}
                        className="h-8 font-bold text-[10px] bg-primary hover:bg-primary/95 shadow-sm rounded-lg"
                        disabled={loading.structure}
                      >
                         {loading.structure ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Sparkles className="w-3.5 h-3.5 mr-1.5" />}
                         Auto-Structure
                      </Button>
                    </div>
                    <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-5 font-sans text-sm leading-relaxed text-slate-600 min-h-[450px]">
                      {unit.structure ? (
                        <div className="prose prose-slate prose-sm max-w-none prose-headings:text-foreground prose-strong:text-foreground">
                           <ReactMarkdown>{unit.structure}</ReactMarkdown>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-20 text-center space-y-3">
                          <Layout className="w-8 h-8 text-slate-200" />
                          <p className="italic text-slate-400 text-xs">Awaiting structural mapping.</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* FAQ Tab */}
                  <TabsContent value="faq" className="m-0 space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500">FAQ Sections</h3>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 border-border text-slate-600 hover:bg-slate-50 font-bold text-[10px] rounded-lg"
                        onClick={() => handleGenerate('faq', () => generateFAQ(unit.topic))}
                        disabled={loading.faq}
                      >
                         {loading.faq ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Zap className="w-3.5 h-3.5 mr-1.5 text-primary" />}
                         Generate FAQ
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {unit.faq?.map((item, idx) => (
                        <div key={idx} className="bg-white border border-border p-4 rounded-xl space-y-3 group hover:border-primary/20 hover:shadow-sm transition-all">
                          <div className="font-bold text-sm text-foreground flex items-start gap-2">
                            <span className="text-primary font-black">Q:</span> {item.question}
                          </div>
                          <div className="text-sm text-slate-500 italic leading-relaxed">
                            {item.answer}
                          </div>
                        </div>
                      ))}
                      {!unit.faq && (
                        <div className="p-16 text-center text-slate-300 italic flex flex-col items-center gap-3">
                          <HelpCircle className="w-8 h-8 opacity-20" />
                          <p className="text-xs font-medium uppercase tracking-widest">No FAQ modules found</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Image Tab */}
                  <TabsContent value="image" className="m-0 space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Visual Assets</h3>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 border-border text-slate-600 hover:bg-slate-50 font-bold text-[10px] rounded-lg"
                        onClick={() => handleGenerate('imagePrompt', () => generateImagePrompt(unit.topic))}
                        disabled={loading.imagePrompt}
                      >
                         {loading.imagePrompt ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <ImageIcon className="w-3.5 h-3.5 mr-1.5" />}
                         Forge Prompt
                      </Button>
                    </div>
                    {unit.imagePrompt ? (
                      <div className="bg-white border border-border rounded-xl p-5 space-y-4 shadow-sm">
                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                             onClick={() => copyToClipboard(unit.imagePrompt || '', 'imgPrompt')}>
                          <p className="text-xs text-primary font-mono italic leading-relaxed">
                             {unit.imagePrompt}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                           <Sparkles className="w-3 h-3 text-amber-500" /> Photorealistic / Midjourney Directives
                        </div>
                      </div>
                    ) : (
                      <div className="p-16 text-center text-slate-300 italic flex flex-col items-center gap-3">
                        <ImageIcon className="w-8 h-8 opacity-20" />
                        <p className="text-xs font-medium uppercase tracking-widest">Visual directive pending</p>
                      </div>
                    )}
                  </TabsContent>
                </div>
              </ScrollArea>
            </div>
          </Tabs>
        </div>

        {/* Right Side: Editor Content */}
        <div className="flex-1 flex flex-col bg-white relative overflow-hidden">
          
          <div className="h-14 border-b border-border bg-white flex items-center justify-between px-6 z-10 sticky top-0">
            <div className="flex items-center gap-3">
              <Badge className="bg-primary/10 text-primary border-none uppercase tracking-widest text-[9px] font-bold h-5 px-2 rounded-sm ring-1 ring-primary/20">Production Flow</Badge>
              <Separator orientation="vertical" className="h-4 bg-slate-200" />
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                <FileCode className="w-3.5 h-3.5" /> Draft: {unit.mainContent ? 'GENERATED' : 'EMPTY'} | Humanized: {unit.humanizedContent ? 'YES' : 'NO'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" className="h-8 text-slate-500 text-[11px] font-bold uppercase hover:bg-slate-50">
                 <History className="w-3.5 h-3.5 mr-1.5" /> Log
              </Button>
              <Button 
                size="sm" 
                className="h-8 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] uppercase tracking-wide rounded-lg px-3 shadow-sm shadow-amber-500/10"
                onClick={() => toast.info('Humanization process started...')}
                disabled={!unit.mainContent}
              >
                 <PenTool className="w-3.5 h-3.5 mr-1.5" /> Optimize Tone
              </Button>
              <Button size="sm" className="h-8 bg-primary text-white font-bold text-[10px] hover:bg-primary/95 px-4 rounded-lg shadow-sm shadow-primary/10 uppercase tracking-wide">
                 <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Finalize Output
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden relative">
            <ScrollArea className="h-full bg-white">
              <div className="max-w-4xl mx-auto p-12 lg:p-20 space-y-12 bg-white">
                
                {/* Visual Header Placeholder */}
                <div className="aspect-[21/9] bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center group hover:bg-slate-100 transition-all cursor-default">
                   <div className="flex flex-col items-center gap-4 text-slate-300 group-hover:text-primary/30 transition-colors">
                      <ImageIcon className="w-10 h-10" />
                      <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Banner Illustration Directive</span>
                   </div>
                </div>

                <div className="space-y-6">
                  <h1 className="text-5xl font-black tracking-tight text-foreground leading-[1.1]">
                    {unit.h1 || unit.topic}
                  </h1>
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Time Investment</span>
                      <span className="text-xs font-bold text-slate-700">6 min read</span>
                    </div>
                    <Separator orientation="vertical" className="h-8 bg-slate-100" />
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Target Keyword</span>
                      <span className="text-xs font-bold text-primary italic underline underline-offset-4 decoration-primary/20">{unit.primaryKeyword || '—'}</span>
                    </div>
                  </div>
                </div>

                <div className="prose prose-slate prose-lg max-w-none prose-headings:text-foreground prose-p:text-slate-600 prose-headings:font-black prose-headings:tracking-tight prose-li:text-slate-600">
                  {unit.mainContent ? (
                    <div className="subpixel-antialiased">
                       <ReactMarkdown>{unit.humanizedContent || unit.mainContent}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="py-24 text-center border-t border-slate-100">
                      <div className="inline-flex flex-col items-center gap-6">
                        <div className="w-16 h-16 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center animate-pulse">
                           <Sparkles className="w-7 h-7 text-primary/40" />
                        </div>
                        <div className="space-y-2">
                           <h3 className="text-lg font-bold text-foreground uppercase tracking-tight">Ghost State</h3>
                           <p className="text-slate-400 max-w-sm text-xs font-medium leading-relaxed">
                             This content unit is currently a blueprint. Trigger the Factory Forge to generate production-ready copy.
                           </p>
                        </div>
                        <Button 
                          size="lg" 
                          className="bg-primary hover:bg-primary/95 text-white font-bold h-12 px-10 tracking-widest rounded-xl shadow-lg shadow-primary/20"
                          disabled={loading.forge}
                          onClick={async () => {
                            setLoading(prev => ({ ...prev, forge: true }));
                            try {
                              const { GoogleGenAI } = await import('@google/genai');
                              const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
                              const response = await ai.models.generateContent({
                                model: "gemini-3-flash-preview",
                                contents: `Generate a full SEO article for the topic: "${unit.topic}". \nStructure: ${unit.structure || 'Standard SEO article'}. \nPrimary Keyword: ${unit.primaryKeyword}. \nUse Markdown.`,
                                config: {
                                  systemInstruction: "You are an expert SEO copywriter. Generate a high-quality, comprehensive article based on the provided structure and topic. Use Markdown.",
                                }
                              });
                              updateContentUnit(unitId, { 
                                mainContent: response.text,
                                status: 'Draft Ready'
                              });
                              toast.success('Production draft completed');
                            } catch (e) {
                              toast.error('Forge failed: ' + (e instanceof Error ? e.message : 'Unknown error'));
                            } finally {
                              setLoading(prev => ({ ...prev, forge: false }));
                            }
                          }}
                        >
                          {loading.forge ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                          INITIATE FORGE
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
