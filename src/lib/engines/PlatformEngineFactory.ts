/**
 * Platform Engine Factory
 * Creates and manages platform-specific engine instances
 */

import { Platform } from '@/types';
import { BasePlatformEngine } from './BasePlatformEngine';
import { AmazonEngine } from './AmazonEngine';
import { EbayEngine } from './EbayEngine';
import { EtsyEngine } from './EtsyEngine';
import { ShopifyEngine } from './ShopifyEngine';
import { WalmartEngine } from './WalmartEngine';

export class PlatformEngineFactory {
  private static engines: Map<Platform, BasePlatformEngine> = new Map();

  /**
   * Get platform-specific engine instance
   */
  static getEngine(platform: Platform): BasePlatformEngine {
    // Return cached instance if available
    if (this.engines.has(platform)) {
      return this.engines.get(platform)!;
    }

    // Create new engine instance
    let engine: BasePlatformEngine;

    switch (platform) {
      case 'amazon':
        engine = new AmazonEngine();
        break;
      case 'ebay':
        engine = new EbayEngine();
        break;
      case 'etsy':
        engine = new EtsyEngine();
        break;
      case 'shopify':
        engine = new ShopifyEngine();
        break;
      case 'walmart':
        engine = new WalmartEngine();
        break;
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }

    // Cache the engine instance
    this.engines.set(platform, engine);

    return engine;
  }

  /**
   * Get all supported platforms
   */
  static getSupportedPlatforms(): Platform[] {
    return ['amazon', 'ebay', 'etsy', 'shopify', 'walmart'];
  }

  /**
   * Check if platform is supported
   */
  static isPlatformSupported(platform: string): platform is Platform {
    return this.getSupportedPlatforms().includes(platform as Platform);
  }

  /**
   * Clear engine cache (useful for testing)
   */
  static clearCache(): void {
    this.engines.clear();
  }
}
