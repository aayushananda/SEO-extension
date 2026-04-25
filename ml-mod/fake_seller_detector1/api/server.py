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
import uuid

env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), '.env')
load_dotenv(env_path)

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from features.features import calculate_score

app = Flask(__name__)
CORS(app, resources={
    r"/api/reports/*": {
        "origins": [
            "http://localhost:5173",
            "https://your-deployed-viewer.com"
        ]
    },
    r"/generate_seo_report": {
        "origins": "*"
    },
    r"/analyze": {
        "origins": "*"
    }
})

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
        
        trust_score = float(score)
        fake_probability = max(0.0, 100.0 - trust_score)
        
        # Combine ML output and SEO Data
        report = {
            "target_url": url,
            "generated_at": datetime.now().isoformat(),
            "insights": insights,
            "core_web_vitals": pagespeed_data if pagespeed_data else "Not tested or failed",
            "traffic_data": traffic_data,
            "trust_and_safety": {
                "trust_score": trust_score,
                "fake_probability": fake_probability,
                "verdict": "Trustworthy" if trust_score > 80 else "Suspicious" if trust_score < 50 else "Moderate Risk",
                "confidence": "High",
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
        report_id = str(uuid.uuid4())
        filename = f"report_{report_id}.json"
        
        reports_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "reports")
        os.makedirs(reports_dir, exist_ok=True)
        filepath = os.path.join(reports_dir, filename)
        
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=4)
            
        return jsonify({
            "success": True, 
            "message": "Report generated", 
            "report_id": report_id,
            "file": filename
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/api/reports/<report_id>', methods=['GET'])
def get_report(report_id):
    # Minimal auth check
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"error": "UNAUTHORIZED"}), 401
    
    # Just checking token presence for now, any valid token format works in MVP
    token = auth_header.split(' ')[1]
    if not token:
        return jsonify({"error": "UNAUTHORIZED"}), 401

    filename = f"report_{report_id}.json"
    reports_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "reports")
    filepath = os.path.join(reports_dir, filename)
    
    if not os.path.exists(filepath):
        return jsonify({"error": "REPORT_NOT_FOUND"}), 404
        
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        # Return in the defined contract format
        return jsonify({
            "report_id": report_id,
            "data": data,
            "created_at": data.get("generated_at"),
            "expires_at": None # To be implemented
        })
    except Exception as e:
        return jsonify({"error": "Failed to read report"}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)