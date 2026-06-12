"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import { useLanguage } from "@/components/providers/LanguageProvider";

const PAPER_SOUND_SRC = "/profile/detective/page-turn.mp3";

export function DetectiveFile() {
  const { dictionary } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  function playPaperSound() {
    if (!audioRef.current) {
      audioRef.current = new Audio(PAPER_SOUND_SRC);
      audioRef.current.volume = 0.45;
    }

    audioRef.current.currentTime = 0;
    void audioRef.current.play().catch(() => undefined);
  }

  function toggleFile() {
    playPaperSound();
    setIsOpen((current) => !current);
  }

  return (
    <button
      type="button"
      className="detective-file"
      data-open={isOpen}
      data-testid="detective-file"
      aria-pressed={isOpen}
      aria-label={
        isOpen
          ? dictionary.detectiveFile.closeLabel
          : dictionary.detectiveFile.openLabel
      }
      onClick={toggleFile}
    >
      <span className="detective-file__inner">
        <span className="detective-file__back" aria-hidden="true" />

        <span className="detective-file__document">
          <span className="detective-file__paperclip" aria-hidden="true" />

          <span className="detective-file__photo-wrap">
            <Image
              src="/profile/detective/individual-1.jpeg"
              alt={dictionary.detectiveFile.photoAlt}
              fill
              sizes="(min-width: 1024px) 260px, 62vw"
              className="detective-file__photo"
              data-testid="detective-file-photo"
              priority
            />
          </span>

          <span className="detective-file__stamp">
            {dictionary.detectiveFile.classified}
          </span>

          <span className="detective-file__meta">
            <span>
              {dictionary.detectiveFile.subject}:{" "}
              {dictionary.detectiveFile.subjectName}
            </span>
            <span>
              {dictionary.detectiveFile.roleLabel}:{" "}
              {dictionary.detectiveFile.role}
            </span>
            <span>
              {dictionary.detectiveFile.status}:{" "}
              {dictionary.detectiveFile.statusActive}
            </span>
            <span>
              {dictionary.detectiveFile.caseLabel}:{" "}
              {dictionary.detectiveFile.fileNumber}
            </span>
          </span>

          <span className="detective-file__evidence">
            <span className="detective-file__evidence-photo">
              <Image
                src="/profile/detective/individual-2.jpeg"
                alt={dictionary.detectiveFile.secondaryPhotoAlt}
                fill
                sizes="72px"
                className="detective-file__photo"
              />
            </span>
            <span className="detective-file__evidence-photo">
              <Image
                src="/profile/detective/grupo-1.jpeg"
                alt={dictionary.detectiveFile.groupPhotoAlt}
                fill
                sizes="72px"
                className="detective-file__photo"
              />
            </span>
            <span className="detective-file__evidence-label">
              {dictionary.detectiveFile.evidence}
            </span>
          </span>
        </span>

        <span className="detective-file__front">
          <span className="detective-file__folder-tab">
            {dictionary.detectiveFile.caseFile}
          </span>

          <span className="detective-file__label">
            <span>{dictionary.detectiveFile.fileNumber}</span>
            <strong>{dictionary.detectiveFile.classified}</strong>
          </span>

          <span className="detective-file__front-lines" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </span>
      </span>

      <span className="detective-file__hint">
        {dictionary.detectiveFile.hint}
      </span>
    </button>
  );
}
