/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Project, Cluster, ContentUnit, GenerationTemplate, ContentStatus, ContentType, FactoryRunStatus } from '../types';

interface StoreState {
  projects: Project[];
  clusters: Cluster[];
  contentUnits: ContentUnit[];
  templates: GenerationTemplate[];
  activeProjectId: string | null;
  
  // Selection & Batch
  selectedUnitIds: string[];
  aeoMode: boolean;
  factoryRun: FactoryRunStatus;
  
  // Actions
  toggleSelection: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  setAEOMode: (enabled: boolean) => void;
  setFactoryStatus: (status: Partial<FactoryRunStatus>) => void;
  
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setActiveProject: (id: string | null) => void;
  
  addCluster: (cluster: Omit<Cluster, 'id' | 'createdAt'>) => void;
  updateCluster: (id: string, cluster: Partial<Cluster>) => void;
  deleteCluster: (id: string) => void;
  
  addContentUnit: (unit: Omit<ContentUnit, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateContentUnit: (id: string, unit: Partial<ContentUnit>) => void;
  deleteContentUnit: (id: string) => void;
  
  addTemplate: (template: Omit<GenerationTemplate, 'id' | 'createdAt'>) => void;
  updateTemplate: (id: string, template: Partial<GenerationTemplate>) => void;
  deleteTemplate: (id: string) => void;

  batchUpdateUnits: (ids: string[], updates: Partial<ContentUnit>) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      projects: [],
      clusters: [],
      contentUnits: [],
      templates: [
        {
          id: '1',
          name: 'SEO Article Structure',
          type: 'SEO Article',
          promptTemplate: 'Generate structure for SEO article...',
          isFavorite: true,
          createdAt: Date.now()
        }
      ],
      activeProjectId: null,
      selectedUnitIds: [],
      aeoMode: false,
      factoryRun: {
        isActive: false,
        total: 0,
        current: 0,
        currentItemTopic: '',
        stage: 'Complete',
        errors: []
      },

      toggleSelection: (id) => set((state) => ({
        selectedUnitIds: state.selectedUnitIds.includes(id)
          ? state.selectedUnitIds.filter(i => i !== id)
          : [...state.selectedUnitIds, id]
      })),
      selectAll: (ids) => set({ selectedUnitIds: ids }),
      clearSelection: () => set({ selectedUnitIds: [] }),
      setAEOMode: (enabled) => set({ aeoMode: enabled }),
      setFactoryStatus: (status) => set((state) => ({ 
        factoryRun: { ...state.factoryRun, ...status } 
      })),

      addProject: (project) => set((state) => ({
        projects: [...state.projects, { ...project, id: crypto.randomUUID(), createdAt: Date.now() }]
      })),
      updateProject: (id, updates) => set((state) => ({
        projects: state.projects.map(p => p.id === id ? { ...p, ...updates } : p)
      })),
      deleteProject: (id) => set((state) => ({
        projects: state.projects.filter(p => p.id !== id),
        clusters: state.clusters.filter(c => c.projectId !== id),
        contentUnits: state.contentUnits.filter(u => u.projectId !== id),
        activeProjectId: state.activeProjectId === id ? null : state.activeProjectId
      })),
      setActiveProject: (id) => set({ activeProjectId: id }),

      addCluster: (cluster) => set((state) => ({
        clusters: [...state.clusters, { ...cluster, id: crypto.randomUUID(), createdAt: Date.now() }]
      })),
      updateCluster: (id, updates) => set((state) => ({
        clusters: state.clusters.map(c => c.id === id ? { ...c, ...updates } : c)
      })),
      deleteCluster: (id) => set((state) => ({
        clusters: state.clusters.filter(c => c.id !== id),
        contentUnits: state.contentUnits.filter(u => u.clusterId !== id)
      })),

      addContentUnit: (unit) => set((state) => ({
        contentUnits: [
          ...state.contentUnits, 
          { 
            ...unit, 
            id: crypto.randomUUID(), 
            createdAt: Date.now(), 
            updatedAt: Date.now() 
          }
        ]
      })),
      updateContentUnit: (id, updates) => set((state) => ({
        contentUnits: state.contentUnits.map(u => u.id === id ? { ...u, ...updates, updatedAt: Date.now() } : u)
      })),
      deleteContentUnit: (id) => set((state) => ({
        contentUnits: state.contentUnits.filter(u => u.id !== id)
      })),

      batchUpdateUnits: (ids, updates) => set((state) => ({
        contentUnits: state.contentUnits.map(u => ids.includes(u.id) ? { ...u, ...updates, updatedAt: Date.now() } : u)
      })),

      addTemplate: (template) => set((state) => ({
        templates: [...state.templates, { ...template, id: crypto.randomUUID(), createdAt: Date.now() }]
      })),
      updateTemplate: (id, updates) => set((state) => ({
        templates: state.templates.map(t => t.id === id ? { ...t, ...updates } : t)
      })),
      deleteTemplate: (id) => set((state) => ({
        templates: state.templates.filter(t => t.id !== id)
      }))
    }),
    {
      name: 'seo-factory-storage',
    }
  )
);
