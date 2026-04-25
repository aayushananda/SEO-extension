document.getElementById('analyze-btn').addEventListener('click', async () => {
  const statusDiv = document.getElementById('status-msg');
  const errorDiv = document.getElementById('error-msg');
  const analyzeBtn = document.getElementById('analyze-btn');

  statusDiv.style.display = 'block';
  statusDiv.style.color = '#666';
  statusDiv.textContent = 'Gathering SEO data and communicating with backend...';
  errorDiv.style.display = 'none';
  analyzeBtn.disabled = true;

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (tab.url.startsWith('chrome://') || tab.url.startsWith('https://chrome.google.com/webstore')) {
      throw new Error("Cannot analyze Chrome system pages or the Web Store.");
    }

    const injectionResults = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: scrapeSEOData,
    });

    const seoData = injectionResults[0].result;

    // Send the data to our local backend
    const response = await fetch('http://localhost:5000/generate_seo_report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: tab.url,
        seoData: seoData
      })
    });

    if (!response.ok) {
      const errRes = await response.json();
      throw new Error(errRes.error || 'Failed to generate report from backend.');
    }

    const data = await response.json();

    statusDiv.style.color = '#16a34a';
    statusDiv.textContent = 'Report successfully generated!';

    if (data.summary) {
      document.getElementById('result-container').style.display = 'block';
      const scoreElem = document.getElementById('trust-score');
      scoreElem.textContent = Math.round(data.summary.trust_score);
      
      if (data.summary.trust_score >= 80) scoreElem.style.color = '#16a34a';
      else if (data.summary.trust_score >= 50) scoreElem.style.color = '#ca8a04';
      else scoreElem.style.color = '#dc2626';
      
      document.getElementById('trust-verdict').textContent = data.summary.verdict;
    }

    const reportUrl = 'http://localhost:5173/report/' + data.report_id;

    document.getElementById('view-report-btn').onclick = () => {
      chrome.tabs.create({ url: reportUrl });
    };

    // Automatically open the report in a new tab
    chrome.tabs.create({ url: reportUrl });
  } catch (error) {
    statusDiv.style.display = 'none';
    errorDiv.textContent = `Error: ${error.message}`;
    errorDiv.style.display = 'block';
  } finally {
    analyzeBtn.disabled = false;
  }
});

// The content script injected into the page
function scrapeSEOData() {
  // 1. Basic Meta
  const title = document.title || 'Missing';
  const metaDescTag = document.querySelector('meta[name="description"]');
  const description = metaDescTag ? metaDescTag.getAttribute('content') : 'Missing';
  
  const metaKeywordsTag = document.querySelector('meta[name="keywords"]');
  const keywords = metaKeywordsTag ? metaKeywordsTag.getAttribute('content') : 'Missing';

  // 2. Canonical
  const canonicalTag = document.querySelector('link[rel="canonical"]');
  const canonical = canonicalTag ? canonicalTag.getAttribute('href') : 'Missing';

  // 3. Open Graph & Twitter Cards
  const ogTitleTag = document.querySelector('meta[property="og:title"]');
  const ogTitle = ogTitleTag ? ogTitleTag.getAttribute('content') : 'Missing';
  
  const ogImageTag = document.querySelector('meta[property="og:image"]');
  const ogImage = ogImageTag ? ogImageTag.getAttribute('content') : 'Missing';

  // 4. Headings
  const h1Count = document.querySelectorAll('h1').length;
  const h2Count = document.querySelectorAll('h2').length;
  const h3Count = document.querySelectorAll('h3').length;

  // 5. Images
  const images = document.querySelectorAll('img');
  const imagesWithoutAlt = Array.from(images).filter(img => !img.hasAttribute('alt') || img.getAttribute('alt').trim() === '').length;

  // 6. Links
  const links = document.querySelectorAll('a');
  let internalLinks = 0;
  let externalLinks = 0;
  let nofollowLinks = 0;
  
  const currentHost = window.location.hostname;

  links.forEach(link => {
    if (link.hostname === currentHost || !link.hostname) {
      internalLinks++;
    } else {
      externalLinks++;
    }
    if (link.rel && link.rel.toLowerCase().includes('nofollow')) {
      nofollowLinks++;
    }
  });

  // 7. Word Count
  const text = document.body.innerText || '';
  const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;

  // 8. Performance Timing (Basic Load time info if available)
  let pageLoadTimeMs = -1;
  if (window.performance && window.performance.timing) {
    const t = window.performance.timing;
    pageLoadTimeMs = t.loadEventEnd - t.navigationStart;
    if (pageLoadTimeMs <= 0) {
      pageLoadTimeMs = 'Still loading or unavailable';
    }
  }

  // 9. Technical Indexability
  const robotsTag = document.querySelector('meta[name="robots"]');
  const robots = robotsTag ? robotsTag.getAttribute('content') : 'Missing';
  const viewportTag = document.querySelector('meta[name="viewport"]');
  const viewport = viewportTag ? viewportTag.getAttribute('content') : 'Missing';
  
  // 10. Schema.org
  const schemaTags = document.querySelectorAll('script[type="application/ld+json"]');
  const hasSchema = schemaTags.length > 0;

  // 11. Trust Footprints (Contact Info & Socials)
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emailsFound = [...new Set(text.match(emailRegex) || [])];
  
  let suspiciousSocialLinks = 0;
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href) {
      if (href === '#' || href === 'javascript:void(0)') {
        // basic heuristic for dummy social links
        if(link.className.toLowerCase().includes('social') || link.id.toLowerCase().includes('social')) {
            suspiciousSocialLinks++;
        }
      } else if (href.match(/^https?:\/\/(www\.)?(facebook|twitter|instagram|linkedin|youtube|tiktok)\.com\/?$/i)) {
        suspiciousSocialLinks++; // Generic platform homepage instead of a profile
      }
    }
  });

  return {
    title,
    description,
    keywords,
    canonical,
    ogTitle,
    ogImage,
    h1Count,
    h2Count,
    h3Count,
    imageCount: images.length,
    imagesWithoutAlt,
    totalLinks: links.length,
    internalLinks,
    externalLinks,
    nofollowLinks,
    wordCount,
    pageLoadTimeMs,
    robots,
    viewport,
    hasSchema,
    emailsFound,
    suspiciousSocialLinks
  };
}
