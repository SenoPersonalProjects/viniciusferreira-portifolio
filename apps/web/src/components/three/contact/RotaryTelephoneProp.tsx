"use client";

import { useEffect, useMemo, useState } from "react";

import {
  ERICSSON_PHONE_CAMERA_CALIBRATION,
  ERICSSON_RECEIVER_CALIBRATION,
  ERICSSON_PHONE_MODEL_CALIBRATION,
} from "@/components/three/calibration/modelCalibrationPresets";
import {
  getAppliedPhoneModelCalibration,
  getAppliedReceiverCalibration,
  subscribeAppliedModelCalibration,
} from "@/components/three/calibration/modelCalibrationStorage";
import { DecorativeModelCanvas } from "@/components/three/decor/DecorativeModelCanvas";

const ERICSSON_CREDIT =
  '"Ericsson DBH 1001 telephone" (https://skfb.ly/ouFUW) by Museum of Engineering and Technology, Krakow is licensed under CC Attribution-NonCommercial-ShareAlike (http://creativecommons.org/licenses/by-nc-sa/4.0/).';

type RotaryTelephonePropProps = {
  isSceneVisible?: boolean;
};

export function RotaryTelephoneProp({
  isSceneVisible = false,
}: RotaryTelephonePropProps) {
  const [phoneModelCalibration, setPhoneModelCalibration] = useState(() =>
    ERICSSON_PHONE_MODEL_CALIBRATION,
  );
  const [receiverCalibration, setReceiverCalibration] = useState(() =>
    ERICSSON_RECEIVER_CALIBRATION,
  );
  const camera = useMemo(
    () => ({
      position: ERICSSON_PHONE_CAMERA_CALIBRATION.position,
      target: ERICSSON_PHONE_CAMERA_CALIBRATION.target,
      fov: ERICSSON_PHONE_CAMERA_CALIBRATION.fov,
    }),
    [],
  );
  const model = useMemo(
    () => ({
      fitSize: phoneModelCalibration.fitSize,
      position: phoneModelCalibration.position,
      rotation: phoneModelCalibration.rotation,
      scale: phoneModelCalibration.scale,
    }),
    [phoneModelCalibration],
  );
  const parallax = useMemo(
    () => ({
      rotation: [0.04, 0.1, 0] as [number, number, number],
      position: [0.1, 0.06, 0] as [number, number, number],
      scale: 1.018,
      damp: 6.2,
    }),
    [],
  );
  const receiver = useMemo(
    () => ({
      nameIncludes: ["sluchawka", "receiver", "handset"],
      hideOriginal: true,
      synthetic: receiverCalibration.synthetic,
      hoverPositionOffset: receiverCalibration.hoverPositionOffset,
      hoverRotationOffset: receiverCalibration.hoverRotationOffset,
    }),
    [receiverCalibration],
  );

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setPhoneModelCalibration(getAppliedPhoneModelCalibration());
      setReceiverCalibration(getAppliedReceiverCalibration());
    });

    const unsubscribe = subscribeAppliedModelCalibration(() => {
      setPhoneModelCalibration(getAppliedPhoneModelCalibration());
      setReceiverCalibration(getAppliedReceiverCalibration());
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      unsubscribe();
    };
  }, []);

  return (
    <DecorativeModelCanvas
      modelPath="/models/contact/ericsson-dbh-1001/ericsson_dbh_1001_telephone.glb"
      loader="gltf"
      camera={camera}
      model={model}
      parallax={parallax}
      lighting={{
        ambient: 0.78,
        key: 1.6,
        fill: 0.62,
        rim: 0.58,
      }}
      receiver={receiver}
      visualTreatment="vintage-noir"
      label="Telefone antigo decorativo"
      credit={ERICSSON_CREDIT}
      creditLabel="Crédito do modelo Ericsson DBH 1001 telephone"
      testId="rotary-telephone-3d"
      forceVisible={isSceneVisible}
      trackPointerGlobally
      className="pointer-events-none absolute -right-4 bottom-6 z-20 hidden h-[24rem] w-[32rem] overflow-visible opacity-100 md:block lg:-right-6 lg:bottom-8 lg:h-[28rem] lg:w-[38rem] xl:-right-8 xl:h-[30rem] xl:w-[40rem]"
      stageClassName="absolute inset-0 h-full w-full"
    />
  );
}
