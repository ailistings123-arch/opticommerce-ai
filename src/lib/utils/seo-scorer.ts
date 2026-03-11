import { Platform, OptimizedContent } from '@/types';
import { PLATFORM_RULES } from './platform-rules';

export function calculateSEOScore(
  optimized: OptimizedContent,
  platform: Platform
): number {
  let score = 0;
  const rules = PLATFORM_RULES[platform];
  
  // 1. Keyword density (20 points) - OPTIMIZED
  const density = calculateKeywordDensity(optimized.title, optimized.description);
  if (density >= 2 && density <= 3) {
    score += 20; // Optimal range
  } else if (density >= 1.5 && density < 2) {
    score += 16;
  } else if (density > 3 && density <= 4) {
    score += 16;
  } else if (density >= 1 && density < 1.5) {
    score += 12;
  } else {
    score += 5;
  }
  
  // 2. Title optimization (20 points) - ENHANCED
  const titleLength = optimized.title.length;
  const titleUtilization = (titleLength / rules.titleRange.max) * 100;
  if (titleUtilization >= 95 && titleUtilization <= 100) {
    score += 20; // Perfect utilization
  } else if (titleUtilization >= 90 && titleUtilization < 95) {
    score += 18;
  } else if (titleUtilization >= 85 && titleUtilization < 90) {
    score += 15;
  } else if (titleUtilization >= 75 && titleUtilization < 85) {
    score += 10;
  } else {
    score += 5;
  }
  
  // 3. Description quality (15 points) - ENHANCED
  const descLength = optimized.description.length;
  if (descLength >= rules.minDescription * 1.5) {
    score += 15; // Comprehensive description
  } else if (descLength >= rules.minDescription) {
    score += 12;
  } else if (descLength >= rules.minDescription * 0.8) {
    score += 8;
  } else {
    score += Math.floor((descLength / rules.minDescription) * 8);
  }
  
  // 4. Readability (12 points) - OPTIMIZED
  const readabilityScore = calculateReadability(optimized.description);
  score += Math.floor(readabilityScore * 12);
  
  // 5. Platform compliance (15 points) - ENHANCED
  const complianceScore = checkPlatformCompliance(optimized, platform);
  score += complianceScore;
  
  // 6. Mobile optimization (8 points) - NEW
  const mobileScore = calculateMobileOptimization(optimized, platform);
  score += mobileScore;
  
  // 7. Keyword placement (5 points) - NEW
  const placementScore = calculateKeywordPlacement(optimized);
  score += placementScore;
  
  // 8. Content structure (5 points) - NEW
  const structureScore = calculateContentStructure(optimized);
  score += structureScore;
  
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

// NEW: Mobile optimization scoring
function calculateMobileOptimization(optimized: OptimizedContent, platform: Platform): number {
  let score = 0;
  const rules = PLATFORM_RULES[platform];
  
  // Check if first 60 chars of title are impactful (mobile display)
  const mobileTitle = optimized.title.substring(0, 60);
  const hasKeywordInMobile = optimized.tags.some(tag => 
    mobileTitle.toLowerCase().includes(tag.toLowerCase())
  );
  
  if (hasKeywordInMobile) {
    score += 4;
  }
  
  // Check description readability on mobile (shorter sentences)
  const sentences = optimized.description.split(/[.!?]+/);
  const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length;
  
  if (avgSentenceLength <= 15) {
    score += 4; // Mobile-friendly short sentences
  } else if (avgSentenceLength <= 20) {
    score += 2;
  }
  
  return score;
}

// NEW: Keyword placement scoring
function calculateKeywordPlacement(optimized: OptimizedContent): number {
  let score = 0;
  
  // Check if primary keywords are in first 80 characters
  const first80 = optimized.title.substring(0, 80).toLowerCase();
  const keywordsInFirst80 = optimized.tags.filter(tag => 
    first80.includes(tag.toLowerCase())
  ).length;
  
  if (keywordsInFirst80 >= 2) {
    score += 5;
  } else if (keywordsInFirst80 >= 1) {
    score += 3;
  }
  
  return score;
}

// NEW: Content structure scoring
function calculateContentStructure(optimized: OptimizedContent): number {
  let score = 0;
  
  // Check if description has proper structure (paragraphs, lists)
  const hasParagraphs = optimized.description.includes('\n\n') || optimized.description.includes('<p>');
  const hasBullets = optimized.description.includes('•') || optimized.description.includes('<li>');
  
  if (hasParagraphs) score += 2;
  if (hasBullets) score += 2;
  
  // Check if title has proper structure (not all caps, proper spacing)
  const isNotAllCaps = optimized.title !== optimized.title.toUpperCase();
  if (isNotAllCaps) score += 1;
  
  return score;
}
