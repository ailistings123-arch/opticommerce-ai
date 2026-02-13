# OptiCommerce AI - Testing Guide

## 🚀 Local Testing (CURRENT)

### Server Status
✅ **Development server running on:** http://localhost:3000

### Test the Master Training Prompt Implementation

#### Test Case 1: Phone Case Product
**Input:**
- Title: "Phone Case - Phonecase.PK"
- Description: "Premium quality phone case for protection"
- Platform: Amazon
- Keywords: "phone case, protective, silicone"

**Expected Output:**
- ✅ Title removes "Phonecase.PK" and banned words like "Premium"
- ✅ Title includes specific materials (e.g., "Silicone")
- ✅ Title includes compatibility (e.g., "iPhone 13/14/15")
- ✅ Description is 800+ words
- ✅ Description has structured sections with bullet points
- ✅ No generic filler phrases
- ✅ SEO score 90+

#### Test Case 2: Water Bottle
**Input:**
- Title: "Best Water Bottle"
- Description: "Great quality water bottle for daily use"
- Platform: Shopify
- Keywords: "water bottle, insulated, stainless steel"

**Expected Output:**
- ✅ Title removes "Best" (banned word)
- ✅ Title includes capacity (e.g., "32oz")
- ✅ Title includes material (e.g., "Stainless Steel")
- ✅ Title includes key feature (e.g., "Insulated")
- ✅ Description focuses on specific features
- ✅ Includes temperature retention specs
- ✅ Care instructions included

#### Test Case 3: Office Chair Cushion
**Input:**
- Title: "Seat Cushion"
- Description: "Comfortable cushion for office chairs"
- Platform: Etsy
- Keywords: "seat cushion, memory foam, ergonomic"

**Expected Output:**
- ✅ Title is descriptive and natural (Etsy style)
- ✅ Includes use case (e.g., "Office Chair Pad")
- ✅ Includes material (e.g., "Memory Foam")
- ✅ Includes benefit (e.g., "Pain Relief")
- ✅ Warm, personal tone in description
- ✅ Story about product creation
- ✅ Gift suggestions included

#### Test Case 4: Laptop Bag
**Input:**
- Title: "Laptop Bag - MyStore.com"
- Description: "High quality laptop bag with multiple compartments"
- Platform: eBay
- Keywords: "laptop bag, backpack, 15 inch"

**Expected Output:**
- ✅ Title removes "MyStore.com"
- ✅ Title removes "High quality"
- ✅ Title uses all 80 characters
- ✅ Includes size (e.g., "15.6 Inch")
- ✅ Includes features (e.g., "Multiple Compartments")
- ✅ Includes condition (e.g., "New")
- ✅ Professional eBay formatting

#### Test Case 5: Yoga Mat
**Input:**
- Title: "Ultimate Yoga Mat"
- Description: "Amazing yoga mat for all your fitness needs"
- Platform: Walmart
- Keywords: "yoga mat, exercise mat, non-slip"

**Expected Output:**
- ✅ Title removes "Ultimate" and "Amazing"
- ✅ Includes thickness (e.g., "6mm")
- ✅ Includes material (e.g., "TPE")
- ✅ Includes size (e.g., "72x26 inch")
- ✅ Clear, value-focused description
- ✅ Family-friendly tone
- ✅ Practical benefits highlighted

## 📊 Quality Metrics to Verify

### Title Quality
- [ ] No banned words (Premium, Best, Top, etc.)
- [ ] No store names or URLs
- [ ] No HTML entities
- [ ] Includes specific measurements
- [ ] Includes material information
- [ ] Platform-appropriate length
- [ ] Natural, readable language

### Description Quality
- [ ] Minimum 800 words
- [ ] Structured sections with headers
- [ ] 6-10 bullet points for features
- [ ] Material & construction details
- [ ] Functionality explanation
- [ ] Design & physical details
- [ ] Specifications table
- [ ] Care instructions
- [ ] Package contents
- [ ] Use case scenarios
- [ ] No generic filler phrases
- [ ] No vague claims

### SEO Quality
- [ ] Primary keywords in title (first 50 chars)
- [ ] Keywords naturally integrated
- [ ] Long-tail keywords included
- [ ] LSI keywords present
- [ ] Keyword density 1-2%
- [ ] SEO score 90+

### Compliance
- [ ] Platform-specific rules followed
- [ ] Character limits respected
- [ ] Formatting appropriate
- [ ] No prohibited content
- [ ] Mobile-optimized

## 🧪 Testing Steps

### 1. Access the Application
Open browser and navigate to: http://localhost:3000

### 2. Login/Signup
- Create a test account or login
- Verify authentication works

### 3. Navigate to Dashboard
- Go to optimization form
- Verify all fields are present

### 4. Test Each Platform

**For Amazon:**
1. Enter test product details
2. Select "Amazon" platform
3. Click "Optimize"
4. Verify output matches Amazon rules
5. Check title length (150-200 chars)
6. Verify bullet points format
7. Check backend keywords

**For Shopify:**
1. Enter test product details
2. Select "Shopify" platform
3. Click "Optimize"
4. Verify title is 60-70 chars
5. Check meta description
6. Verify tags are appropriate

**For eBay:**
1. Enter test product details
2. Select "eBay" platform
3. Click "Optimize"
4. Verify title uses all 80 chars
5. Check item specifics
6. Verify professional formatting

**For Etsy:**
1. Enter test product details
2. Select "Etsy" platform
3. Click "Optimize"
4. Verify warm, personal tone
5. Check 13 tags
6. Verify natural language

**For Walmart:**
1. Enter test product details
2. Select "Walmart" platform
3. Click "Optimize"
4. Verify clear, concise title
5. Check value-focused description
6. Verify family-friendly tone

### 5. Verify Improvements List
- Check that 5-7 specific improvements are listed
- Verify improvements are concrete (not vague)
- Confirm explanations are provided

### 6. Check SEO Score
- Verify score is displayed
- Confirm score is 90+ for good content
- Check score breakdown if available

### 7. Test Edge Cases

**Empty Fields:**
- Try submitting with empty title
- Try submitting with empty description
- Verify error handling

**Very Short Input:**
- Title: "Mug"
- Description: "A mug"
- Verify AI expands appropriately

**Very Long Input:**
- Paste 2000+ word description
- Verify AI condenses appropriately

**Special Characters:**
- Include emojis, symbols
- Verify proper handling

**Multiple Languages:**
- Try non-English input
- Verify handling

## 🐛 Known Issues to Check

### Title Issues
- [ ] Store names still appearing?
- [ ] Banned words still present?
- [ ] HTML entities not removed?
- [ ] Too short or too long?

### Description Issues
- [ ] Less than 800 words?
- [ ] Generic filler phrases?
- [ ] Missing sections?
- [ ] No bullet points?
- [ ] Vague claims?

### Platform Issues
- [ ] Wrong format for platform?
- [ ] Character limits exceeded?
- [ ] Missing platform-specific elements?

### Performance Issues
- [ ] Slow response time (>30 seconds)?
- [ ] API errors?
- [ ] Timeout issues?

## ✅ Success Criteria

### Must Pass
1. ✅ All banned words removed from titles
2. ✅ All store names removed from titles
3. ✅ Descriptions are 800+ words
4. ✅ Descriptions have structured sections
5. ✅ No generic filler phrases
6. ✅ Platform-specific rules followed
7. ✅ SEO score 85+
8. ✅ Natural, human-like writing

### Should Pass
1. ✅ SEO score 90+
2. ✅ Keyword density 1-2%
3. ✅ Mobile-optimized
4. ✅ Response time <15 seconds
5. ✅ Specific measurements included
6. ✅ Material information present

### Nice to Have
1. ✅ SEO score 95+
2. ✅ Competitive analysis
3. ✅ A/B testing suggestions
4. ✅ Image optimization tips

## 📝 Test Results Log

### Test Session: [Date/Time]

**Test 1: Phone Case (Amazon)**
- Input: [Record input]
- Output: [Record output]
- Title Quality: ✅/❌
- Description Quality: ✅/❌
- SEO Score: [Score]
- Issues Found: [List]
- Status: PASS/FAIL

**Test 2: Water Bottle (Shopify)**
- Input: [Record input]
- Output: [Record output]
- Title Quality: ✅/❌
- Description Quality: ✅/❌
- SEO Score: [Score]
- Issues Found: [List]
- Status: PASS/FAIL

**Test 3: Office Cushion (Etsy)**
- Input: [Record input]
- Output: [Record output]
- Title Quality: ✅/❌
- Description Quality: ✅/❌
- SEO Score: [Score]
- Issues Found: [List]
- Status: PASS/FAIL

**Test 4: Laptop Bag (eBay)**
- Input: [Record input]
- Output: [Record output]
- Title Quality: ✅/❌
- Description Quality: ✅/❌
- SEO Score: [Score]
- Issues Found: [List]
- Status: PASS/FAIL

**Test 5: Yoga Mat (Walmart)**
- Input: [Record input]
- Output: [Record output]
- Title Quality: ✅/❌
- Description Quality: ✅/❌
- SEO Score: [Score]
- Issues Found: [List]
- Status: PASS/FAIL

## 🔧 Troubleshooting

### If AI Returns Generic Content
1. Check if master training prompt is loaded
2. Verify Gemini API key is set
3. Check model name is correct
4. Review prompt structure

### If Titles Still Have Banned Words
1. Check enhanceTitle() function
2. Verify banned words list is complete
3. Check regex patterns
4. Test with specific examples

### If Descriptions Are Too Short
1. Check minimum word count enforcement
2. Verify prompt includes "MINIMUM 800 words"
3. Check AI model temperature settings
4. Review fallback response

### If Platform Rules Not Followed
1. Check getPlatformRules() function
2. Verify platform name matching
3. Check prompt includes platform rules
4. Test with each platform individually

## 📞 Support

If issues persist:
1. Check `.env.local` for API keys
2. Review console logs for errors
3. Check network tab for API calls
4. Verify Firebase configuration
5. Test with different products
6. Try different platforms

---

**Testing Status:** 🔄 IN PROGRESS
**Last Updated:** 2024-02-13
**Next Steps:** Complete all test cases, document results, fix issues, deploy
