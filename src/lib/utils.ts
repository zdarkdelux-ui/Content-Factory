import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { 
  Layout, 
  Target, 
  HelpCircle, 
  ImageIcon, 
  FileText, 
  Zap 
} from 'lucide-react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const completenessItems = [
  { key: 'structure', icon: Layout, label: 'Structure' },
  { key: 'meta', icon: Target, label: 'SEO Meta' },
  { key: 'faq', icon: HelpCircle, label: 'FAQ Blocks' },
  { key: 'imagePrompt', icon: ImageIcon, label: 'Image Prompt' },
  { key: 'mainContent', icon: FileText, label: 'Main Text' },
  { key: 'humanizedContent', icon: Zap, label: 'Humanized' },
];

export const checkCompleteness = (unit: any, item: string) => {
  if (item === 'meta') return unit.title && unit.description;
  if (item === 'faq') return unit.faq && unit.faq.length > 0;
  return !!unit[item];
};

export const getReadinessScore = (unit: any) => {
  return completenessItems.filter(item => checkCompleteness(unit, item.key)).length;
};
