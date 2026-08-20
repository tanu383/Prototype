"""
TrustTrail Backend — Python Standard Library HTTP Server

Implements the exact same API routes as FastAPI but has ZERO dependencies.
Runs flawlessly on any Python version (including Python 3.14) without compiling modules.
"""

import http.server
import json
import os
import urllib.parse
from datetime import datetime, timezone
import uuid

# Import our existing pure Python modules
from app import store
from app.risk.engine import calculate_risk

class TrustTrailHandler(http.server.BaseHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers to every response so the React frontend can talk to it.
        # Origin is configurable via CORS_ORIGIN (default: allow any origin).
        self.send_header('Access-Control-Allow-Origin', os.environ.get('CORS_ORIGIN', '*'))
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def send_json(self, data, status=200):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path
        query = urllib.parse.parse_qs(parsed_url.query)

        # GET /health
        if path == '/health':
            self.send_json({"status": "ok", "service": "TrustTrail API"})
            return

        # GET /locations
        elif path == '/locations':
            self.send_json(store.locations)
            return

        # GET /locations/{id}
        elif path.startswith('/locations/'):
            loc_id = path.split('/')[-1]
            loc = next((l for l in store.locations if l["id"] == loc_id), None)
            if loc:
                self.send_json(loc)
            else:
                self.send_json({"detail": "Location not found"}, 404)
            return

        # GET /vendors
        elif path == '/vendors':
            loc_id = query.get('location_id', [None])[0]
            filtered_vendors = store.vendors
            if loc_id:
                filtered_vendors = [v for v in filtered_vendors if v.get("location_id") == loc_id]
            
            result = []
            for v in filtered_vendors:
                risk = calculate_risk(v)
                result.append({**v, "risk_score": risk["score"], "risk_level": risk["level"]})
            self.send_json(result)
            return

        # GET /vendors/{id}/risk
        elif path.startswith('/vendors/') and path.endswith('/risk'):
            parts = path.split('/')
            if len(parts) >= 4:
                vendor_id = parts[2]
                vendor = next((v for v in store.vendors if v["id"] == vendor_id), None)
                if vendor:
                    self.send_json(calculate_risk(vendor))
                else:
                    self.send_json({"detail": "Vendor not found"}, 404)
                return

        # GET /vendors/{id}
        elif path.startswith('/vendors/'):
            vendor_id = path.split('/')[-1]
            vendor = next((v for v in store.vendors if v["id"] == vendor_id), None)
            if vendor:
                risk = calculate_risk(vendor)
                self.send_json({**vendor, "risk_score": risk["score"], "risk_level": risk["level"]})
            else:
                self.send_json({"detail": "Vendor not found"}, 404)
            return

        # GET /reports
        elif path == '/reports':
            result = []
            for r in reversed(store.reports):
                vendor = next((v for v in store.vendors if v["id"] == r["vendor_id"]), None)
                risk = calculate_risk(vendor) if vendor else None
                result.append({**r, "current_risk": risk})
            self.send_json(result)
            return

        # 404 Default
        self.send_json({"detail": "Not found"}, 404)

    def do_POST(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path

        # POST /reports
        if path == '/reports':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            try:
                data = json.loads(body.decode('utf-8'))
            except Exception:
                self.send_json({"detail": "Invalid JSON"}, 400)
                return

            vendor_id = data.get("vendor_id")
            description = data.get("description")
            amount_paid = data.get("amount_paid")
            category = data.get("category", "general")

            if not vendor_id or not description:
                self.send_json({"detail": "vendor_id and description are required"}, 400)
                return

            vendor = next((v for v in store.vendors if v["id"] == vendor_id), None)
            if not vendor:
                self.send_json({"detail": "Vendor not found"}, 404)
                return

            # Create report record
            new_report = {
                "id": str(uuid.uuid4()),
                "vendor_id": vendor_id,
                "vendor_name": vendor["name"],
                "description": description,
                "amount_paid": float(amount_paid) if amount_paid is not None else None,
                "category": category,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "status": "pending",
            }
            store.reports.append(new_report)

            # Update vendor signals
            COMPLAINT_BUMP = 8.0
            RECENT_BUMP = 6.0
            vendor["complaint_count"] = vendor.get("complaint_count", 0) + 1
            vendor["complaint_signal"] = min(vendor.get("complaint_signal", 0) + COMPLAINT_BUMP, 100)
            vendor["recent_reports"] = min(vendor.get("recent_reports", 0) + RECENT_BUMP, 100)

            updated_risk = calculate_risk(vendor)
            new_report["updated_risk"] = updated_risk

            self.send_json({
                "report": new_report,
                "updated_risk": updated_risk,
                "message": "Report submitted. Risk score has been recalculated."
            })
            return

        # POST /reports/{report_id}/verify  (admin approval)
        elif path.startswith('/reports/') and path.endswith('/verify'):
            report_id = path.split('/')[2]
            report = next((r for r in store.reports if r["id"] == report_id), None)
            if not report:
                self.send_json({"detail": "Report not found"}, 404)
                return
            report["status"] = "verified"
            report["reviewed_at"] = datetime.now(timezone.utc).isoformat()
            self.send_json(report)
            return

        self.send_json({"detail": "Not found"}, 404)

def run(port=None):
    if port is None:
        port = int(os.environ.get('PORT', 8000))
    server_address = ('', port)
    httpd = http.server.HTTPServer(server_address, TrustTrailHandler)
    print(f"Starting TrustTrail API on port {port} (Python Standard Library Server)...")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    httpd.server_close()

if __name__ == '__main__':
    run()
