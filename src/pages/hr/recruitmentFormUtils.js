export const emptyRecruitmentForm = {
  candidateCode: "",
  candidateName: "",
  email: "",
  phone: "",
  department: "",
  roleTitle: "",
  source: "LinkedIn",
  experienceYears: "0",
  currentCtc: "",
  expectedCtc: "",
  noticePeriodDays: "0",
  applicationDate: "",
  interviewDate: "",
  stage: "Screening",
  status: "In Progress",
  recruiterName: "",
  remarks: "",
};

const requiredFields = [
  "candidateName",
  "email",
  "phone",
  "department",
  "roleTitle",
  "applicationDate",
  "stage",
  "status",
];

function normalizeText(value) {
  return String(value ?? "").trim();
}

function normalizeNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function normalizeRecruitmentPayload(rawCandidate) {
  const normalized = { ...emptyRecruitmentForm };

  Object.entries(rawCandidate || {}).forEach(([key, value]) => {
    if (!(key in normalized)) {
      return;
    }

    normalized[key] = String(value ?? "").trim();
  });

  if (!normalized.source) {
    normalized.source = "LinkedIn";
  }

  if (!normalized.stage) {
    normalized.stage = "Screening";
  }

  if (!normalized.status) {
    normalized.status = "In Progress";
  }

  return normalized;
}

export function isValidRecruitmentPayload(candidate) {
  return requiredFields.every((field) => normalizeText(candidate[field]));
}

export function toRecruitmentApiPayload(candidate) {
  return {
    candidateName: normalizeText(candidate.candidateName),
    email: normalizeText(candidate.email),
    phone: normalizeText(candidate.phone),
    department: normalizeText(candidate.department),
    roleTitle: normalizeText(candidate.roleTitle),
    source: normalizeText(candidate.source),
    experienceYears: normalizeNumber(candidate.experienceYears),
    currentCtc: normalizeText(candidate.currentCtc),
    expectedCtc: normalizeText(candidate.expectedCtc),
    noticePeriodDays: Math.max(0, Math.trunc(normalizeNumber(candidate.noticePeriodDays))),
    applicationDate: normalizeText(candidate.applicationDate),
    interviewDate: normalizeText(candidate.interviewDate),
    stage: normalizeText(candidate.stage),
    status: normalizeText(candidate.status),
    recruiterName: normalizeText(candidate.recruiterName),
    remarks: normalizeText(candidate.remarks),
  };
}

export function formatCurrency(value) {
  const amount = normalizeNumber(value);
  return amount ? `₹${amount.toLocaleString()}` : "—";
}
