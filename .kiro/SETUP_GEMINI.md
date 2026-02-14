# Setup Gemini API for Better Results

## Current Status
The app is using **fallback responses** because GEMINI_API_KEY is not configured.
The fallback is smart but limited. Real Gemini AI will give MUCH better results.

## How to Get Gemini API Key

1. Go to: https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key (starts with "AIza...")

## How to Add API Key

### For Local Development:
1. Open `.env.local` file in the root folder
2. Replace `your_gemini_api_key_here` with your actual key:
   ```
   GEMINI_API_KEY=AIzaSyC...your_actual_key_here
   ```
3. Save the file
4. The server will auto-reload (you'll see "Reload env: .env.local")

### For Vercel Production (when ready):
1. Go to: https://vercel.com/dashboard
2. Select your project: opticommerce-ai
3. Go to Settings → Environment Variables
4. Add new variable:
   - Name: `GEMINI_API_KEY`
   - Value: Your API key
   - Environment: Production, Preview, Development (check all)
5. Click Save
6. Redeploy the project

## Testing the Results

### Test Mode 1 (Optimize Existing):
1. Go to http://localhost:3000/dashboard
2. Select "Optimize Existing Listing"
3. Enter:
   - Title: "Silicone Phone Case for iPhone 15 Pro"
   - Description: "Protective case with shock absorption"
   - Platform: Amazon
4. Click "Optimize Listing"
5. Check the results - should be detailed and specific

### Test Mode 2 (Create New):
1. Select "Create New Product Listing"
2. Fill in product details
3. Click "Create Listing"
4. Check the generated content

### Test Mode 3 (Analyze URL):
1. Select "Analyze Competitor URL"
2. Paste any Amazon product URL
3. Select analysis type
4. Click "Analyze URL"
5. Check the analysis results

## What Good Results Look Like

### Title:
- ✅ Specific measurements (12oz, 6.1-inch, etc.)
- ✅ Material details (Stainless Steel, Silicone, etc.)
- ✅ Key features (Waterproof, Wireless, etc.)
- ✅ NO generic words (Premium, Best, Quality)
- ✅ NO store names at the end

### Description:
- ✅ 800+ words of detailed content
- ✅ Structured sections with headers
- ✅ Bullet points for features
- ✅ Specifications table
- ✅ Care instructions
- ✅ Use cases
- ✅ ALL content specific to the product
- ✅ NO generic filler

### Tags:
- ✅ 7-10 specific keywords
- ✅ Searchable terms customers use
- ✅ Product-related only

## Current AI Training

The AI is trained as:
- **Role**: Elite e-commerce expert with 15+ years experience
- **Platforms**: Amazon, Shopify, eBay, Etsy, Walmart
- **Focus**: SEO, conversion, platform algorithms
- **Rules**: 
  - Remove banned words (Premium, Best, etc.)
  - Remove store names from titles
  - Create 800+ word descriptions
  - Use specific measurements
  - Include detailed specifications
  - Add care instructions
  - Provide use cases

## Fallback vs Real AI

### Fallback (Current):
- Uses template-based generation
- Smart product analysis
- Good structure
- Limited creativity
- Generic in some areas

### Real Gemini AI (With API Key):
- Deep understanding of product
- Creative and engaging content
- Platform-specific optimization
- Better keyword integration
- More natural language
- Adapts to product type
- Follows all training rules

## Next Steps

1. Add your Gemini API key to `.env.local`
2. Test all 3 modes on localhost
3. Verify results are detailed and specific
4. When satisfied, add key to Vercel for production
5. Deploy to production

## Troubleshooting

### If you see "Model not found" error:
- API key is invalid or missing
- Check the key starts with "AIza"
- Make sure no extra spaces in .env.local

### If results are still generic:
- Check browser console for API errors
- Verify API key has no usage limits
- Try a different product with more details

### If server doesn't reload:
- Stop the server (Ctrl+C)
- Run `npm run dev` again
- Check .env.local file is saved

## Cost

Gemini API is FREE for:
- 60 requests per minute
- 1,500 requests per day
- 1 million tokens per month

This is more than enough for testing and moderate use.
