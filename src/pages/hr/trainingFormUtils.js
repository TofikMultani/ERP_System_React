export const emptyTrainingForm = {
  trainingCode: "",
  title: "",
  department: "",
  trainerName: "",
  trainingMode: "Online",
  providerName: "",
  location: "",
  startDate: "",
  endDate: "",
  durationHours: "0",
  totalSeats: "1",
  enrolledCount: "0",
  budget: "",
  status: "Upcoming",
  description: "",
};

const requiredFields = [
  "title",
  "department",
  "trainerName",
  "trainingMode",
  "startDate",
  "endDate",
  "totalSeats",
  "status",
];

function normalizeText(value) {
  return String(value ?? "").trim();
}

function normalizeNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function normalizeTrainingPayload(rawProgram) {
  const normalized = { ...emptyTrainingForm };

  Object.entries(rawProgram || {}).forEach(([key, value]) => {
    if (!(key in normalized)) {
      return;
    }

    normalized[key] = String(value ?? "").trim();
  });

  const totalSeats = Math.max(1, Math.trunc(normalizeNumber(normalized.totalSeats)));
  const enrolledCount = Math.max(
    0,
    Math.min(Math.trunc(normalizeNumber(normalized.enrolledCount)), totalSeats),
  );

  normalized.totalSeats = String(totalSeats);
  normalized.enrolledCount = String(enrolledCount);

  if (!normalized.trainingMode) {
    normalized.trainingMode = "Online";
  }

  if (!normalized.status) {
    normalized.status = "Upcoming";
  }

  return normalized;
}

export function isValidTrainingPayload(program) {
  return requiredFields.every((field) => normalizeText(program[field]));
}

export function toTrainingApiPayload(program) {
  return {
    title: normalizeText(program.title),
    department: normalizeText(program.department),
    trainerName: normalizeText(program.trainerName),
    trainingMode: normalizeText(program.trainingMode),
    providerName: normalizeText(program.providerName),
    location: normalizeText(program.location),
    startDate: normalizeText(program.startDate),
    endDate: normalizeText(program.endDate),
    durationHours: normalizeNumber(program.durationHours),
    totalSeats: Math.max(1, Math.trunc(normalizeNumber(program.totalSeats))),
    enrolledCount: Math.max(0, Math.trunc(normalizeNumber(program.enrolledCount))),
    budget: normalizeText(program.budget),
    status: normalizeText(program.status),
    description: normalizeText(program.description),
  };
}

export function formatCurrency(value) {
  const amount = normalizeNumber(value);
  return amount ? `₹${amount.toLocaleString()}` : "—";
}
