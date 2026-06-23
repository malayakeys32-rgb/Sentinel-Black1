// api.js — all backend calls go through here

const BASE = import.meta.env.VITE_API_URL || "/api";

function getToken() {
  return localStorage.getItem("sb_token");
}

async function req(method, path, body) {
  const token = getToken();
  const url = `${BASE}${path}`;
  
  try {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    
    let data;
    try {
      data = await res.json();
    } catch (e) {
      throw new Error(`Failed to parse response: ${res.statusText}`);
    }
    
    if (!res.ok) {
      throw new Error(data.error || `Request failed (${res.status}): ${res.statusText}`);
    }
    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`Network error: ${error.message}`);
    }
    throw error;
  }
}

export const api = {
  // Auth
  login:  (email, password)   => req("POST", "/auth/login",  { email, password }),
  logout: ()                   => req("POST", "/auth/logout"),
  me:     ()                   => req("GET",  "/users/me"),

  // Cases
  getCases:        ()          => req("GET",  "/cases"),
  getCase:         (id)        => req("GET",  `/cases/${id}`),
  createCase:      (body)      => req("POST", "/cases", body),
  updateCase:      (id, body)  => req("PATCH",`/cases/${id}`, body),
  linkCaseOp:      (id, opId)  => req("POST", `/cases/${id}/link-operation`, { operation_id: opId }),

  // Operations
  getOperations:   ()          => req("GET",  "/operations"),
  getOperation:    (id)        => req("GET",  `/operations/${id}`),
  createOperation: (body)      => req("POST", "/operations", body),
  updateOperation: (id, body)  => req("PATCH",`/operations/${id}`, body),

  // Evidence
  getEvidence:     (params)    => req("GET",  `/evidence${params ? "?"+new URLSearchParams(params) : ""}`),
  addEvidence:     (body)      => req("POST", "/evidence", body),

  // Timeline & Audit
  getTimeline:     (params)    => req("GET",  `/timeline${params ? "?"+new URLSearchParams(params) : ""}`),
  getAudit:        ()          => req("GET",  "/audit"),

  // Health
  health:          ()          => req("GET",  "/health"),
};
