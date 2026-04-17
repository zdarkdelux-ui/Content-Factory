/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ContentStatus = 
  | 'Idea' 
  | 'Planned' 
  | 'In Progress' 
  | 'Structure Ready' 
  | 'SEO Ready' 
  | 'Draft Ready' 
  | 'Humanized' 
  | 'Reviewing' 
  | 'Approved' 
  | 'Published' 
  | 'Archived';

export type ContentType = 
  | 'SEO Article' 
  | 'Service Page' 
  | 'Category' 
  | 'FAQ Page' 
  | 'Promo Page' 
  | 'About Us' 
  | 'Contacts' 
  | 'Commercial Text' 
  | 'Service Description'
  | 'Block Question/Answer' 
  | 'Short Description' 
  | 'Meta Tags' 
  | 'Image Prompt';

export interface Project {
  id: string;
  name: string;
  domain?: string;
  description?: string;
  language: string;
  region: string;
  tone: string;
  formattingRules?: string;
  createdAt: number;
}

export interface Cluster {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  priority: 'Low' | 'Medium' | 'High';
  tag?: string;
  associatedSection?: string;
  status: 'Active' | 'On Hold' | 'Archived';
  createdAt: number;
}

export interface FactoryRunStatus {
  isActive: boolean;
  total: number;
  current: number;
  currentItemTopic: string;
  stage: 'Structure' | 'SEO' | 'FAQ' | 'Image' | 'Content' | 'Complete';
  errors: string[];
}

export interface ContentUnit {
  id: string;
  projectId: string;
  clusterId: string;
  topic: string;
  type: ContentType;
  primaryKeyword: string;
  secondaryKeywords: string[];
  intent?: string;
  targetAudience?: string;
  status: ContentStatus;
  priority: 'Low' | 'Medium' | 'High';
  deadline?: number;
  notes?: string;
  
  // Generated Fields
  title?: string;
  description?: string;
  h1?: string;
  slug?: string;
  shortDescription?: string;
  faq?: { question: string; answer: string }[];
  imagePrompt?: string;
  structure?: string; // Markdown or HTML
  mainContent?: string;
  humanizedContent?: string;
  
  // AEO/GEO specific metadata
  isAEOMode?: boolean;
  
  createdAt: number;
  updatedAt: number;
}

export interface GenerationTemplate {
  id: string;
  name: string;
  type: ContentType | 'General';
  promptTemplate: string;
  isFavorite: boolean;
  createdAt: number;
}

export interface AppState {
  projects: Project[];
  clusters: Cluster[];
  contentUnits: ContentUnit[];
  templates: GenerationTemplate[];
  activeProjectId?: string;
  activeClusterId?: string;
}
