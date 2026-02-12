import { Platform, OptimizedContent } from '@/types';
import { PLATFORM_RULES } from './platform-rules';

export function calculateSEOScore(
  optimized: OptimizedContent,
  platform: Platform
): number {
  let score = 0;
  const rules = PLATFORM_RULES[platform];
  
  // 1. Keyword density (25 points)
  const density = calculateKeywordDensity(optimized.title, optimized.description);
  if (density >= 2 && density <= 4) {
    score += 25;
  } else if (density >= 1 && density < 2) {
    score += 15;
  } else if (density > 4 && density <= 6) {
    score += 15;
  } else {
    score += 5;
  }
  
  // 2. Title length (20 points)
  const titleLength = optimized.title.length;
  if (titleLength >= rules.titleRange.min && titleLength <= rules.titleRange.max) {
    score += 20;
  } else if (Math.abs(titleLength - rules.titleRange.min) <= 20) {
    score += 10;
  } else {
    score += 5;
  }
  
  // 3. Description completeness (20 points)
  const descLength = optimized.description.length;
  if (descLength >= rules.minDescription) {
    score += 20;
  } else {
    score += Math.floor((descLength / rules.minDescription) * 20);
  }
  
  // 4. Readability (15 points)
  const readabilityScore = calculateReadability(optimized.description);
  score += Math.floor(readabilityScore * 15);
  
  // 5. Platform compliance (20 points)
  const complianceScore = checkPlatformCompliance(optimized, platform);
  score += complianceScore;
  
  return Math.min(score, 100);
}

function calculateKeywordDensity(title: string, description: string): number {
  const text = (title + ' ' + description).toLowerCase();
  const words = text.split(/\s+/).filter(w => w.length > 3);
  
  if (words.length === 0) return 0;
  
  const wordFreq: Record<string, number> = {};
  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });
  
  const maxFreq = Math.max(...Object.values(wordFreq));
  return (maxFreq / words.length) * 100;
}

function calculateReadability(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  
  if (sentences.length === 0 || words.length === 0) return 0;
  
  const avgWordsPerSentence = words.length / sentences.length;
  
  // Optimal: 15-20 words per sentence
  if (avgWordsPerSentence >= 15 && avgWordsPerSentence <= 20) {
    return 1.0;
  } else if (avgWordsPerSentence >= 10 && avgWordsPerSentence < 15) {
    return 0.8;
  } else if (avgWordsPerSentence > 20 && avgWordsPerSentence <= 25) {
    return 0.7;
  } else {
    return 0.5;
  }
}

function checkPlatformCompliance(optimized: OptimizedContent, platform: Platform): number {
  const rules = PLATFORM_RULES[platform];
  let score = 0;
  
  // Check tag count (10 points)
  if (optimized.tags.length <= rules.maxTags && optimized.tags.length > 0) {
    score += 10;
  } else if (optimized.tags.length > 0) {
    score += 5;
  }
  
  // Check title format (10 points)
  const titleLength = optimized.title.length;
  if (titleLength <= rules.titleRange.max) {
    score += 10;
  } else {
    score += 5;
  }
  
  return score;
}
