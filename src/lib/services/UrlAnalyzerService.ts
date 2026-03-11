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
    const selectors = [
      /<span id="productTitle"[^>]*>([^<]+)<\/span>/i,
      /<h1[^>]*id="title"[^>]*>([^<]+)<\/h1>/i,
      /<meta property="og:title" content="([^"]+)"/i,
      /<title>([^<:]+)/i
    ];

    for (const selector of selectors) {
      const match = html.match(selector);
      if (match && match[1].trim()) {
        return match[1].trim().replace(/\s+/g, ' ');
      }
    }

    return 'Product Title';
  }

  /**
   * Extract Amazon description
   */
  private static extractAmazonDescription(html: string): string {
    const selectors = [
      /<div id="productDescription"[^>]*>[\s\S]*?<p>([^<]+)<\/p>/i,
      /<div id="feature-bullets"[^>]*>([\s\S]*?)<\/div>/i,
      /<meta property="og:description" content="([^"]+)"/i,
      /<meta name="description" content="([^"]+)"/i
    ];

    for (const selector of selectors) {
      const match = html.match(selector);
      if (match && match[1]) {
        let desc = match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        if (desc.length > 50) {
          return desc.substring(0, 2000);
        }
      }
    }

    return 'Product description';
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
    // Try multiple selectors for eBay title
    const selectors = [
      /<h1 class="x-item-title__mainTitle"[^>]*><span class="ux-textspans[^"]*">([^<]+)<\/span><\/h1>/i,
      /<h1 class="x-item-title__mainTitle"[^>]*>([^<]+)<\/h1>/i,
      /<h1[^>]*itemprop="name"[^>]*>([^<]+)<\/h1>/i,
      /<meta property="og:title" content="([^"]+)"/i,
      /<title>([^<|]+)/i
    ];

    for (const selector of selectors) {
      const match = html.match(selector);
      if (match && match[1].trim()) {
        return match[1].trim().replace(/\s+/g, ' ');
      }
    }

    return 'Product Title';
  }

  /**
   * Extract eBay description
   */
  private static extractEbayDescription(html: string): string {
    // Try multiple selectors for description
    const selectors = [
      /<div class="x-item-description"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*id="desc_div"[^>]*>([\s\S]*?)<\/div>/i,
      /<meta property="og:description" content="([^"]+)"/i,
      /<meta name="description" content="([^"]+)"/i
    ];

    for (const selector of selectors) {
      const match = html.match(selector);
      if (match && match[1]) {
        let desc = match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        if (desc.length > 50) {
          return desc.substring(0, 2000);
        }
      }
    }

    return 'Product description';
  }

  /**
   * Extract eBay price
   */
  private static extractEbayPrice(html: string): number | undefined {
    // Try multiple price selectors
    const pricePatterns = [
      /<span class="ux-textspans">US \$([0-9,.]+)<\/span>/i,
      /<span[^>]*class="[^"]*x-price-primary[^"]*"[^>]*>US \$([0-9,.]+)<\/span>/i,
      /<span[^>]*itemprop="price"[^>]*content="([0-9.]+)"/i,
      /\$([0-9,.]+)/
    ];

    for (const pattern of pricePatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        const price = parseFloat(match[1].replace(/,/g, ''));
        if (!isNaN(price) && price > 0) {
          return price;
        }
      }
    }

    return undefined;
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
    
    // Try multiple spec patterns
    const patterns = [
      /<dt class="ux-labels-values__labels"[^>]*><span[^>]*>([^<]+)<\/span><\/dt>[\s\S]*?<dd class="ux-labels-values__values"[^>]*><span[^>]*>([^<]+)<\/span><\/dd>/gi,
      /<dt class="ux-labels-values__labels"[^>]*>([^<]+)<\/dt>[\s\S]*?<dd class="ux-labels-values__values"[^>]*>([^<]+)<\/dd>/gi,
      /<div class="ux-layout-section-evo__col"[^>]*><span class="ux-textspans ux-textspans--BOLD">([^<]+)<\/span><\/div>[\s\S]*?<div class="ux-layout-section-evo__col"[^>]*><span class="ux-textspans">([^<]+)<\/span><\/div>/gi
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        const name = match[1].trim();
        const value = match[2].trim();
        if (name && value && name.length < 100 && value.length < 200) {
          specs.push({ name, value });
        }
      }
      if (specs.length > 0) break;
    }

    return specs.slice(0, 15);
  }

  /**
   * Analyze Etsy product URL - ENHANCED v3 with anti-bot bypass
   */
  private static async analyzeEtsyUrl(url: string): Promise<AnalyzedUrlData> {
    try {
      console.log('[UrlAnalyzer] Analyzing Etsy URL:', url);
      
      // Clean URL - remove tracking parameters
      const cleanUrl = url.split('?')[0];
      console.log('[UrlAnalyzer] Clean URL:', cleanUrl);
      
      const response = await fetch(cleanUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Cache-Control': 'max-age=0',
          'DNT': '1',
          'Referer': 'https://www.etsy.com/'
        }
      });

      if (!response.ok) {
        console.error('[UrlAnalyzer] HTTP Error:', response.status, response.statusText);
        
        // If 403, try to extract from URL and provide manual input option
        if (response.status === 403) {
          // Extract product ID from URL
          const productIdMatch = cleanUrl.match(/\/listing\/(\d+)/);
          const productId = productIdMatch ? productIdMatch[1] : '';
          
          // Extract title from URL slug
          const titleMatch = cleanUrl.match(/\/listing\/\d+\/([^?]+)/);
          let title = 'Etsy Product';
          if (titleMatch) {
            title = titleMatch[1]
              .replace(/-/g, ' ')
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
          }
          
          console.log('[UrlAnalyzer] Extracted from URL - Title:', title);
          
          return {
            title: title,
            description: `This is a handmade/digital product available on Etsy. Please provide more details about the product for better optimization. Product ID: ${productId}`,
            category: 'Handmade',
            price: undefined,
            images: []
          };
        }
        
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      console.log('[UrlAnalyzer] HTML fetched, length:', html.length);

      const title = this.extractEtsyTitle(html);
      const description = this.extractEtsyDescription(html);
      const price = this.extractEtsyPrice(html);
      const images = this.extractEtsyImages(html);

      console.log('[UrlAnalyzer] Extracted - Title:', title, '| Desc length:', description.length, '| Images:', images.length);

      return {
        title,
        description,
        price,
        images,
        category: 'Handmade' // Default for Etsy
      };
    } catch (error: any) {
      console.error('[UrlAnalyzer] Etsy analysis failed:', error.message);
      
      // Fallback: Extract what we can from the URL
      const titleMatch = url.match(/\/listing\/\d+\/([^?]+)/);
      if (titleMatch) {
        const title = titleMatch[1]
          .replace(/-/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        console.log('[UrlAnalyzer] Fallback - Extracted title from URL:', title);
        
        return {
          title: title,
          description: 'Handmade/digital product from Etsy. Please provide additional product details for optimal results.',
          category: 'Handmade',
          price: undefined,
          images: []
        };
      }
      
      throw new Error(`Etsy URL analysis failed: ${error.message}`);
    }
  }

  /**
   * Extract Etsy title - ENHANCED with multiple selectors
   */
  private static extractEtsyTitle(html: string): string {
    // Try multiple selectors in order of reliability
    const selectors = [
      // Meta tags (most reliable)
      /<meta property="og:title" content="([^"]+)"/i,
      /<meta name="twitter:title" content="([^"]+)"/i,
      /<title>([^|<]+)/i,
      // HTML elements
      /<h1[^>]*class="[^"]*wt-text-body-03[^"]*"[^>]*>([^<]+)<\/h1>/i,
      /<h1[^>]*>([^<]+)<\/h1>/i,
      // JSON-LD structured data
      /"name"\s*:\s*"([^"]+)"/i
    ];

    for (const selector of selectors) {
      const match = html.match(selector);
      if (match && match[1] && match[1].trim().length > 5) {
        let title = match[1].trim();
        // Clean up title
        title = title.replace(/\s*\|\s*Etsy.*$/i, ''); // Remove "| Etsy" suffix
        title = title.replace(/\s+/g, ' '); // Normalize whitespace
        title = title.replace(/&amp;/g, '&'); // Decode HTML entities
        title = title.replace(/&quot;/g, '"');
        title = title.replace(/&#39;/g, "'");
        title = title.replace(/&ndash;/g, '–');
        title = title.replace(/&mdash;/g, '—');
        if (title.length > 10) {
          return title;
        }
      }
    }

    return 'Etsy Product';
  }

  /**
   * Extract Etsy description - ENHANCED with multiple selectors
   */
  private static extractEtsyDescription(html: string): string {
    const selectors = [
      // Meta tags
      /<meta property="og:description" content="([^"]+)"/i,
      /<meta name="description" content="([^"]+)"/i,
      /<meta name="twitter:description" content="([^"]+)"/i,
      // HTML elements
      /<p class="wt-text-body-01[^"]*"[^>]*>([^<]+)<\/p>/i,
      /<div[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]{50,2000}?)<\/div>/i,
      // JSON-LD
      /"description"\s*:\s*"([^"]+)"/i
    ];

    for (const selector of selectors) {
      const match = html.match(selector);
      if (match && match[1]) {
        let desc = match[1].trim();
        // Clean up description
        desc = desc.replace(/<[^>]+>/g, ' '); // Remove HTML tags
        desc = desc.replace(/\s+/g, ' '); // Normalize whitespace
        desc = desc.replace(/&amp;/g, '&'); // Decode HTML entities
        desc = desc.replace(/&quot;/g, '"');
        desc = desc.replace(/&#39;/g, "'");
        desc = desc.replace(/&ndash;/g, '–');
        desc = desc.replace(/&mdash;/g, '—');
        if (desc.length > 50) {
          return desc.substring(0, 2000);
        }
      }
    }

    return 'Handmade product description';
  }

  /**
   * Extract Etsy price - ENHANCED with multiple selectors
   */
  private static extractEtsyPrice(html: string): number | undefined {
    const selectors = [
      // Meta tags
      /<meta property="og:price:amount" content="([0-9,.]+)"/i,
      /<meta property="product:price:amount" content="([0-9,.]+)"/i,
      // HTML elements
      /<p class="wt-text-title-03[^"]*"[^>]*>\$([0-9,.]+)<\/p>/i,
      /<span[^>]*class="[^"]*currency-value[^"]*"[^>]*>([0-9,.]+)<\/span>/i,
      // JSON-LD
      /"price"\s*:\s*"?([0-9,.]+)"?/i
    ];

    for (const selector of selectors) {
      const match = html.match(selector);
      if (match && match[1]) {
        const price = parseFloat(match[1].replace(/,/g, ''));
        if (!isNaN(price) && price > 0) {
          return price;
        }
      }
    }

    return undefined;
  }

  /**
   * Extract Etsy images - ENHANCED with multiple selectors
   */
  private static extractEtsyImages(html: string): string[] {
    const images: string[] = [];
    
    // Try multiple image extraction methods
    const patterns = [
      // Meta tags
      /<meta property="og:image" content="([^"]+)"/gi,
      /<meta name="twitter:image" content="([^"]+)"/gi,
      // Data attributes
      /<img[^>]+data-src="([^"]+)"[^>]*>/gi,
      /<img[^>]+data-src-zoom="([^"]+)"[^>]*>/gi,
      // Regular src
      /<img[^>]+src="([^"]+il_fullxfull[^"]+)"[^>]*>/gi,
      /<img[^>]+src="([^"]+il_1588xN[^"]+)"[^>]*>/gi
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        const imageUrl = match[1];
        // Only add high-quality Etsy images
        if (imageUrl && 
            (imageUrl.includes('il_fullxfull') || 
             imageUrl.includes('il_1588xN') ||
             imageUrl.includes('il_794xN'))) {
          if (!images.includes(imageUrl)) {
            images.push(imageUrl);
          }
        }
      }
    }

    return images.slice(0, 10); // Return up to 10 images
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
    const selectors = [
      /<h1[^>]*itemprop="name"[^>]*>([^<]+)<\/h1>/i,
      /<h1[^>]*class="[^"]*prod-ProductTitle[^"]*"[^>]*>([^<]+)<\/h1>/i,
      /<h1[^>]*data-automation-id="product-title"[^>]*>([^<]+)<\/h1>/i,
      /<meta property="og:title" content="([^"]+)"/i,
      /<title>([^<|]+)/i
    ];

    for (const selector of selectors) {
      const match = html.match(selector);
      if (match && match[1].trim()) {
        return match[1].trim().replace(/\s+/g, ' ');
      }
    }

    return 'Product Title';
  }

  /**
   * Extract Walmart description
   */
  private static extractWalmartDescription(html: string): string {
    const selectors = [
      /<div[^>]*itemprop="description"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*class="[^"]*about-desc[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*data-automation-id="product-description"[^>]*>([\s\S]*?)<\/div>/i,
      /<meta property="og:description" content="([^"]+)"/i,
      /<meta name="description" content="([^"]+)"/i
    ];

    for (const selector of selectors) {
      const match = html.match(selector);
      if (match && match[1]) {
        let desc = match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        if (desc.length > 50) {
          return desc.substring(0, 2000);
        }
      }
    }

    return 'Product description';
  }

  /**
   * Extract Walmart price
   */
  private static extractWalmartPrice(html: string): number | undefined {
    const pricePatterns = [
      /<span[^>]*itemprop="price"[^>]*content="([0-9.]+)"/i,
      /<span[^>]*class="[^"]*price-characteristic[^"]*"[^>]*>([0-9]+)<\/span>/i,
      /\$([0-9,.]+)/
    ];

    for (const pattern of pricePatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        const price = parseFloat(match[1].replace(/,/g, ''));
        if (!isNaN(price) && price > 0) {
          return price;
        }
      }
    }

    return undefined;
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
