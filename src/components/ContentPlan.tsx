/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  MoreHorizontal, 
  Kanban as KanbanIcon, 
  Table as TableIcon,
  ChevronRight,
  Target,
  Factory,
  Zap,
  Layout,
  FileText,
  HelpCircle,
  ImageIcon,
  Settings2,
  Check
} from 'lucide-react';
import { useStore } from '../lib/store';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from './ui/table';
import { Badge } from './ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { ContentStatus, ContentType } from '../types';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { FactoryRunModal } from './FactoryRunModal';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { completenessItems, checkCompleteness, getReadinessScore } from '../lib/utils';

interface ContentPlanProps {
  onOpenUnit: (id: string) => void;
}

export default function ContentPlan({ onOpenUnit }: ContentPlanProps) {
  const { 
    contentUnits, 
    activeProjectId, 
    addContentUnit, 
    batchUpdateUnits, 
    deleteContentUnit,
    clusters,
    selectedUnitIds,
    toggleSelection,
    selectAll,
    clearSelection,
    aeoMode,
    setAEOMode,
    setFactoryStatus,
    factoryRun
  } = useStore();
  
  const [view, setView] = useState<'table' | 'kanban'>('table');
  const [search, setSearch] = useState('');
  
  const activeUnits = contentUnits.filter(u => u.projectId === activeProjectId);
  const filteredUnits = activeUnits.filter(u => 
    u.topic.toLowerCase().includes(search.toLowerCase()) || 
    u.primaryKeyword.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelectAll = () => {
    if (selectedUnitIds.length === filteredUnits.length) {
      clearSelection();
    } else {
      selectAll(filteredUnits.map(u => u.id));
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeProjectId) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws) as any[];

      data.forEach(row => {
        addContentUnit({
          projectId: activeProjectId,
          clusterId: 'default', // Or find/create cluster
          topic: row.Topic || row.topic || 'Untitled',
          type: (row.Type || row.type || 'SEO Article') as ContentType,
          primaryKeyword: row.Keyword || row.keyword || '',
          secondaryKeywords: row.Keywords ? row.Keywords.split(',') : [],
          status: 'Idea',
          priority: 'Medium',
        });
      });
      toast.success(`Imported ${data.length} items`);
    };
    reader.readAsBinaryString(file);
  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(filteredUnits);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Content Plan");
    XLSX.writeFile(wb, "content-plan-export.xlsx");
    toast.success('Export completed');
  };

  const statusColors: Record<ContentStatus, string> = {
    'Idea': 'bg-slate-100 text-slate-500',
    'Planned': 'bg-slate-100 text-slate-500',
    'In Progress': 'bg-blue-50 text-blue-600',
    'Structure Ready': 'bg-blue-50 text-blue-600',
    'SEO Ready': 'bg-indigo-50 text-indigo-600',
    'Draft Ready': 'bg-sky-100 text-sky-700',
    'Humanized': 'bg-amber-100 text-amber-700',
    'Reviewing': 'bg-amber-50 text-amber-600',
    'Approved': 'bg-green-100 text-green-700',
    'Published': 'bg-green-100 text-green-700',
    'Archived': 'bg-slate-200 text-slate-600',
  };

  return (
    <div className="h-full flex flex-col p-8 bg-slate-50/50">
      <div className="max-w-[1600px] w-full mx-auto flex flex-col h-full space-y-6">
        
        {/* Toolbar */}
        <div className="flex flex-col space-y-3">
          <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-border shadow-sm">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 w-64 bg-slate-50 border-border h-9 rounded-lg" 
                  placeholder="Search topics..."
                />
              </div>
              <Tabs value={view} onValueChange={(v: any) => setView(v)}>
                <TabsList className="bg-slate-100/50 border border-slate-200 h-9 p-0.5">
                  <TabsTrigger value="table" className="text-[11px] h-8 data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold uppercase tracking-tight"><TableIcon className="w-3.5 h-3.5 mr-2" /> Table</TabsTrigger>
                  <TabsTrigger value="kanban" className="text-[11px] h-8 data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold uppercase tracking-tight"><KanbanIcon className="w-3.5 h-3.5 mr-2" /> Kanban</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Separator orientation="vertical" className="h-6 bg-slate-200" />
              
              <div className="flex items-center gap-2 px-2 py-1 bg-blue-50/50 border border-blue-100 rounded-lg">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger 
                      render={
                        <div className="flex items-center gap-2 cursor-help">
                          <Zap className={`w-3.5 h-3.5 ${aeoMode ? 'text-blue-600' : 'text-slate-400'}`} />
                          <span className="text-[10px] font-bold uppercase tracking-tight text-slate-600">AEO Mode</span>
                          <Switch 
                            checked={aeoMode} 
                            onCheckedChange={setAEOMode} 
                            className="scale-75 data-[state=checked]:bg-blue-600" 
                          />
                        </div>
                      }
                    />
                    <TooltipContent className="bg-white border-border text-slate-600 text-[11px] p-3 max-w-xs shadow-xl">
                      <p className="font-bold mb-1">AI-Ready Content Mode (AEO/GEO)</p>
                      <p className="text-slate-500 italic">Optimizes for AI citation by prioritizing punchy answers, clear headers, and quotable FAQ blocks.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input type="file" id="import-file" className="hidden" onChange={handleImport} accept=".xlsx,.csv" />
              
              {selectedUnitIds.length > 0 && (
                <Button 
                  onClick={() => setFactoryStatus({ isActive: true })}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-9 rounded-lg px-4 shadow-sm shadow-indigo-200"
                >
                  <Factory className="w-4 h-4 mr-2" /> Mass Run ({selectedUnitIds.length})
                </Button>
              )}

              <Button variant="outline" size="sm" className="bg-white border-border text-xs h-9" onClick={() => document.getElementById('import-file')?.click()}>
                <Upload className="w-4 h-4 mr-2" /> Import
              </Button>
              <Button variant="outline" size="sm" className="bg-white border-border text-xs h-9" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" /> Export
              </Button>
              <Button 
                size="sm" 
                className="bg-primary hover:bg-primary/90 text-white font-bold h-9 rounded-lg px-4"
                onClick={() => {
                  if(!activeProjectId) return toast.error('Select project first');
                  addContentUnit({
                    projectId: activeProjectId,
                    clusterId: 'default',
                    topic: 'Untitled Topic',
                    type: 'SEO Article',
                    primaryKeyword: '',
                    secondaryKeywords: [],
                    status: 'Idea',
                    priority: 'Medium',
                  });
                  toast.success('Topic added');
                }}
              >
                <Plus className="w-4 h-4 mr-2" /> New Topic
              </Button>
            </div>
          </div>
          
          {selectedUnitIds.length > 0 && (
            <div className="flex items-center justify-between px-4 py-2 bg-indigo-50/50 border border-indigo-100 rounded-lg animate-in slide-in-from-top-2">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-tight">{selectedUnitIds.length} topics selected for batch work</span>
                <Button variant="ghost" size="sm" className="h-6 text-[10px] text-indigo-600 hover:bg-indigo-100 font-bold uppercase" onClick={clearSelection}>Clear selection</Button>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {view === 'table' ? (
            <Card className="h-full bg-white border-border overflow-hidden shadow-sm rounded-xl">
              <ScrollArea className="h-full">
                <Table className="text-[13px]">
                  <TableHeader className="bg-slate-50/80 sticky top-0 z-10 border-b border-border">
                    <TableRow className="hover:bg-transparent border-border h-12">
                      <TableHead className="w-12 text-muted-foreground pl-6">
                        <Checkbox 
                          checked={selectedUnitIds.length === filteredUnits.length && filteredUnits.length > 0} 
                          onCheckedChange={toggleSelectAll} 
                          className="border-slate-300"
                        />
                      </TableHead>
                      <TableHead className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Topic & Primary Keyword</TableHead>
                      <TableHead className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Cluster</TableHead>
                      <TableHead className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Status</TableHead>
                      <TableHead className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Completeness</TableHead>
                      <TableHead className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold text-right pr-6">Batch Tasks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUnits.length > 0 ? filteredUnits.map((unit, idx) => (
                      <TableRow 
                        key={unit.id} 
                        className={`hover:bg-slate-50/50 border-border cursor-pointer group h-16 ${selectedUnitIds.includes(unit.id) ? 'bg-blue-50/30' : ''}`}
                        onClick={() => onOpenUnit(unit.id)}
                      >
                        <TableCell className="pl-6" onClick={e => e.stopPropagation()}>
                          <Checkbox 
                            checked={selectedUnitIds.includes(unit.id)} 
                            onCheckedChange={() => toggleSelection(unit.id)} 
                            className="border-slate-300"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground text-sm leading-tight group-hover:text-primary transition-colors">
                              {unit.topic}
                            </span>
                            <span className="text-[11px] text-muted-foreground font-medium italic">
                               Key: {unit.primaryKeyword || 'none'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                           <span className="text-xs font-semibold text-slate-600">{clusters.find(c => c.id === unit.clusterId)?.name || 'Maintenance'}</span>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${statusColors[unit.status]} border-none font-bold text-[10px] uppercase rounded px-2 py-0.5`}>
                            {unit.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <TooltipProvider>
                              {completenessItems.map((item, i) => {
                                const isDone = checkCompleteness(unit, item.key);
                                const Icon = item.icon;
                                return (
                                  <Tooltip key={i}>
                                    <TooltipTrigger>
                                      <div className={`p-1 rounded flex items-center justify-center transition-all ${isDone ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-300 opacity-50'}`}>
                                        <Icon className="w-3.5 h-3.5" />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-white border-border text-[10px] font-bold uppercase tracking-wider text-slate-600">
                                      {item.label}: {isDone ? 'READY' : 'PENDING'}
                                    </TooltipContent>
                                  </Tooltip>
                                );
                              })}
                            </TooltipProvider>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground text-[11px] font-medium pr-6">
                          {unit.status === 'Published' ? <span className="text-emerald-600">Completed</span> : (unit.mainContent ? 'SEO, FAQ, Image' : 'Awaiting Gen')}
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-64 text-center text-muted-foreground italic">
                          No content units found. Start by adding a topic.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </Card>
          ) : (
            <KanbanBoard filteredUnits={filteredUnits} statusColors={statusColors} onOpenUnit={onOpenUnit} getReadinessScore={getReadinessScore} />
          )}
        </div>
      </div>
      
      <FactoryRunModal />
    </div>
  );
}

function KanbanBoard({ filteredUnits, statusColors, onOpenUnit, getReadinessScore }: any) {
  const statuses: ContentStatus[] = [
    'Idea', 'Planned', 'In Progress', 'Draft Ready', 'Published'
  ];

  return (
    <div className="h-full flex gap-6 overflow-x-auto pb-6 custom-scrollbar">
      {statuses.map(status => (
        <div key={status} className="w-80 flex-shrink-0 flex flex-col bg-slate-100/50 rounded-2xl border border-slate-200 h-full">
          <div className="p-4 flex items-center justify-between border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Badge className={`${statusColors[status]} border-none uppercase tracking-wide text-[10px] font-bold rounded px-2`}>
                {status}
              </Badge>
              <span className="text-muted-foreground text-[11px] font-bold">
                {filteredUnits.filter((u: any) => u.status === status).length}
              </span>
            </div>
            <MoreHorizontal className="w-4 h-4 text-slate-400" />
          </div>
          <ScrollArea className="flex-1 p-3">
            <div className="space-y-3">
              {filteredUnits
                .filter((u: any) => u.status === status)
                .map((unit: any) => (
                <div 
                  key={unit.id} 
                  className="bg-white border border-border p-4 rounded-xl hover:border-primary/50 hover:bg-slate-50 transition-all cursor-pointer group shadow-sm"
                  onClick={() => onOpenUnit(unit.id)}
                >
                  <div className="text-sm font-bold text-foreground group-hover:text-primary mb-2 tracking-tight leading-snug">
                    {unit.topic}
                  </div>
                  <div className="flex flex-wrap gap-2 items-center mb-3">
                    <Badge variant="secondary" className="bg-slate-50 text-slate-500 border-none text-[9px] font-bold uppercase rounded-sm px-1.5 h-4">
                      {unit.type}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                    <div className="flex gap-1 items-center">
                      <TooltipProvider>
                        {completenessItems.slice(0, 4).map((item, i) => {
                          const isDone = checkCompleteness(unit, item.key);
                          const Icon = item.icon;
                          return (
                             <div key={i} className={`p-0.5 rounded ${isDone ? 'text-primary' : 'text-slate-200'}`}>
                               <Icon className="w-2.5 h-2.5" />
                             </div>
                          );
                        })}
                      </TooltipProvider>
                    </div>
                    <span className="text-[9px] font-black text-primary/50">
                       {getReadinessScore(unit)}/6
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      ))}
    </div>
  );
}

function Card({ children, className }: any) {
  return (
    <div className={`rounded-xl border border-border bg-white ${className}`}>
      {children}
    </div>
  );
}
