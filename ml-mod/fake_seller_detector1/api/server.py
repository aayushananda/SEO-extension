from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
import json
from datetime import datetime
from urllib.parse import urlparse
import whois
import requests
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), '.env')
load_dotenv(env_path)

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from features.features import calculate_score

app = Flask(__name__)
CORS(app)

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    url = data.get('url', '').strip()

    if not url:
        return jsonify({"error": "No URL provided"}), 400

    if not url.startswith("http"):
        url = "https://" + url

    try:
        score, reasons, traffic_data = calculate_score(url)
        return jsonify({
            "url": url,
            "score": score,
            "reasons": reasons
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/generate_seo_report', methods=['POST'])
def generate_seo_report():
    data = request.get_json()
    url = data.get('url', '').strip()
    seo_data = data.get('seoData', {})

    if not url:
        return jsonify({"error": "No URL provided"}), 400

    if not url.startswith("http"):
        url = "https://" + url

    try:
        score, reasons, traffic_data = calculate_score(url)
        
        parsed_url = urlparse(url)
        domain = parsed_url.netloc.replace("www.", "")

        # WHOIS lookup
        domain_age_days = None
        try:
            w = whois.whois(domain)
            if w.creation_date:
                creation_date = w.creation_date
                if isinstance(creation_date, list):
                    creation_date = creation_date[0]
                if hasattr(creation_date, 'replace'):
                    creation_date = creation_date.replace(tzinfo=None)
                domain_age_days = (datetime.now() - creation_date).days
        except Exception as e:
            print(f"WHOIS lookup failed: {e}")

        # PageSpeed Insights
        pagespeed_api_key = os.getenv("PAGESPEED_API_KEY")
        pagespeed_data = {}
        try:
            ps_url = f"https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url={url}&strategy=desktop"
            if pagespeed_api_key:
                ps_url += f"&key={pagespeed_api_key}"
            print(f"Fetching PageSpeed Insights for {url}...")
            ps_resp = requests.get(ps_url, timeout=20)
            if ps_resp.status_code == 200:
                ps_json = ps_resp.json()
                metrics = ps_json.get("lighthouseResult", {}).get("audits", {})
                
                lcp = metrics.get("largest-contentful-paint", {}).get("displayValue")
                lcp_score = metrics.get("largest-contentful-paint", {}).get("score")
                
                cls = metrics.get("cumulative-layout-shift", {}).get("displayValue")
                cls_score = metrics.get("cumulative-layout-shift", {}).get("score")
                
                speed_index = metrics.get("speed-index", {}).get("displayValue")
                perf_score = ps_json.get("lighthouseResult", {}).get("categories", {}).get("performance", {}).get("score")
                
                pagespeed_data = {
                    "lcp": lcp,
                    "lcp_score": lcp_score,
                    "cls": cls,
                    "cls_score": cls_score,
                    "speed_index": speed_index,
                    "overall_performance_score": perf_score
                }
            else:
                print(f"PageSpeed API returned {ps_resp.status_code}: {ps_resp.text}")
        except Exception as e:
            print(f"PageSpeed API failed: {e}")

        # Generate actionable insights
        from api.seo_insights import generate_insights
        insights = generate_insights(seo_data, score, domain_age_days, pagespeed_data)
        
        # Combine ML output and SEO Data
        report = {
            "target_url": url,
            "generated_at": datetime.now().isoformat(),
            "insights": insights,
            "core_web_vitals": pagespeed_data if pagespeed_data else "Not tested or failed",
            "traffic_data": traffic_data,
            "trust_and_safety": {
                "fake_website_score": score,
                "risk_factors": reasons
            },
            "raw_on_page_seo": seo_data
        }
        
        # Print to terminal
        print("\n" + "="*50)
        print("NEW SEO & TRUST REPORT GENERATED")
        print("="*50)
        print(json.dumps(report, indent=4))
        print("="*50 + "\n")
        
        # Save to file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"seo_report_{domain}_{timestamp}.json"
        
        reports_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "reports")
        os.makedirs(reports_dir, exist_ok=True)
        filepath = os.path.join(reports_dir, filename)
        
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=4)
            
        return jsonify({"success": True, "message": "Report generated", "file": filename})
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)