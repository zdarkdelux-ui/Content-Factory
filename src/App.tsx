/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Layers, 
  FileText, 
  Settings, 
  Plus, 
  ChevronDown, 
  Target, 
  Zap, 
  Kanban, 
  Table as TableIcon,
  Search,
  FolderOpen
} from 'lucide-react';
import { useStore } from './lib/store';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from './components/ui/dropdown-menu';
import Dashboard from './components/Dashboard';
import ContentPlan from './components/ContentPlan';
import ContentUnitEditor from './components/ContentUnitEditor';
import { Project, ContentUnit } from './types';
import { Toaster, toast } from 'sonner';

type ViewType = 'dashboard' | 'plan' | 'editor';

export default function App() {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  
  const { 
    projects, 
    activeProjectId, 
    setActiveProject, 
    addProject, 
    contentUnits 
  } = useStore();

  const activeProject = projects.find(p => p.id === activeProjectId);

  const handleCreateProject = () => {
    addProject({
      name: 'New SEO Project',
      language: 'English',
      region: 'Tier 1',
      tone: 'Professional',
    });
    toast.success('Project created');
  };

  const openEditor = (id: string) => {
    setSelectedUnitId(id);
    setActiveView('editor');
  };

  const activeUnit = contentUnits.find(u => u.id === selectedUnitId);

  return (
    <div className="flex bg-background text-foreground min-h-screen font-sans">
      <Toaster theme="light" position="top-right" />
      
      {/* Sidebar */}
      <aside className="w-64 border-r border-border flex flex-col bg-sidebar">
        <div className="p-4 flex items-center gap-3 border-b border-border">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-white shadow-sm">
            SF
          </div>
          <span className="font-bold text-lg tracking-tight text-foreground">ContentFactory</span>
        </div>

        <div className="p-4 border-b border-border">
          <DropdownMenu>
            <DropdownMenuTrigger 
              render={
                <Button variant="outline" className="w-full justify-between bg-white border-border hover:bg-muted text-foreground font-medium">
                  <div className="flex items-center gap-2 truncate">
                    <Target className="w-4 h-4 text-primary" />
                    <span className="truncate">{activeProject?.name || 'Select Project'}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 opacity-50" />
                </Button>
              }
            />
            <DropdownMenuContent className="w-56 bg-white border-border">
              {projects.map(p => (
                <DropdownMenuItem key={p.id} onClick={() => setActiveProject(p.id)} className="cursor-pointer">
                  {p.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem onClick={handleCreateProject} className="text-primary font-medium cursor-pointer">
                <Plus className="w-4 h-4 mr-2" /> New Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          <div className="pt-2 pb-2 px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Production
          </div>
          <SidebarItem 
            active={activeView === 'dashboard'} 
            onClick={() => setActiveView('dashboard')}
            icon={<LayoutDashboard className="w-4 h-4" />}
            label="Dashboard"
          />
          <SidebarItem 
            active={activeView === 'plan'} 
            onClick={() => setActiveView('plan')}
            icon={<Kanban className="w-4 h-4" />}
            label="Content Pipeline"
          />
          <SidebarItem 
            active={activeView === 'editor' && !!selectedUnitId} 
            disabled={!selectedUnitId}
            onClick={() => setActiveView('editor')}
            icon={<FileText className="w-4 h-4" />}
            label="Editor"
          />
          
          <div className="pt-4 pb-2 px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Knowledge Base
          </div>
          <SidebarItem icon={<Layers className="w-4 h-4" />} label="Clusters" />
          <SidebarItem icon={<Zap className="w-4 h-4" />} label="Templates" />
          <SidebarItem icon={<FolderOpen className="w-4 h-4" />} label="Exports" />
        </nav>

        <div className="p-4 border-t border-border">
          <SidebarItem icon={<Settings className="w-4 h-4" />} label="Settings" />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-background">
        <header className="h-16 border-b border-border flex items-center px-6 justify-between bg-white shadow-sm z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold tracking-tight text-foreground">
              {activeView === 'dashboard' && 'Dashboard Overview'}
              {activeView === 'plan' && 'Content Pipeline'}
              {activeView === 'editor' && (activeUnit?.topic || 'Select Unit')}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input 
                className="pl-9 w-64 bg-slate-50 border-border focus:ring-1 focus:ring-primary h-9 rounded-lg" 
                placeholder="Filter topics..."
              />
            </div>
            <Button size="sm" className="bg-primary text-white hover:bg-primary/90 rounded-lg h-9 px-4 font-medium">
              <Plus className="w-4 h-4 mr-2" /> New Topic
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative">
          {activeView === 'dashboard' && <Dashboard onOpenUnit={openEditor} />}
          {activeView === 'plan' && <ContentPlan onOpenUnit={openEditor} />}
          {activeView === 'editor' && selectedUnitId && (
            <ContentUnitEditor unitId={selectedUnitId} />
          )}
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick, disabled }: { 
  icon: React.ReactNode, 
  label: string, 
  active?: boolean,
  onClick?: () => void,
  disabled?: boolean
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 mb-0.5
        ${active 
          ? 'bg-accent text-accent-foreground font-semibold shadow-sm' 
          : 'text-foreground/70 hover:bg-secondary hover:text-foreground'}
        ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {icon}
      <span>{label}</span>
      {active && <div className="ml-auto w-1 h-1 rounded-full bg-blue-400" />}
    </button>
  );
}
