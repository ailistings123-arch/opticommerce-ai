/**
 * Training Examples Service
 * Automatically saves high-scoring outputs to Firestore for future training
 */

import { adminDb } from '@/lib/firebase/admin';

export interface TrainingExample {
  platform: string;
  category?: string;
  mode: string;
  seoScore: number;
  input: {
    title?: string;
    description?: string;
    keywords?: string[];
    category?: string;
  };
  output: {
    title: string;
    bullets: string[];
    description: string;
    keywords: string[];
  };
  createdAt: string;
  usageCount: number;
}

export class TrainingExamplesService {
  /**
   * Save a high-scoring output as a training example
   * Only saves if SEO score >= 90 and example is unique enough
   */
  static async saveIfWorthy(data: {
    platform: string;
    category?: string;
    mode: string;
    seoScore: number;
    input: TrainingExample['input'];
    output: TrainingExample['output'];
  }): Promise<boolean> {
    try {
      // Only save if Firestore is available
      if (!adminDb) {
        return false;
      }

      // Only save high-scoring examples
      if (data.seoScore < 90) {
        return false;
      }

      // Check if similar example already exists
      const isDuplicate = await this.isDuplicate(data.platform, data.output.title);
      if (isDuplicate) {
        console.log('[TrainingExamples] Similar example already exists, skipping');
        return false;
      }

      // Save to Firestore
      const example: TrainingExample = {
        platform: data.platform,
        category: data.category || 'general',
        mode: data.mode,
        seoScore: data.seoScore,
        input: data.input,
        output: data.output,
        createdAt: new Date().toISOString(),
        usageCount: 0
      };

      await adminDb.collection('trainingExamples').add(example);
      
      console.log(`[TrainingExamples] Saved new example: ${data.platform}/${data.category} (${data.seoScore}%)`);
      return true;

    } catch (error) {
      console.error('[TrainingExamples] Failed to save:', error);
      return false;
    }
  }

  /**
   * Check if a similar example already exists
   */
  private static async isDuplicate(platform: string, title: string): Promise<boolean> {
    try {
      if (!adminDb) return false;

      // Check for exact title match
      const snapshot = await adminDb
        .collection('trainingExamples')
        .where('platform', '==', platform)
        .where('output.title', '==', title)
        .limit(1)
        .get();

      return !snapshot.empty;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get training examples for a specific platform and category
   */
  static async getExamples(
    platform: string,
    category?: string,
    limit: number = 10
  ): Promise<TrainingExample[]> {
    try {
      if (!adminDb) return [];

      let query = adminDb
        .collection('trainingExamples')
        .where('platform', '==', platform)
        .orderBy('seoScore', 'desc')
        .limit(limit);

      if (category) {
        query = query.where('category', '==', category);
      }

      const snapshot = await query.get();
      
      return snapshot.docs.map(doc => doc.data() as TrainingExample);
    } catch (error) {
      console.error('[TrainingExamples] Failed to fetch:', error);
      return [];
    }
  }

  /**
   * Get best examples across all platforms
   */
  static async getBestExamples(limit: number = 20): Promise<TrainingExample[]> {
    try {
      if (!adminDb) return [];

      const snapshot = await adminDb
        .collection('trainingExamples')
        .orderBy('seoScore', 'desc')
        .limit(limit)
        .get();

      return snapshot.docs.map(doc => doc.data() as TrainingExample);
    } catch (error) {
      console.error('[TrainingExamples] Failed to fetch best:', error);
      return [];
    }
  }

  /**
   * Increment usage count for an example
   */
  static async incrementUsage(exampleId: string): Promise<void> {
    try {
      if (!adminDb) return;

      await adminDb
        .collection('trainingExamples')
        .doc(exampleId)
        .update({
          usageCount: (await adminDb.collection('trainingExamples').doc(exampleId).get()).data()?.usageCount + 1 || 1
        });
    } catch (error) {
      console.error('[TrainingExamples] Failed to increment usage:', error);
    }
  }

  /**
   * Get statistics about training examples
   */
  static async getStats(): Promise<{
    total: number;
    byPlatform: Record<string, number>;
    averageScore: number;
  }> {
    try {
      if (!adminDb) {
        return { total: 0, byPlatform: {}, averageScore: 0 };
      }

      const snapshot = await adminDb.collection('trainingExamples').get();
      
      const byPlatform: Record<string, number> = {};
      let totalScore = 0;

      snapshot.docs.forEach(doc => {
        const data = doc.data() as TrainingExample;
        byPlatform[data.platform] = (byPlatform[data.platform] || 0) + 1;
        totalScore += data.seoScore;
      });

      return {
        total: snapshot.size,
        byPlatform,
        averageScore: snapshot.size > 0 ? totalScore / snapshot.size : 0
      };
    } catch (error) {
      console.error('[TrainingExamples] Failed to get stats:', error);
      return { total: 0, byPlatform: {}, averageScore: 0 };
    }
  }
}
