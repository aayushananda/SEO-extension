def generate_insights(seo_data, ml_score, domain_age_days, pagespeed_data=None):
    insights = {
        "critical_errors": [],
        "warnings": [],
        "passed_checks": []
    }

    # 1. Technical Indexability
    if seo_data.get('robots') and 'noindex' in seo_data.get('robots', '').lower():
        insights["critical_errors"].append({
            "issue": "Robots noindex tag found",
            "impact": "High - Search engines are instructed NOT to index your page.",
            "recommendation": "Remove 'noindex' from your robots meta tag."
        })
    else:
        insights["passed_checks"].append("Page is indexable (No noindex tag)")

    if seo_data.get('viewport') == 'Missing':
        insights["critical_errors"].append({
            "issue": "Missing Viewport Meta Tag",
            "impact": "High - Your site is not optimized for mobile devices.",
            "recommendation": "Add <meta name='viewport' content='width=device-width, initial-scale=1'>."
        })
    else:
        insights["passed_checks"].append("Mobile Viewport Configured")

    # Title Tag checks
    title = seo_data.get('title', 'Missing')
    if title == 'Missing' or title.lower() in ['home', 'home 1', 'untitled']:
        insights["critical_errors"].append({
            "issue": f"Invalid or Default Title Tag ('{title}')",
            "impact": "High - This is a severe SEO flaw indicating an unconfigured CMS.",
            "recommendation": "Update the <title> tag to accurately reflect the page's primary keywords and brand."
        })
    elif title.lower().startswith('home'):
        insights["warnings"].append({
            "issue": f"Suboptimal Title Tag ('{title}')",
            "impact": "Medium - Starting with 'Home' wastes valuable keyword space.",
            "recommendation": "Rewrite the title to prioritize target keywords before the brand name."
        })
    else:
        insights["passed_checks"].append(f"Title tag is configured ('{title}')")

    # OG Image check
    ogImage = seo_data.get('ogImage', 'Missing')
    if ogImage == 'Missing':
        insights["warnings"].append({
            "issue": "Missing Open Graph (OG) Image",
            "impact": "Medium - Social media shares of this site will look broken or lack a preview image.",
            "recommendation": "Add a <meta property='og:image' content='URL'> tag."
        })
    else:
        insights["passed_checks"].append("OG Image is present")

    # 2. Content & Headers
    h1Count = seo_data.get('h1Count', 0)
    if h1Count == 0:
        insights["critical_errors"].append({
            "issue": "Missing H1 Tag",
            "impact": "High - Search engines cannot identify the main topic of your page.",
            "recommendation": "Add exactly one <h1> tag containing your primary target keyword."
        })
    elif h1Count > 1:
        insights["warnings"].append({
            "issue": "Multiple H1 Tags",
            "impact": "Low - Can confuse search engines regarding the primary topic.",
            "recommendation": "Use only one <h1> tag and use <h2>/<h3> for subheadings."
        })
    else:
        insights["passed_checks"].append("Single H1 tag present")

    wordCount = seo_data.get('wordCount', 0)
    if wordCount < 300:
        insights["warnings"].append({
            "issue": "Thin Content",
            "impact": "Medium - Word count is only " + str(wordCount) + ".",
            "recommendation": "Expand homepage text to a minimum of 300 words to establish topical authority."
        })
    else:
        insights["passed_checks"].append("Sufficient word count (" + str(wordCount) + " words)")

    # 3. Schema.org
    if not seo_data.get('hasSchema', False):
        insights["warnings"].append({
            "issue": "Missing Structured Data (Schema.org)",
            "impact": "Medium - You are missing out on Rich Snippets in Google search results.",
            "recommendation": "Implement JSON-LD Schema markup relevant to your business type."
        })
    else:
        insights["passed_checks"].append("Schema.org structured data found")

    # 4. Trust & Safety Factors
    if ml_score < 70:
        insights["critical_errors"].append({
            "issue": "Low Digital Trust Score",
            "impact": "High - Site displays characteristics commonly found on spam or fake sites.",
            "recommendation": "Review risk factors. Improve domain reputation, gather real reviews, and secure your site."
        })
    else:
        insights["passed_checks"].append("Healthy Digital Trust Score")

    # WHOIS
    if domain_age_days is not None:
        if domain_age_days < 180:
            insights["critical_errors"].append({
                "issue": "Domain Age Warning",
                "impact": "High - Domain is only " + str(domain_age_days) + " days old.",
                "recommendation": "New domains suffer from a 'sandbox' effect and lack trust. Build authoritative backlinks to counter this."
            })
        else:
            insights["passed_checks"].append("Established Domain Age (" + str(domain_age_days) + " days)")

    # Suspicious Links and Contact Info
    suspiciousSocial = seo_data.get('suspiciousSocialLinks', 0)
    if suspiciousSocial > 0:
        insights["warnings"].append({
            "issue": "Suspicious or Default Social Links",
            "impact": "Medium - Found " + str(suspiciousSocial) + " dead-end or generic social media links.",
            "recommendation": "Update social icons to point to your actual brand profiles, or remove them."
        })
    
    emails = seo_data.get('emailsFound', [])
    gmail_found = any('gmail.com' in e.lower() or 'yahoo.com' in e.lower() for e in emails)
    if gmail_found:
        insights["warnings"].append({
            "issue": "Unprofessional Email Address",
            "impact": "Low - Using generic email providers harms brand authority.",
            "recommendation": "Use a custom domain email address for customer support."
        })

    # 5. Core Web Vitals (PageSpeed)
    if pagespeed_data:
        perf_score = pagespeed_data.get("overall_performance_score")
        if perf_score is not None:
            if perf_score < 0.5:
                insights["critical_errors"].append({
                    "issue": "Poor Core Web Vitals",
                    "impact": "High - Extremely slow page speed harms both UX and SEO rankings.",
                    "recommendation": "Optimize images, minify CSS/JS, and reduce server response times."
                })
            elif perf_score < 0.9:
                insights["warnings"].append({
                    "issue": "Sub-optimal Page Speed",
                    "impact": "Medium - Site is slower than recommended benchmarks.",
                    "recommendation": "Review Google PageSpeed insights for specific assets to compress."
                })
            else:
                insights["passed_checks"].append("Excellent Core Web Vitals (Performance Score: " + str(int(perf_score*100)) + ")")
        
        lcp_score = pagespeed_data.get("lcp_score")
        if lcp_score is not None and lcp_score < 0.5:
             insights["warnings"].append({
                 "issue": "Slow Largest Contentful Paint (LCP)",
                 "impact": "High - Main content takes too long to load.",
                 "recommendation": "Preload hero images and optimize render-blocking resources."
             })

    return insights
