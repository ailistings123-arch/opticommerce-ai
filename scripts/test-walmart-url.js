/**
 * Test Walmart URL scraping directly (no auth needed — tests the service logic)
 */
const url = 'https://www.walmart.com/ip/Nicebay-Curling-Iron-Professional-Instant-Heat-Up-Hair-Curling-Wand-Set-Curling-Wand/16681615086';

async function test() {
  console.log('Testing Walmart URL scrape...\n');

  const cleanUrl = url.split('?')[0];
  const res = await fetch(cleanUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
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
      'DNT': '1'
    }
  });

  console.log('Status:', res.status, '| Length:', (await res.clone().text()).length);
  const html = await res.text();

  // Check for __NEXT_DATA__
  const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
  if (!nextDataMatch) {
    console.log('❌ No __NEXT_DATA__ found');
    return;
  }

  console.log('✅ __NEXT_DATA__ found, length:', nextDataMatch[1].length);

  try {
    const json = JSON.parse(nextDataMatch[1]);
    const product =
      json?.props?.pageProps?.initialData?.data?.product ||
      json?.props?.pageProps?.initialData?.data?.idmlData;

    if (!product) {
      console.log('❌ No product object found in __NEXT_DATA__');
      console.log('Keys at data level:', Object.keys(json?.props?.pageProps?.initialData?.data || {}));
      return;
    }

    console.log('\n✅ Product found!');
    console.log('Name:', product.name || product.title);
    console.log('Brand:', product.brand || product.brandName);
    console.log('Price:', product.priceInfo?.currentPrice?.price || product.price);
    console.log('Short desc:', (product.shortDescription || '').substring(0, 150));
    console.log('Long desc:', (product.longDescription || '').substring(0, 150));
    console.log('Key features:', product.keyFeatures?.slice(0, 3));
    console.log('Specs count:', (product.specifications || []).length);
    console.log('Images count:', (product.imageInfo?.allImages || []).length);
  } catch (e) {
    console.log('❌ JSON parse failed:', e.message);
  }
}

test().catch(console.error);
