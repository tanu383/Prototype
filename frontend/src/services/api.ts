import type {
  Location,
  Vendor,
  VendorRisk,
  ReportCreate,
  ReportResponse,
  Report,
} from "../types";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "API Error");
  }
  return res.json();
}

// Locations
export const getLocations = (): Promise<Location[]> =>
  request<Location[]>("/locations");

export const getLocation = (id: string): Promise<Location> =>
  request<Location>(`/locations/${id}`);

// Vendors
export const getVendors = (locationId?: string): Promise<Vendor[]> =>
  request<Vendor[]>(locationId ? `/vendors?location_id=${locationId}` : "/vendors");

export const getVendor = (id: string): Promise<Vendor> =>
  request<Vendor>(`/vendors/${id}`);

export const getVendorRisk = (id: string): Promise<VendorRisk> =>
  request<VendorRisk>(`/vendors/${id}/risk`);

// Reports
export const submitReport = (data: ReportCreate): Promise<ReportResponse> =>
  request<ReportResponse>("/reports", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getReports = (): Promise<Report[]> =>
  request<Report[]>("/reports");

export const verifyReport = (id: string): Promise<Report> =>
  request<Report>(`/reports/${id}/verify`, {
    method: "POST",
  });
