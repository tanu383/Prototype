export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface Location {
  id: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  risk_level: RiskLevel;
  description: string;
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  location_id: string;
  location_name: string;
  city: string;
  complaint_count: number;
  complaint_signal: number;
  price_anomaly: number;
  location_risk: number;
  recent_reports: number;
  description: string;
  contact: string;
  operating_since: string;
  reasons: string[];
  risk_score?: number;
  risk_level?: RiskLevel;
}

export interface VendorRisk {
  vendor_id: string;
  vendor_name: string;
  score: number;
  level: RiskLevel;
  reasons: string[];
}

export interface ReportCreate {
  vendor_id: string;
  description: string;
  amount_paid?: number;
  category?: string;
}

export interface Report {
  id: string;
  vendor_id: string;
  vendor_name: string;
  description: string;
  amount_paid?: number;
  category: string;
  created_at: string;
  status: string;
  updated_risk?: VendorRisk;
  current_risk?: VendorRisk;
}

export interface ReportResponse {
  report: Report;
  updated_risk: VendorRisk;
  message: string;
}
