# Digital Trust & Authority Validator (SEO Extension)

![Backend Running](ml-mod/fake_seller_detector1/compressed_v2.gif)

## What the Project Does

The **Digital Trust & Authority Validator** is an end-to-end tool designed to analyze web pages for SEO metrics, trust indicators, and potential security risks such as fake sellers or typosquatting. It provides comprehensive technical diagnostics, ML-generated trust scores, Core Web Vitals checks, and actionable insights to help users assess a website's authenticity and search engine optimization quality.

If you would like to see a generated demo report right away, please refer to the **Demo Report Viewer**:
[https://seo-extension.vercel.app/](https://seo-extension.vercel.app/)

## How It Does It

The system consists of three main components working seamlessly together:

1. **Browser Extension (`seoExt_v1`)**:
   A lightweight Chrome extension that acts as the data ingestion point. Once triggered by the user on an active webpage, it extracts raw on-page SEO metadata (headers, tags, structure) and sends this data to the backend for processing.

2. **Backend Insights Engine (`ml-mod/fake_seller_detector1`)**:
   A Python/Flask API that serves as the core intelligence layer. Upon receiving the payload from the extension, the backend performs multi-layered analysis:
   - **Machine Learning Analysis**: Evaluates data through predictive ML models trained to detect fake sellers and fraudulent domains.
   - **Traffic & Authority Checking**: Cross-references domain metrics and WHOIS data.
   - **Core Web Vitals**: Fetches real-time performance diagnostics (like PageSpeed insights).
   It aggregates these disparate metrics and synthesizes them into a highly-structured JSON report containing prioritized insights and a calculated trust score.

3. **Report Viewer (`report-viewer`)**:
   A responsive, cleanly designed React/Vite web application that takes the generated JSON payload and presents it in a beautiful, warm, and minimal dashboard. It visualizes trust scores, traffic analysis, actionable insights, and raw data via intuitive charts and a clean layout.

## Seamless Automated Workflow

We've implemented a frictionless user experience connecting all three components:
1. **One-Click Analysis**: When you click the "Generate Detailed Report" button in the extension popup, the scraping and API analysis happen entirely in the background.
2. **Instant Quick Summary**: The backend processes the report and returns a summarized payload. The extension immediately displays the **Trust Score** (color-coded for safety) and the **Verdict** (e.g., Trustworthy, Suspicious) right inside the popup.
3. **Automated Redirection**: Concurrently, the extension automatically opens a new browser tab pointing directly to your locally running Report Viewer (`http://localhost:5173/report/<generated-id>`). This drops you straight into the comprehensive dashboard without ever needing to manually copy/paste IDs or adjust URLs.

## How to Run the Project

### 1. Backend Service
Ensure you have Python 3.8+ installed.

```bash
# Navigate to the backend directory
cd ml-mod/fake_seller_detector1

# Create a virtual environment
python3 -m venv venv

# Activate the virtual environment
# On Mac/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install the dependencies
pip install -r requirements.txt

# Start the Flask API
python run_api.py
```
*The backend API will run on `http://localhost:5000`.*

### 2. Report Viewer Frontend
Ensure you have Node.js installed.

```bash
# Navigate to the report viewer directory
cd report-viewer

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```
*The application will be accessible at `http://localhost:5173` (or port specified by Vite).*

### 3. Browser Extension
- Open Google Chrome (or any Chromium-based browser like Edge).
- Navigate to the Extensions page (`chrome://extensions/`).
- Enable **"Developer mode"** in the top right corner.
- Click **"Load unpacked"**.
- Select the `seoExt_v1` folder from this repository.
- Pin the extension to your toolbar, navigate to any site, and click the extension icon to begin an analysis!
