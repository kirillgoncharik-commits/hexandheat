function supportedMime(MediaRecorderClass) {
  const candidates = ["video/webm;codecs=vp8", "video/mp4;codecs=avc1", "video/webm"];
  return candidates.find((type) => MediaRecorderClass.isTypeSupported?.(type)) ?? "";
}

/** Record an abstract, rights-safe loop whose first and last frames are equal. */
export function createSyntheticLoop({ hue, label, durationMs = 960, fps = 24 } = {}) {
  if (!globalThis.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) {
    return Promise.reject(new Error("Synthetic MediaRecorder POC is unavailable"));
  }
  const canvas = document.createElement("canvas");
  canvas.width = 320;
  canvas.height = 240;
  const context = canvas.getContext("2d");
  const stream = canvas.captureStream(fps);
  const mimeType = supportedMime(globalThis.MediaRecorder);
  const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
  const chunks = [];
  const frameCount = Math.max(3, Math.round((durationMs / 1000) * fps));

  return new Promise((resolve, reject) => {
    recorder.addEventListener("dataavailable", (event) => {
      if (event.data.size) chunks.push(event.data);
    });
    recorder.addEventListener("error", () => reject(new Error("Synthetic video recording failed")), { once: true });
    recorder.addEventListener("stop", () => {
      stream.getTracks().forEach((track) => track.stop());
      const blob = new Blob(chunks, { type: recorder.mimeType || "video/webm" });
      if (!blob.size) reject(new Error("Synthetic video recording was empty"));
      else resolve(URL.createObjectURL(blob));
    }, { once: true });

    let frame = 0;
    recorder.start();
    const draw = () => {
      const phase = (Math.PI * 2 * frame) / (frameCount - 1);
      const pulse = (Math.sin(phase) + 1) / 2;
      context.fillStyle = `hsl(${hue} 38% ${10 + pulse * 4}%)`;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = `hsla(${hue} 90% 68% / ${0.25 + pulse * 0.35})`;
      context.beginPath();
      context.arc(160, 120, 42 + pulse * 24, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = "rgba(255,255,255,.84)";
      context.font = "700 18px system-ui";
      context.textAlign = "center";
      context.fillText(label, 160, 126);
      frame += 1;
      if (frame >= frameCount) {
        setTimeout(() => recorder.stop(), 1000 / fps);
      } else {
        setTimeout(draw, 1000 / fps);
      }
    };
    draw();
  });
}

export async function createSyntheticVideoSources() {
  const [idle, reaction] = await Promise.all([
    createSyntheticLoop({ hue: 272, label: "IDLE · ANCHOR A" }),
    createSyntheticLoop({ hue: 18, label: "REACTION · ANCHOR A" })
  ]);
  return Object.freeze({ IDLE: idle, REACTION: reaction });
}
