import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DetectiveFile } from "@/components/profile/DetectiveFile";
import { LanguageProvider } from "@/components/providers/LanguageProvider";

type AudioMockInstance = {
  currentTime: number;
  play: ReturnType<typeof vi.fn>;
  src: string;
  volume: number;
};

function renderDetectiveFile() {
  return render(
    <LanguageProvider>
      <DetectiveFile />
    </LanguageProvider>,
  );
}

describe("DetectiveFile", () => {
  const audioInstances: AudioMockInstance[] = [];
  let playMock: ReturnType<typeof vi.fn>;
  let AudioMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    audioInstances.length = 0;
    playMock = vi.fn(() => Promise.resolve());
    AudioMock = vi.fn((src: string) => {
      const instance = {
        currentTime: 7,
        play: playMock,
        src,
        volume: 1,
      };

      audioInstances.push(instance);
      return instance;
    });

    vi.stubGlobal("Audio", AudioMock);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("renders closed initially and toggles open with click while playing paper sound", async () => {
    const user = userEvent.setup();
    renderDetectiveFile();

    const file = screen.getByRole("button", {
      name: "Abrir dossie confidencial",
    });

    expect(file.getAttribute("aria-pressed")).toBe("false");
    expect(file.getAttribute("data-open")).toBe("false");

    await user.click(file);

    expect(file.getAttribute("aria-pressed")).toBe("true");
    expect(file.getAttribute("data-open")).toBe("true");
    expect(AudioMock).toHaveBeenCalledWith("/profile/detective/page-turn.mp3");
    expect(audioInstances[0].volume).toBe(0.45);
    expect(audioInstances[0].currentTime).toBe(0);
    expect(playMock).toHaveBeenCalledTimes(1);

    await user.click(file);

    expect(file.getAttribute("aria-pressed")).toBe("false");
    expect(file.getAttribute("data-open")).toBe("false");
    expect(AudioMock).toHaveBeenCalledTimes(1);
    expect(playMock).toHaveBeenCalledTimes(2);
  });

  it("toggles with keyboard and keeps working when audio playback is blocked", async () => {
    const user = userEvent.setup();
    playMock.mockRejectedValue(new Error("blocked"));
    renderDetectiveFile();

    const file = screen.getByRole("button", {
      name: "Abrir dossie confidencial",
    });

    file.focus();
    await user.keyboard("{Enter}");

    expect(file.getAttribute("aria-pressed")).toBe("true");
    expect(playMock).toHaveBeenCalledTimes(1);

    await user.keyboard(" ");

    expect(file.getAttribute("aria-pressed")).toBe("false");
    expect(playMock).toHaveBeenCalledTimes(2);
  });
});
