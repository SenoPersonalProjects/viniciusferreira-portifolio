export type Vector3Tuple = [number, number, number];

export type TransformPreset = {
  position: Vector3Tuple;
  rotation: Vector3Tuple;
  scale: number;
};

export type DeskCalibrationPreset = {
  fitSize: {
    desktop: number;
    mobile: number;
  };
  layout: {
    desktop: TransformPreset;
    mobile: TransformPreset;
  };
};

export type PhoneModelCalibrationPreset = TransformPreset & {
  fitSize: number;
};

export type PhoneReceiverCalibrationPreset = {
  synthetic: TransformPreset;
  hoverPositionOffset: Vector3Tuple;
  hoverRotationOffset: Vector3Tuple;
};

export type CameraCalibrationPreset = {
  position: Vector3Tuple;
  target: Vector3Tuple;
  fov: number;
};

export const VINTAGE_DOSSIER_HERO_CALIBRATION: TransformPreset = {
  position: [0.02, 0.18, 0.02],
  rotation: [-0.28, 0.22, -0.12],
  scale: 0.61,
};

export const VINTAGE_DOSSIER_TABLE_CALIBRATION: TransformPreset = {
  position: [0.02, -0.18, 0.16],
  rotation: [-0.88, 0.18, -0.16],
  scale: 0.58,
};

export const VINTAGE_HERO_CAMERA_CALIBRATION: CameraCalibrationPreset = {
  position: [0.22, 0.4, 6.95],
  target: [0, -0.12, 0],
  fov: 31.5,
};

export const ERICSSON_PHONE_CAMERA_CALIBRATION: CameraCalibrationPreset = {
  position: [0.08, 0.14, 3.55],
  target: [0, -0.1, 0],
  fov: 28,
};

export const VINTAGE_DESK_CALIBRATION: DeskCalibrationPreset = {
  fitSize: {
    desktop: 10.35,
    mobile: 6.6,
  },
  layout: {
    desktop: {
      position: [0.04, -0.3, -0.1],
      rotation: [
        1.2828170002158321,
        -0.09075712110370514,
        -0.11693705988362008,
      ],
      scale: 1,
    },
    mobile: {
      position: [0, -3.45, -1.56],
      rotation: [-1.52, 0.02, -0.008],
      scale: 1,
    },
  },
};

export const ERICSSON_PHONE_MODEL_CALIBRATION: PhoneModelCalibrationPreset = {
  fitSize: 3.35,
  position: [-0.18, -0.2, 0],
  rotation: [-0.16, -0.48, 0.04],
  scale: 1,
};

export const ERICSSON_RECEIVER_CALIBRATION: PhoneReceiverCalibrationPreset = {
  synthetic: {
    position: [0.41, 0.41, -0.05],
    rotation: [0.12, 0.0017453292519943296, 0.029670597283903602],
    scale: 0.8,
  },
  hoverPositionOffset: [-0.02, 0.27, 0.55],
  hoverRotationOffset: [
    0.6287462491055673,
    -0.17278759594743863,
    0.3455751918948773,
  ],
};
