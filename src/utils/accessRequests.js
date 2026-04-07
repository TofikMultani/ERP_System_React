import { PERSISTENT_STATE_UPDATED_EVENT } from "./persistentState.js";

export const ACCESS_REQUESTS_STORAGE_KEY = "erp_access_requests";

export const ACCESS_REQUEST_STATUS = {
  pending: "pending",
  approved: "approved",
  rejected: "rejected",
};

function getRequestId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `request-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function dispatchRequestUpdate() {
  window.dispatchEvent(
    new CustomEvent(PERSISTENT_STATE_UPDATED_EVENT, {
      detail: { storageKey: ACCESS_REQUESTS_STORAGE_KEY },
    }),
  );
}

export function getStoredAccessRequests() {
  try {
    const storedValue = localStorage.getItem(ACCESS_REQUESTS_STORAGE_KEY);
    if (storedValue) {
      return JSON.parse(storedValue);
    }
  } catch {
    // Fall back to an empty request queue.
  }

  return [];
}

function saveAccessRequests(requests) {
  localStorage.setItem(ACCESS_REQUESTS_STORAGE_KEY, JSON.stringify(requests));
  dispatchRequestUpdate();
}

export function createAccessRequest(requestData) {
  const modules = Array.isArray(requestData.modules)
    ? [...new Set(requestData.modules.filter(Boolean))]
    : [];

  return {
    id: getRequestId(),
    requesterName: requestData.requesterName?.trim() || "Unknown requester",
    requesterEmail: requestData.requesterEmail?.trim() || "",
    requesterPhone: requestData.requesterPhone?.trim() || "",
    companyName: requestData.companyName?.trim() || "",
    modules,
    status: ACCESS_REQUEST_STATUS.pending,
    submittedAt: requestData.submittedAt || new Date().toISOString(),
    reviewedAt: null,
    reviewedBy: "",
    reviewNote: "",
  };
}

export function appendAccessRequest(requestData) {
  const requests = getStoredAccessRequests();
  const nextRequest = createAccessRequest(requestData);

  saveAccessRequests([nextRequest, ...requests]);

  return nextRequest;
}

export function updateAccessRequestStatus(
  requestId,
  nextStatus,
  reviewData = {},
) {
  const requests = getStoredAccessRequests();
  const nextRequests = requests.map((request) => {
    if (request.id !== requestId) {
      return request;
    }

    return {
      ...request,
      status: nextStatus,
      reviewedAt: new Date().toISOString(),
      reviewedBy: reviewData.reviewedBy?.trim() || "Root Admin",
      reviewNote: reviewData.reviewNote?.trim() || request.reviewNote || "",
      pricingBreakdown: Array.isArray(reviewData.pricingBreakdown)
        ? reviewData.pricingBreakdown
        : request.pricingBreakdown || [],
      totalEstimatedCost:
        typeof reviewData.totalEstimatedCost === "number"
          ? reviewData.totalEstimatedCost
          : request.totalEstimatedCost || 0,
      inactiveRequestedModules: Array.isArray(reviewData.inactiveRequestedModules)
        ? reviewData.inactiveRequestedModules
        : request.inactiveRequestedModules || [],
    };
  });

  saveAccessRequests(nextRequests);

  return nextRequests.find((request) => request.id === requestId) || null;
}
