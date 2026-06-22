import {
  ERICSSON_PHONE_MODEL_CALIBRATION,
  ERICSSON_RECEIVER_CALIBRATION,
  VINTAGE_DOSSIER_TABLE_CALIBRATION,
  VINTAGE_DESK_CALIBRATION,
  type PhoneModelCalibrationPreset,
  type PhoneReceiverCalibrationPreset,
  type TransformPreset,
  type Vector3Tuple,
} from "@/components/three/calibration/modelCalibrationPresets";

export const APPLIED_MODEL_CALIBRATION_STORAGE_KEY =
  "portfolio-3d-calibration-applied";

const APPLIED_MODEL_CALIBRATION_EVENT = "portfolio-3d-calibration-applied-change";

export type AppliedDeskCalibration = {
  fitSize: number;
  layout: TransformPreset;
};

export type AppliedModelCalibration = {
  desk?: AppliedDeskCalibration;
  dossierTable?: TransformPreset;
  phoneModel?: PhoneModelCalibrationPreset;
  receiver?: PhoneReceiverCalibrationPreset;
};

function cloneTuple(tuple: Vector3Tuple): Vector3Tuple {
  return [...tuple] as Vector3Tuple;
}

function cloneTransform(transform: TransformPreset): TransformPreset {
  return {
    position: cloneTuple(transform.position),
    rotation: cloneTuple(transform.rotation),
    scale: transform.scale,
  };
}

function cloneReceiver(
  receiver: PhoneReceiverCalibrationPreset,
): PhoneReceiverCalibrationPreset {
  return {
    synthetic: cloneTransform(receiver.synthetic),
    hoverPositionOffset: cloneTuple(receiver.hoverPositionOffset),
    hoverRotationOffset: cloneTuple(receiver.hoverRotationOffset),
  };
}

function clonePhoneModel(
  model: PhoneModelCalibrationPreset,
): PhoneModelCalibrationPreset {
  return {
    fitSize: model.fitSize,
    position: cloneTuple(model.position),
    rotation: cloneTuple(model.rotation),
    scale: model.scale,
  };
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isVector3Tuple(value: unknown): value is Vector3Tuple {
  return (
    Array.isArray(value) &&
    value.length === 3 &&
    value.every((item) => isFiniteNumber(item))
  );
}

function normalizeTransform(
  value: unknown,
  fallback: TransformPreset,
): TransformPreset {
  if (!value || typeof value !== "object") {
    return cloneTransform(fallback);
  }

  const candidate = value as Partial<TransformPreset>;

  return {
    position: isVector3Tuple(candidate.position)
      ? cloneTuple(candidate.position)
      : cloneTuple(fallback.position),
    rotation: isVector3Tuple(candidate.rotation)
      ? cloneTuple(candidate.rotation)
      : cloneTuple(fallback.rotation),
    scale: isFiniteNumber(candidate.scale) ? candidate.scale : fallback.scale,
  };
}

function normalizeDesk(value: unknown): AppliedDeskCalibration | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const fallback: AppliedDeskCalibration = {
    fitSize: VINTAGE_DESK_CALIBRATION.fitSize.desktop,
    layout: VINTAGE_DESK_CALIBRATION.layout.desktop,
  };
  const candidate = value as Partial<AppliedDeskCalibration>;

  return {
    fitSize: isFiniteNumber(candidate.fitSize)
      ? candidate.fitSize
      : fallback.fitSize,
    layout: normalizeTransform(candidate.layout, fallback.layout),
  };
}

function normalizeDossierTable(value: unknown): TransformPreset | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  return normalizeTransform(value, VINTAGE_DOSSIER_TABLE_CALIBRATION);
}

function normalizePhoneModel(
  value: unknown,
): PhoneModelCalibrationPreset | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const candidate = value as Partial<PhoneModelCalibrationPreset>;

  return {
    fitSize: isFiniteNumber(candidate.fitSize)
      ? candidate.fitSize
      : ERICSSON_PHONE_MODEL_CALIBRATION.fitSize,
    position: isVector3Tuple(candidate.position)
      ? cloneTuple(candidate.position)
      : cloneTuple(ERICSSON_PHONE_MODEL_CALIBRATION.position),
    rotation: isVector3Tuple(candidate.rotation)
      ? cloneTuple(candidate.rotation)
      : cloneTuple(ERICSSON_PHONE_MODEL_CALIBRATION.rotation),
    scale: isFiniteNumber(candidate.scale)
      ? candidate.scale
      : ERICSSON_PHONE_MODEL_CALIBRATION.scale,
  };
}

function normalizeReceiver(
  value: unknown,
): PhoneReceiverCalibrationPreset | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const candidate = value as Partial<PhoneReceiverCalibrationPreset>;

  return {
    synthetic: normalizeTransform(
      candidate.synthetic,
      ERICSSON_RECEIVER_CALIBRATION.synthetic,
    ),
    hoverPositionOffset: isVector3Tuple(candidate.hoverPositionOffset)
      ? cloneTuple(candidate.hoverPositionOffset)
      : cloneTuple(ERICSSON_RECEIVER_CALIBRATION.hoverPositionOffset),
    hoverRotationOffset: isVector3Tuple(candidate.hoverRotationOffset)
      ? cloneTuple(candidate.hoverRotationOffset)
      : cloneTuple(ERICSSON_RECEIVER_CALIBRATION.hoverRotationOffset),
  };
}

export function readAppliedModelCalibration(): AppliedModelCalibration {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(APPLIED_MODEL_CALIBRATION_STORAGE_KEY);

    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as Partial<AppliedModelCalibration>;

    return {
      desk: normalizeDesk(parsed.desk),
      dossierTable: normalizeDossierTable(parsed.dossierTable),
      phoneModel: normalizePhoneModel(parsed.phoneModel),
      receiver: normalizeReceiver(parsed.receiver),
    };
  } catch {
    return {};
  }
}

export function writeAppliedModelCalibration(
  calibration: AppliedModelCalibration,
) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    APPLIED_MODEL_CALIBRATION_STORAGE_KEY,
    JSON.stringify(calibration),
  );
  window.dispatchEvent(new Event(APPLIED_MODEL_CALIBRATION_EVENT));
}

export function subscribeAppliedModelCalibration(
  callback: () => void,
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  function handleStorage(event: StorageEvent) {
    if (event.key === APPLIED_MODEL_CALIBRATION_STORAGE_KEY) {
      callback();
    }
  }

  window.addEventListener(APPLIED_MODEL_CALIBRATION_EVENT, callback);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(APPLIED_MODEL_CALIBRATION_EVENT, callback);
    window.removeEventListener("storage", handleStorage);
  };
}

export function getAppliedDeskCalibration(
  isNarrow: boolean,
): AppliedDeskCalibration {
  const applied = readAppliedModelCalibration();

  if (!isNarrow && applied.desk) {
    return {
      fitSize: applied.desk.fitSize,
      layout: cloneTransform(applied.desk.layout),
    };
  }

  return {
    fitSize: isNarrow
      ? VINTAGE_DESK_CALIBRATION.fitSize.mobile
      : VINTAGE_DESK_CALIBRATION.fitSize.desktop,
    layout: cloneTransform(
      isNarrow
        ? VINTAGE_DESK_CALIBRATION.layout.mobile
        : VINTAGE_DESK_CALIBRATION.layout.desktop,
    ),
  };
}

export function getAppliedReceiverCalibration(): PhoneReceiverCalibrationPreset {
  const applied = readAppliedModelCalibration();

  return applied.receiver
    ? cloneReceiver(applied.receiver)
    : cloneReceiver(ERICSSON_RECEIVER_CALIBRATION);
}

export function getAppliedDossierTableCalibration(): TransformPreset {
  const applied = readAppliedModelCalibration();

  return applied.dossierTable
    ? cloneTransform(applied.dossierTable)
    : cloneTransform(VINTAGE_DOSSIER_TABLE_CALIBRATION);
}

export function getAppliedPhoneModelCalibration(): PhoneModelCalibrationPreset {
  const applied = readAppliedModelCalibration();

  return applied.phoneModel
    ? clonePhoneModel(applied.phoneModel)
    : clonePhoneModel(ERICSSON_PHONE_MODEL_CALIBRATION);
}
