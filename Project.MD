TrustTrail

AI-Powered Tourism Scam Risk & Safety Prototype

TrustTrail is a Smart India Hackathon 2026 prototype for warning tourists about potentially risky tourism services before they engage with them.

The original SIH proposal focuses on centralized scam intelligence, multilingual classification, multi-signal risk scoring, explainable pre-engagement warnings, location-specific risk, pricing anomalies, and continuous updating. This repository is the simple first prototype of that idea.

1. Prototype Goal

The first version intentionally focuses on one complete working flow:

Tourist
   ↓
Select Location
   ↓
View Vendors
   ↓
Open Vendor
   ↓
See Risk Score + Reasons
   ↓
Submit Incident Report
   ↓
Risk Score Updates
   ↓
Admin Sees Report

The goal is not to build the complete production platform immediately.

The goal is to prove that the core TrustTrail concept works end-to-end.

2. What the Prototype Includes

Tourist

Select a tourism location

View nearby vendors

Open a vendor profile

View vendor risk score

View risk level

Understand why the vendor has that risk

Submit an incident/scam report

Admin

View submitted reports

View the affected vendor

See report details and status

Risk Engine

The first version uses a simple deterministic scoring system instead of a real ML model.

Signals:

Complaint signal    → 35%
Price anomaly       → 25%
Location risk       → 20%
Recent reports      → 20%

Risk levels:

0–29    LOW
30–59   MEDIUM
60–79   HIGH
80–100  CRITICAL

Example:

Risk Score: 78
HIGH RISK

Why?
• Multiple complaints
• Price above reference rate
• Recent reports increasing
• Elevated location risk

The system should describe this as a risk assessment, not a confirmed accusation.

Use:

High risk based on available reports and signals.

Do not use:

This vendor is definitely a scam.

3. Technology Stack

Frontend

React

TypeScript

Vite

Tailwind CSS

React Router

Backend

Python

FastAPI

Pydantic

Data

For the first prototype:

Local JSON files, or

In-memory Python data

Not Yet

The following are intentionally postponed:

Firebase

Real ML models

XGBoost

Complex NLP

Authentication

Notifications

Live government data

Production geofencing

Microservices

They can be introduced after the MVP works.

4. Project Structure

trusttrail/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   ├── package.json
│   └── README.md
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routes/
│   │   ├── services/
│   │   ├── risk/
│   │   └── schemas/
│   ├── requirements.txt
│   └── README.md
│
├── data/
│   ├── vendors.json
│   ├── locations.json
│   └── reports.json
│
├── README.md
└── ANTIGRAVITY_PROMPT.md

Keep the structure simple.

5. Frontend

The frontend provides the tourist-facing interface and basic admin view.

Pages

/
├── Dashboard
├── Explore
├── Vendor
├── Report
└── Admin

Dashboard

Show:

TrustTrail introduction

Location selection

High-risk vendor preview

Explore

Show:

Selected tourism location

Vendor cards

Risk badges

Vendor

Show:

Vendor Name
Category
Location

Risk Score: 78
HIGH RISK

Why?
• Multiple complaints
• Price anomaly
• Recent reports

[ Report Incident ]

Report

Simple form:

Vendor
Description
Amount Paid
Submit

Admin

Simple report table:

Vendor
Report
Category
Status

The frontend should not calculate the authoritative risk score itself.

Risk calculation belongs to the backend.

6. Backend

The backend uses FastAPI and handles:

Locations

Vendors

Reports

Risk calculation

Basic report storage

Admin report retrieval

API

Health

GET /health

Locations

GET /locations

Vendors

GET /vendors
GET /vendors/{id}
GET /vendors/{id}/risk

Reports

POST /reports
GET /reports

7. Report Flow

When a tourist submits an incident:

POST /reports
      ↓
Save Report
      ↓
Increase Vendor Complaint Signal
      ↓
Recalculate Risk
      ↓
Return Updated Risk
      ↓
Show Updated Vendor Risk

For the MVP, this does not require AI.

A simple deterministic calculation is enough.

8. Risk Engine

Keep the risk calculation in its own backend module.

Inputs:

complaint signal
price anomaly
location risk
recent reports

Weights:

Complaint signal    35%
Price anomaly       25%
Location risk       20%
Recent reports      20%

Conceptually:

risk =
    complaint_signal × 0.35
  + price_anomaly × 0.25
  + location_risk × 0.20
  + recent_reports × 0.20

Normalize the result to 0–100.

Then determine:

0–29    LOW
30–59   MEDIUM
60–79   HIGH
80–100  CRITICAL

Return something like:

{
  "score": 78,
  "level": "HIGH",
  "reasons": [
    "Multiple complaints",
    "Price anomaly detected",
    "Recent reports increasing"
  ]
}

Keeping this logic separate makes it easy to replace the simple formula with a real ML model later.

9. Demo Data

Use one tourism city for the first prototype.

Jaipur is a suitable demo example.

Create around five vendors:

Heritage Guide A
→ LOW

Royal Tour Services
→ MEDIUM

City Heritage Guide
→ HIGH

Pink City Tours
→ MEDIUM

Monument Ticket Help
→ CRITICAL

Each vendor should have:

id
name
category
location
risk_score
complaint_count
price_anomaly
location_risk
recent_reports
reasons

Locations should contain:

id
name
city
latitude
longitude
risk_level

Reports should contain:

id
vendor_id
description
amount_paid
category
created_at
status

10. Recommended Demo

The complete demonstration should take only a few minutes.

Step 1

Open TrustTrail.

Step 2

Select a tourism location.

Step 3

Open a high-risk vendor.

Step 4

Show:

Risk Score: 78
HIGH RISK

Then explain the reasons.

Step 5

Submit a new report:

"The guide demanded ₹1500 for a service that normally costs ₹500."

Step 6

Backend stores the report and recalculates the risk.

Step 7

Show the updated score.

Step 8

Open the Admin page.

Step 9

Show the new report.

The important part is demonstrating:

Report
  ↓
New signal
  ↓
Risk recalculation
  ↓
Updated warning

11. Development

Frontend

cd frontend
npm install
npm run dev

Backend

Create a virtual environment:

cd backend
python -m venv .venv

Install dependencies:

pip install -r requirements.txt

Run FastAPI:

uvicorn app.main:app --reload

12. Future Roadmap

Once the simple prototype works, expand it gradually.

                     CURRENT MVP
                          │
                          ▼
                 Local demo data
                          │
                          ▼
                       Firebase
                          │
                          ▼
                 NLP classification
                          │
                          ▼
                Price anomaly detection
                          │
                          ▼
                    Map integration
                          │
                          ▼
                  Geofenced warnings
                          │
                          ▼
                Multilingual reports
                          │
                          ▼
                  XGBoost risk model
                          │
                          ▼
                Authority escalation

Do not implement all of these at once.

Each stage should build on the previous working version.

13. SIH Concept Alignment

The full SIH proposal describes:

Centralized scam intelligence

Monument and museum security

Multilingual AI classification

Multi-signal risk scoring

Explainable pre-engagement warnings

Authority escalation

Continuous updating

The MVP demonstrates the foundation of these ideas through:

Vendor Data
     +
Incident Reports
     +
Price Signal
     +
Location Signal
     ↓
Risk Engine
     ↓
Explainable Warning
     ↓
Tourist Decision

The original proposal also identifies challenges such as cold-start vendors, false reports, language diversity, legal risk, adoption, and connectivity. These should be addressed in later versions rather than complicating the first prototype.

14. Prototype Philosophy

Build the smallest thing that proves the idea.

The first successful version of TrustTrail does not need sophisticated AI.

It needs to convincingly demonstrate:

"We can collect tourism risk signals, combine them into an understandable vendor risk assessment, warn a tourist before engagement, and update that assessment when new information arrives."

Once that works reliably, add the AI and real-world integrations.