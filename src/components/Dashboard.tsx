/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Plus, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  PenTool, 
  FileSearch, 
  ExternalLink
} from 'lucide-react';
import { useStore } from '../lib/store';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Progress } from './ui/progress';
import { completenessItems, checkCompleteness } from '../lib/utils';

interface DashboardProps {
  onOpenUnit: (id: string) => void;
}

export default function Dashboard({ onOpenUnit }: DashboardProps) {
  const { contentUnits, projects, activeProjectId } = useStore();
  
  const activeUnits = contentUnits.filter(u => u.projectId === activeProjectId);
  
  const stats = {
    total: activeUnits.length,
    inProgress: activeUnits.filter(u => u.status === 'In Progress').length,
    ready: activeUnits.filter(u => u.status === 'Draft Ready' || u.status === 'Humanized').length,
    missingMeta: activeUnits.filter(u => !u.title || !u.description).length,
    humanizationNeeded: activeUnits.filter(u => u.status === 'Draft Ready').length,
  };

  const getReadinessScore = (unit: any) => {
    const score = completenessItems.filter(item => checkCompleteness(unit, item.key)).length;
    return (score / completenessItems.length) * 100;
  };

  return (
    <ScrollArea className="h-full p-8 bg-slate-50/50">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Welcome Section */}
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Dashboard Overview
            </h2>
            <p className="text-muted-foreground font-medium">Monitoring your SEO content pipeline efficiency.</p>
          </div>
          <div className="flex gap-4">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl shadow-sm">
              <Plus className="w-4 h-4 mr-2" /> New Topic
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard 
            label="Total Topics" 
            value={stats.total} 
            icon={<LayersIcon className="text-primary" />} 
            trend="+12% vs last month"
          />
          <MetricCard 
            label="In Production" 
            value={stats.inProgress} 
            icon={<Clock className="text-amber-500" />} 
          />
          <MetricCard 
            label="Finished" 
            value={stats.ready} 
            icon={<CheckCircle2 className="text-emerald-500" />} 
          />
          <MetricCard 
            label="No Meta-tags" 
            value={stats.missingMeta} 
            icon={<AlertCircle className="text-rose-500" />} 
            alert={stats.missingMeta > 0}
          />
          <MetricCard 
            label="Needs Human" 
            value={stats.humanizationNeeded} 
            icon={<PenTool className="text-indigo-500" />} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <Card className="lg:col-span-2 bg-white border-border shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 py-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                Recent Content Units
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/5 font-medium">View All</Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-50">
                {activeUnits.sort((a,b) => b.updatedAt - a.updatedAt).slice(0, 6).map(unit => (
                  <div 
                    key={unit.id} 
                    className="flex justify-between items-center p-4 hover:bg-slate-50/50 transition-colors cursor-pointer group"
                    onClick={() => onOpenUnit(unit.id)}
                  >
                    <div className="space-y-1">
                      <div className="font-semibold text-foreground text-sm">
                        {unit.topic}
                      </div>
                      <div className="flex gap-2 items-center">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-medium px-2 py-0 h-5 text-[10px] uppercase rounded">
                          {unit.type}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground font-medium">
                          Updated {new Date(unit.updatedAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 pr-2">
                      <Badge variant="outline" className={`${
                        unit.status === 'Published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        unit.status === 'Draft Ready' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        unit.status === 'Humanized' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-slate-100 text-slate-600 border-slate-200'
                      } px-2 py-0 h-5 text-[10px] font-bold uppercase rounded border`}>
                        {unit.status}
                      </Badge>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        {completenessItems.map((item, i) => {
                          const isDone = checkCompleteness(unit, item.key);
                          const Icon = item.icon;
                          return (
                            <div key={i} className={`p-0.5 rounded ${isDone ? 'text-primary' : 'text-slate-200'}`}>
                              <Icon className="w-2.5 h-2.5" />
                            </div>
                          );
                        })}
                      </div>
                      <div className="w-24 mt-2">
                        <Progress value={getReadinessScore(unit)} className="h-1 bg-slate-100" />
                      </div>
                    </div>
                  </div>
                ))}
                {activeUnits.length === 0 && (
                  <div className="py-20 text-center space-y-3">
                    <p className="text-muted-foreground text-sm">No topics found for this project.</p>
                    <Button variant="outline" size="sm" className="border-border text-muted-foreground">Add First Topic</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions / Tips */}
          <div className="space-y-6">
            <Card className="bg-primary text-white border-none shadow-lg shadow-primary/20 rounded-xl overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-white/80 text-[10px] font-bold tracking-widest uppercase flex items-center gap-2">
                  <Zap className="w-4 h-4" /> SEO Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm font-medium leading-relaxed">
                  Cluster <span className="underline decoration-2">"Commercial Windows"</span> needs attention. Completing 8 structures now could improve throughput by <span className="font-bold">40%</span>.
                </p>
                <Button className="w-full bg-white text-primary hover:bg-slate-50 font-bold h-10 rounded-lg">
                  Factory Run
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white border-border shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="text-foreground text-sm font-bold tracking-tight">System Tasks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <TaskItem label="Export content plan" />
                <TaskItem label="Review drafts" count={stats.humanizationNeeded} />
                <TaskItem label="Update guidelines" />
                <TaskItem label="Assign team roles" />
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </ScrollArea>
  );
}

function MetricCard({ label, value, icon, alert, trend }: { label: string, value: number, icon: React.ReactNode, alert?: boolean, trend?: string }) {
  return (
    <Card className={`bg-white border-border shadow-sm rounded-xl overflow-hidden ${alert ? 'border-rose-200 bg-rose-50/10' : ''}`}>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
          {icon}
        </div>
        <div>
          <div className="text-2xl font-bold text-foreground tracking-tight">{value.toLocaleString()}</div>
          {trend && (
            <div className="text-[10px] mt-1 font-bold text-emerald-600 bg-emerald-50 inline-block px-1.5 py-0.5 rounded cursor-default uppercase">
              {trend}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function TaskItem({ label, count }: { label: string, count?: number }) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group">
      <span className="text-sm font-medium text-slate-600 group-hover:text-primary">{label}</span>
      {count ? (
        <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold rounded-sm h-5">{count}</Badge>
      ) : (
        <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
      )}
    </div>
  );
}

function LayersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 10L8 13.5L15 10M1 6L8 9.5L15 6M8 2.5L1 6L8 9.5L15 6L8 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function Zap({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.66667 1.33333L2 9.33333H7.33333L6.66667 14.6667L13.3333 6.66667H8L8.66667 1.33333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
