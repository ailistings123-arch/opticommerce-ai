/**
 * URL Analyzer Service
 * Analyzes product URLs to extract listing data
 */

export interface AnalyzedUrlData {
  title: string;
  description: string;
  price?: number;
  images?: string[];
  specifications?: Array<{ name: string; value: string; unit?: string }>;
  bullets?: string[];
  category?: string;
  brand?: string;
  rating?: number;
  reviewCount?: number;
  availability?: string;
}

export class UrlAnalyzerService {
  /**
   * Analyze product URL and extract data
   */
  static async analyzeUrl(url: string): Promise<AnalyzedUrlData> {
    try {
      // Validate URL
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();

      // Determine platform
      if (hostname.includes('amazon')) {
        return await this.analyzeAmazonUrl(url);
      } else if (hostname.includes('ebay')) {
        return await this.analyzeEbayUrl(url);
      } else if (hostname.includes('etsy')) {
        return await this.analyzeEtsyUrl(url);
      } else if (hostname.includes('walmart')) {
        return await this.analyzeWalmartUrl(url);
      } else {
        return await this.analyzeGenericUrl(url);
      }
    } catch (error: any) {
      throw new Error(`Failed to analyze URL: ${error.message}`);
    }
  }

  /**
   * Analyze Amazon product URL
   */
  private static async analyzeAmazonUrl(url: string): Promise<AnalyzedUrlData> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();

      return {
        title: this.extractAmazonTitle(html),
        description: this.extractAmazonDescription(html),
        price: this.extractAmazonPrice(html),
        bullets: this.extractAmazonBullets(html),
        images: this.extractAmazonImages(html),
        specifications: this.extractAmazonSpecs(html),
        brand: this.extractAmazonBrand(html),
        rating: this.extractAmazonRating(html),
        reviewCount: this.extractAmazonReviewCount(html)
      };
    } catch (error: any) {
      throw new Error(`Amazon URL analysis failed: ${error.message}`);
    }
  }

  /**
   * Extract Amazon title
   */
  private static extractAmazonTitle(html: string): string {
    const titleMatch = html.match(/<span id="productTitle"[^>]*>([^<]+)<\/span>/i);
    return titleMatch ? titleMatch[1].trim() : '';
  }

  /**
   * Extract Amazon description
   */
  private static extractAmazonDescription(html: string): string {
    const descMatch = html.match(/<div id="productDescription"[^>]*>[\s\S]*?<p>([^<]+)<\/p>/i);
    return descMatch ? descMatch[1].trim() : '';
  }

  /**
   * Extract Amazon price
   */
  private static extractAmazonPrice(html: string): number | undefined {
    const priceMatch = html.match(/<span class="a-price-whole">([0-9,]+)<\/span>/i);
    if (priceMatch) {
      return parseFloat(priceMatch[1].replace(/,/g, ''));
    }
    return undefined;
  }

  /**
   * Extract Amazon bullet points
   */
  private static extractAmazonBullets(html: string): string[] {
    const bullets: string[] = [];
    const bulletRegex = /<span class="a-list-item">([^<]+)<\/span>/gi;
    let match;

    while ((match = bulletRegex.exec(html)) !== null) {
      const bullet = match[1].trim();
      if (bullet && bullet.length > 20) {
        bullets.push(bullet);
      }
    }

    return bullets.slice(0, 5);
  }

  /**
   * Extract Amazon images
   */
  private static extractAmazonImages(html: string): string[] {
    const images: string[] = [];
    const imageRegex = /"hiRes":"([^"]+)"/g;
    let match;

    while ((match = imageRegex.exec(html)) !== null) {
      images.push(match[1]);
    }

    return images.slice(0, 6);
  }

  /**
   * Extract Amazon specifications
   */
  private static extractAmazonSpecs(html: string): Array<{ name: string; value: string }> {
    const specs: Array<{ name: string; value: string }> = [];
    const specRegex = /<th class="a-color-secondary a-size-base prodDetSectionEntry">([^<]+)<\/th>[\s\S]*?<td class="a-size-base prodDetAttrValue">([^<]+)<\/td>/gi;
    let match;

    while ((match = specRegex.exec(html)) !== null) {
      specs.push({
        name: match[1].trim(),
        value: match[2].trim()
      });
    }

    return specs;
  }

  /**
   * Extract Amazon brand
   */
  private static extractAmazonBrand(html: string): string | undefined {
    const brandMatch = html.match(/<a id="bylineInfo"[^>]*>([^<]+)<\/a>/i);
    return brandMatch ? brandMatch[1].replace('Visit the', '').replace('Store', '').trim() : undefined;
  }

  /**
   * Extract Amazon rating
   */
  private static extractAmazonRating(html: string): number | undefined {
    const ratingMatch = html.match(/<span class="a-icon-alt">([0-9.]+) out of 5 stars<\/span>/i);
    return ratingMatch ? parseFloat(ratingMatch[1]) : undefined;
  }

  /**
   * Extract Amazon review count
   */
  private static extractAmazonReviewCount(html: string): number | undefined {
    const reviewMatch = html.match(/<span id="acrCustomerReviewText">([0-9,]+) ratings<\/span>/i);
    return reviewMatch ? parseInt(reviewMatch[1].replace(/,/g, '')) : undefined;
  }

  /**
   * Analyze eBay product URL
   */
  private static async analyzeEbayUrl(url: string): Promise<AnalyzedUrlData> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const html = await response.text();

      return {
        title: this.extractEbayTitle(html),
        description: this.extractEbayDescription(html),
        price: this.extractEbayPrice(html),
        images: this.extractEbayImages(html),
        specifications: this.extractEbaySpecs(html)
      };
    } catch (error: any) {
      throw new Error(`eBay URL analysis failed: ${error.message}`);
    }
  }

  /**
   * Extract eBay title
   */
  private static extractEbayTitle(html: string): string {
    const titleMatch = html.match(/<h1 class="x-item-title__mainTitle"[^>]*>([^<]+)<\/h1>/i);
    return titleMatch ? titleMatch[1].trim() : '';
  }

  /**
   * Extract eBay description
   */
  private static extractEbayDescription(html: string): string {
    const descMatch = html.match(/<div class="x-item-description"[^>]*>([\s\S]*?)<\/div>/i);
    if (descMatch) {
      return descMatch[1].replace(/<[^>]+>/g, '').trim();
    }
    return '';
  }

  /**
   * Extract eBay price
   */
  private static extractEbayPrice(html: string): number | undefined {
    const priceMatch = html.match(/<span class="ux-textspans">US \$([0-9,.]+)<\/span>/i);
    return priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : undefined;
  }

  /**
   * Extract eBay images
   */
  private static extractEbayImages(html: string): string[] {
    const images: string[] = [];
    const imageRegex = /<img[^>]+src="([^"]+)"[^>]*class="[^"]*ux-image-carousel-item[^"]*"/gi;
    let match;

    while ((match = imageRegex.exec(html)) !== null) {
      images.push(match[1]);
    }

    return images;
  }

  /**
   * Extract eBay specifications
   */
  private static extractEbaySpecs(html: string): Array<{ name: string; value: string }> {
    const specs: Array<{ name: string; value: string }> = [];
    const specRegex = /<dt class="ux-labels-values__labels"[^>]*>([^<]+)<\/dt>[\s\S]*?<dd class="ux-labels-values__values"[^>]*>([^<]+)<\/dd>/gi;
    let match;

    while ((match = specRegex.exec(html)) !== null) {
      specs.push({
        name: match[1].trim(),
        value: match[2].trim()
      });
    }

    return specs;
  }

  /**
   * Analyze Etsy product URL
   */
  private static async analyzeEtsyUrl(url: string): Promise<AnalyzedUrlData> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const html = await response.text();

      return {
        title: this.extractEtsyTitle(html),
        description: this.extractEtsyDescription(html),
        price: this.extractEtsyPrice(html),
        images: this.extractEtsyImages(html)
      };
    } catch (error: any) {
      throw new Error(`Etsy URL analysis failed: ${error.message}`);
    }
  }

  /**
   * Extract Etsy title
   */
  private static extractEtsyTitle(html: string): string {
    const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    return titleMatch ? titleMatch[1].trim() : '';
  }

  /**
   * Extract Etsy description
   */
  private static extractEtsyDescription(html: string): string {
    const descMatch = html.match(/<p class="wt-text-body-01[^"]*"[^>]*>([^<]+)<\/p>/i);
    return descMatch ? descMatch[1].trim() : '';
  }

  /**
   * Extract Etsy price
   */
  private static extractEtsyPrice(html: string): number | undefined {
    const priceMatch = html.match(/<p class="wt-text-title-03[^"]*"[^>]*>\$([0-9,.]+)<\/p>/i);
    return priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : undefined;
  }

  /**
   * Extract Etsy images
   */
  private static extractEtsyImages(html: string): string[] {
    const images: string[] = [];
    const imageRegex = /<img[^>]+data-src="([^"]+)"[^>]*>/gi;
    let match;

    while ((match = imageRegex.exec(html)) !== null) {
      if (match[1].includes('il_fullxfull')) {
        images.push(match[1]);
      }
    }

    return images;
  }

  /**
   * Analyze Walmart product URL
   */
  private static async analyzeWalmartUrl(url: string): Promise<AnalyzedUrlData> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const html = await response.text();

      return {
        title: this.extractWalmartTitle(html),
        description: this.extractWalmartDescription(html),
        price: this.extractWalmartPrice(html)
      };
    } catch (error: any) {
      throw new Error(`Walmart URL analysis failed: ${error.message}`);
    }
  }

  /**
   * Extract Walmart title
   */
  private static extractWalmartTitle(html: string): string {
    const titleMatch = html.match(/<h1[^>]*itemprop="name"[^>]*>([^<]+)<\/h1>/i);
    return titleMatch ? titleMatch[1].trim() : '';
  }

  /**
   * Extract Walmart description
   */
  private static extractWalmartDescription(html: string): string {
    const descMatch = html.match(/<div[^>]*itemprop="description"[^>]*>([^<]+)<\/div>/i);
    return descMatch ? descMatch[1].trim() : '';
  }

  /**
   * Extract Walmart price
   */
  private static extractWalmartPrice(html: string): number | undefined {
    const priceMatch = html.match(/<span[^>]*itemprop="price"[^>]*content="([0-9.]+)"/i);
    return priceMatch ? parseFloat(priceMatch[1]) : undefined;
  }

  /**
   * Analyze generic product URL
   */
  private static async analyzeGenericUrl(url: string): Promise<AnalyzedUrlData> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const html = await response.text();

      return {
        title: this.extractGenericTitle(html),
        description: this.extractGenericDescription(html),
        price: this.extractGenericPrice(html),
        images: this.extractGenericImages(html)
      };
    } catch (error: any) {
      throw new Error(`Generic URL analysis failed: ${error.message}`);
    }
  }

  /**
   * Extract generic title (from meta tags or h1)
   */
  private static extractGenericTitle(html: string): string {
    // Try og:title first
    let match = html.match(/<meta property="og:title" content="([^"]+)"/i);
    if (match) return match[1].trim();

    // Try title tag
    match = html.match(/<title>([^<]+)<\/title>/i);
    if (match) return match[1].trim();

    // Try h1
    match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    return match ? match[1].trim() : '';
  }

  /**
   * Extract generic description
   */
  private static extractGenericDescription(html: string): string {
    // Try og:description
    let match = html.match(/<meta property="og:description" content="([^"]+)"/i);
    if (match) return match[1].trim();

    // Try meta description
    match = html.match(/<meta name="description" content="([^"]+)"/i);
    return match ? match[1].trim() : '';
  }

  /**
   * Extract generic price
   */
  private static extractGenericPrice(html: string): number | undefined {
    const priceMatch = html.match(/\$([0-9,.]+)/);
    return priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : undefined;
  }

  /**
   * Extract generic images
   */
  private static extractGenericImages(html: string): string[] {
    const images: string[] = [];
    
    // Try og:image
    const ogMatch = html.match(/<meta property="og:image" content="([^"]+)"/i);
    if (ogMatch) images.push(ogMatch[1]);

    // Try img tags
    const imgRegex = /<img[^>]+src="([^"]+)"/gi;
    let match;

    while ((match = imgRegex.exec(html)) !== null) {
      if (match[1].startsWith('http') && !match[1].includes('logo') && !match[1].includes('icon')) {
        images.push(match[1]);
      }
    }

    return images.slice(0, 6);
  }
}
