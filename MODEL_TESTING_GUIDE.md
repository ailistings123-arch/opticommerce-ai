# 🧪 Model Testing & Validation Guide

## Quick Test Commands

### 1. Test AI Provider Health
```bash
curl -X GET http://localhost:3000/api/ai-health
```

Expected response:
```json
{
  "status": "healthy",
  "providers": {
    "groq": { "available": true, "model": "llama-3.3-70b-versatile" },
    "cloudflare": { "available": true, "model": "@cf/meta/llama-3.1-70b-instruct" },
    "gemini": { "available": true, "model": "gemini-2.0-flash" }
  }
}
```

### 2. Test Simple Listing Generation
```bash
curl -X POST http://localhost:3000/api/generate-listing \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "platform": "amazon",
    "productData": {
      "title": "Wireless Mouse",
      "description": "A good wireless mouse for computers",
      "category": "Electronics",
      "price": 29.99
    },
    "mode": "create"
  }'
```

Expected: SEO score ≥85%, title utilization ≥95%

### 3. Test Optimization Mode
```bash
curl -X POST http://localhost:3000/api/generate-listing \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "platform": "amazon",
    "productData": {
      "title": "Sony WH-1000XM5 Wireless Noise Cancelling Headphones - 40Hr Battery, Multipoint Connection, Alexa Built-in, Premium Sound Quality for Travel, Work & Music - Black",
      "description": "Premium wireless headphones with industry-leading noise cancellation...",
      "category": "Electronics"
    },
    "mode": "optimize"
  }'
```

Expected: Should recognize excellent listing and make minimal changes

### 4. Test All Platforms
```bash
# Amazon
curl -X POST http://localhost:3000/api/generate-listing \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"platform": "amazon", "productData": {"title": "Test Product", "description": "Test", "category": "Electronics"}, "mode": "create"}'

# eBay
curl -X POST http://localhost:3000/api/generate-listing \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"platform": "ebay", "productData": {"title": "Test Product", "description": "Test", "category": "Electronics"}, "mode": "create"}'

# Etsy
curl -X POST http://localhost:3000/api/generate-listing \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"platform": "etsy", "productData": {"title": "Test Product", "description": "Test", "category": "Handmade"}, "mode": "create"}'

# Shopify
curl -X POST http://localhost:3000/api/generate-listing \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"platform": "shopify", "productData": {"title": "Test Product", "description": "Test", "category": "Electronics"}, "mode": "create"}'

# Walmart
curl -X POST http://localhost:3000/api/generate-listing \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"platform": "walmart", "productData": {"title": "Test Product", "description": "Test", "category": "Electronics"}, "mode": "create"}'

# WooCommerce
curl -X POST http://localhost:3000/api/generate-listing \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"platform": "woocommerce", "productData": {"title": "Test Product", "description": "Test", "category": "Electronics"}, "mode": "create"}'
```

## Validation Checklist

### ✅ Character Utilization
- [ ] Amazon title: 180-200 chars (90-100%)
- [ ] eBay title: 72-80 chars (90-100%)
- [ ] Etsy title: 126-140 chars (90-100%)
- [ ] Shopify title: 60-70 chars (85-100%)
- [ ] Walmart title: 68-75 chars (90-100%)
- [ ] WooCommerce title: 60-70 chars (85-100%)

### ✅ SEO Score
- [ ] New listings: ≥85%
- [ ] Optimized listings: ≥90%
- [ ] Excellent listings: ≥95%

### ✅ Content Quality
- [ ] No prohibited words (FREE, SALE, BEST, #1, etc.)
- [ ] Keywords in first 80 characters
- [ ] Benefit-first bullet structure
- [ ] Minimum description length met
- [ ] Professional tone maintained
- [ ] No HTML entities in output

### ✅ Platform Compliance
- [ ] Amazon: 5 bullets, backend search terms
- [ ] eBay: Item specifics, condition details
- [ ] Etsy: All 13 tags used, story-driven
- [ ] Shopify: Meta description, SEO-optimized
- [ ] Walmart: 6 bullets, family-friendly
- [ ] WooCommerce: Product schema, SEO tags

### ✅ Performance
- [ ] Response time <5s for simple generation
- [ ] Response time <8s for deep analysis
- [ ] Success rate ≥98%
- [ ] Provider fallback working
- [ ] Auto-training saving examples (≥85% score)

## Test Scenarios

### Scenario 1: Poor Input → Excellent Output
**Input:**
```json
{
  "platform": "amazon",
  "productData": {
    "title": "Headphones",
    "description": "Good headphones",
    "category": "Electronics"
  },
  "mode": "create"
}
```

**Expected Output:**
- Title: 180-200 chars with brand, specs, features
- 5 detailed bullets with CAPS benefits
- Description: 1000+ chars, keyword-rich
- SEO Score: ≥85%
- Keywords: 10-15 relevant terms

### Scenario 2: Excellent Input → Minimal Changes
**Input:**
```json
{
  "platform": "amazon",
  "productData": {
    "title": "Sony WH-1000XM5 Wireless Noise Cancelling Headphones - 40Hr Battery, Multipoint Connection, Alexa Built-in, Premium Sound Quality for Travel, Work & Music - Black",
    "description": "Experience industry-leading noise cancellation...",
    "category": "Electronics"
  },
  "mode": "optimize"
}
```

**Expected Output:**
- Title: Minimal or no changes
- SEO Score: ≥90%
- Platform notes: "SEO is already excellent. No major changes needed."

### Scenario 3: Multi-Platform Consistency
**Input:** Same product for all 6 platforms

**Expected:**
- Each platform gets platform-specific optimization
- Character limits respected per platform
- Tone adjusted per platform (Amazon: professional, Etsy: warm)
- All achieve ≥85% SEO score

### Scenario 4: Image Analysis Integration
**Input:**
```json
{
  "platform": "amazon",
  "productData": {
    "title": "Leather Jacket",
    "description": "Leather jacket",
    "category": "Fashion"
  },
  "images": ["https://example.com/jacket1.jpg", "https://example.com/jacket2.jpg"],
  "mode": "create"
}
```

**Expected:**
- Colors extracted from images
- Style detected (vintage, modern, etc.)
- Features identified (zipper, pockets, etc.)
- Integrated into title and description

### Scenario 5: Bulk Processing
**Input:** 10 products simultaneously

**Expected:**
- All processed in <30s
- Each gets individual optimization
- No cross-contamination
- All achieve ≥85% SEO score

## Performance Benchmarks

### Response Time Targets
| Operation | Target | Acceptable | Poor |
|-----------|--------|------------|------|
| Simple generation | <3s | <5s | >5s |
| Full generation | <5s | <8s | >8s |
| Deep analysis | <8s | <12s | >12s |
| Bulk (10 products) | <30s | <45s | >45s |
| Bulk (100 products) | <4min | <6min | >6min |

### Quality Targets
| Metric | Excellent | Good | Fair | Poor |
|--------|-----------|------|------|------|
| SEO Score | ≥90% | 75-89% | 60-74% | <60% |
| Char Utilization | ≥95% | 85-94% | 75-84% | <75% |
| Keyword Density | 2-3% | 1.5-2% | 1-1.5% | <1% |
| Readability | ≥80 | 70-79 | 60-69 | <60 |

### Success Rate Targets
| Provider | Target | Acceptable | Poor |
|----------|--------|------------|------|
| Groq | ≥98% | ≥95% | <95% |
| Cloudflare | ≥98% | ≥95% | <95% |
| Gemini | ≥98% | ≥95% | <95% |
| Overall | ≥98% | ≥95% | <95% |

## Automated Testing Script

Create `test-models.sh`:

```bash
#!/bin/bash

echo "🧪 Testing AI Models..."

# Test 1: Provider Health
echo "Test 1: Provider Health"
curl -s http://localhost:3000/api/ai-health | jq .

# Test 2: Amazon Generation
echo "Test 2: Amazon Generation"
curl -s -X POST http://localhost:3000/api/generate-listing \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "platform": "amazon",
    "productData": {
      "title": "Wireless Mouse",
      "description": "Good mouse",
      "category": "Electronics"
    },
    "mode": "create"
  }' | jq '.listing.title, .qualityScore.percentage'

# Test 3: eBay Generation
echo "Test 3: eBay Generation"
curl -s -X POST http://localhost:3000/api/generate-listing \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "platform": "ebay",
    "productData": {
      "title": "Vintage Camera",
      "description": "Old camera",
      "category": "Collectibles"
    },
    "mode": "create"
  }' | jq '.listing.title, .qualityScore.percentage'

# Test 4: Etsy Generation
echo "Test 4: Etsy Generation"
curl -s -X POST http://localhost:3000/api/generate-listing \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "platform": "etsy",
    "productData": {
      "title": "Handmade Necklace",
      "description": "Beautiful necklace",
      "category": "Jewelry"
    },
    "mode": "create"
  }' | jq '.listing.title, .qualityScore.percentage'

echo "✅ All tests complete!"
```

Run with:
```bash
chmod +x test-models.sh
export TOKEN="your_auth_token"
./test-models.sh
```

## Monitoring Dashboard

### Key Metrics to Monitor
1. **SEO Score Distribution**
   - Average: Should be ≥90%
   - Median: Should be ≥92%
   - 95th percentile: Should be ≥95%

2. **Response Time Distribution**
   - P50: <3s
   - P95: <8s
   - P99: <12s

3. **Success Rate**
   - Overall: ≥98%
   - Per provider: ≥95%
   - Per platform: ≥98%

4. **Training System**
   - Examples saved per day: 50-200
   - Average score of saved examples: ≥85%
   - Category coverage: All 25 categories

5. **User Satisfaction**
   - Rating: ≥4.5/5 stars
   - Conversion improvement: +15% average
   - Return rate: <5%

## Troubleshooting

### Issue: Low SEO Scores (<85%)
**Diagnosis:**
- Check character utilization
- Verify keyword integration
- Review platform compliance

**Fix:**
- Adjust temperature (lower = more consistent)
- Enhance training data
- Review prompt engineering

### Issue: Slow Response Times (>8s)
**Diagnosis:**
- Check provider latency
- Review network conditions
- Check concurrent requests

**Fix:**
- Enable caching
- Optimize provider selection
- Reduce max tokens if needed

### Issue: Provider Failures
**Diagnosis:**
- Check API keys
- Review rate limits
- Check provider status

**Fix:**
- Verify environment variables
- Enable fallback providers
- Increase cooldown period

### Issue: Poor Quality Output
**Diagnosis:**
- Review training examples
- Check prompt structure
- Verify validation rules

**Fix:**
- Add more training examples
- Enhance prompt engineering
- Adjust scoring weights

## Success Criteria

### ✅ Ready for Production
- [ ] All 6 platforms tested and working
- [ ] SEO scores averaging ≥90%
- [ ] Response times <5s average
- [ ] Success rate ≥98%
- [ ] Auto-training saving examples
- [ ] Provider fallback working
- [ ] No prohibited words in output
- [ ] Character utilization ≥95%
- [ ] All validation checks passing
- [ ] User testing completed with ≥4.5/5 rating

### 🚀 Optimization Complete
Once all criteria are met, the system is production-ready and will:
- Generate professional, SEO-optimized listings
- Rank higher in platform search results
- Convert better (15-25% improvement expected)
- Improve continuously through auto-training
- Handle all platforms with platform-specific optimization
- Maintain 98%+ success rate
- Deliver results in <5s average

---

**Last Updated**: 2026-03-08
**Version**: 2.0
**Status**: ✅ Production Ready
