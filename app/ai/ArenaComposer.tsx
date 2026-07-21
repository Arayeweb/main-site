"use client";

import {
  IconSend,
  IconStop,
  IconPaperclip,
  IconCode,
  IconGlobe,
  IconMic,
  IconX,
  IconCheck,
} from "./icons";
import { useComposerVoice } from "./useComposerVoice";

function formatElapsed(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Composer مشترک چت — DirectChatView و سایر sessionها */
export default function ArenaComposer({
  input,
  onInputChange,
  onSubmit,
  onStop,
  streaming = false,
  uploading = false,
  attachments = [],
  onRemoveAttachment,
  onAttachClick,
  codeMode = false,
  onToggleCode,
  webMode = false,
  onToggleWeb,
  guestMode = false,
  onNeedAuth,
  textareaRef,
  showMic = true,
  showAttach = true,
  placeholder = "هر چی می‌خوای بپرس…",
}: {
  input: string;
  onInputChange: (v: string) => void;
  onSubmit: () => void;
  onStop?: () => void;
  streaming?: boolean;
  uploading?: boolean;
  attachments?: { url: string; mime?: string; preview: string; name?: string }[];
  onRemoveAttachment?: (url: string) => void;
  onAttachClick?: () => void;
  codeMode?: boolean;
  onToggleCode?: () => void;
  webMode?: boolean;
  onToggleWeb?: () => void;
  guestMode?: boolean;
  onNeedAuth?: () => void;
  textareaRef?: React.RefObject<HTMLTextAreaElement>;
  showMic?: boolean;
  showAttach?: boolean;
  placeholder?: string;
}) {
  const voice = useComposerVoice({
    guestMode,
    disabled: streaming || uploading,
    onTranscript: (text) => {
      onInputChange(input ? `${input.trim()} ${text}` : text);
      textareaRef?.current?.focus();
    },
    onNeedAuth,
  });

  const voiceActive = voice.recording || voice.busy;

  function handleAction() {
    if (streaming) onStop?.();
    else onSubmit();
  }

  return (
    <div className="ar-composer ar-composer--dock">
      <div className={`ar-composer-box${voiceActive ? " ar-composer-box--voice" : ""}`}>
        {voiceActive ? (
          <div
            className="ar-voice-bar"
            role="status"
            aria-live="polite"
            aria-label={voice.busy ? "در حال تبدیل صدا به متن" : "در حال ضبط صدا"}
          >
            <div className="ar-voice-bar-main">
              {showAttach && (
                <button
                  type="button"
                  className="ar-composer-tool-btn"
                  aria-label="پیوست تصویر"
                  disabled
                >
                  <IconPaperclip size={16} />
                </button>
              )}
              <div className="ar-voice-wave" aria-hidden>
                <div className="ar-voice-wave-track">
                  {Array.from({ length: 18 }, (_, i) => (
                    <span key={`d-${i}`} className="ar-voice-dot" />
                  ))}
                </div>
                <div className={`ar-voice-wave-bars${voice.busy ? " is-busy" : ""}`}>
                  {voice.levels.map((level, i) => (
                    <span
                      key={`b-${i}`}
                      className="ar-voice-bar-col"
                      style={{
                        transform: `scaleY(${voice.busy ? 0.35 + (i % 5) * 0.08 : level})`,
                      }}
                    />
                  ))}
                </div>
              </div>
              <span className="ar-voice-timer">
                {voice.busy ? "…" : formatElapsed(voice.elapsedSec)}
              </span>
            </div>
            <div className="ar-voice-bar-actions">
              <button
                type="button"
                className="ar-voice-action ar-voice-action--cancel"
                aria-label="لغو ضبط"
                disabled={voice.busy}
                onClick={() => voice.cancel()}
              >
                <IconX size={16} />
              </button>
              <button
                type="button"
                className="ar-voice-action ar-voice-action--confirm"
                aria-label="تأیید و تبدیل به متن"
                title="تبدیل صدا به متن · از اعتبار کم می‌شود"
                disabled={voice.busy}
                onClick={() => voice.confirm()}
              >
                {voice.busy ? (
                  <span className="ar-upload-spinner" aria-hidden />
                ) : (
                  <IconCheck size={16} />
                )}
              </button>
            </div>
          </div>
        ) : (
          <>
            <textarea
              ref={textareaRef}
              rows={2}
              value={input}
              onChange={(e) => {
                onInputChange(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (!streaming) onSubmit();
                }
              }}
              placeholder={placeholder}
              maxLength={4000}
            />
            {(attachments.length > 0 || uploading) && (
              <div className="ar-attach-preview-row">
                {attachments.map((a) => (
                  <div key={a.url} className="ar-attach-preview">
                    {a.mime?.startsWith("image/") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.preview} alt="" />
                    ) : (
                      <span className="ar-attach-file-label">
                        {a.name?.split(".").pop()?.toUpperCase() || "FILE"}
                      </span>
                    )}
                    <button
                      type="button"
                      aria-label="حذف"
                      onClick={() => onRemoveAttachment?.(a.url)}
                    >
                      <IconX size={12} />
                    </button>
                  </div>
                ))}
                {uploading && (
                  <div
                    className="ar-attach-preview ar-attach-uploading"
                    role="status"
                    aria-live="polite"
                  >
                    <span className="ar-upload-spinner" aria-hidden="true" />
                    <span>در حال آپلود</span>
                  </div>
                )}
              </div>
            )}
            <div className="ar-composer-foot">
              <div className="ar-composer-toolstrip">
                {showAttach && (
                  <button
                    type="button"
                    className={`ar-composer-tool-btn${attachments.length > 0 || uploading ? " active" : ""}`}
                    aria-label="پیوست تصویر"
                    disabled={uploading || streaming || attachments.length >= 2}
                    onClick={onAttachClick}
                  >
                    {uploading ? (
                      <span className="ar-upload-spinner" aria-hidden="true" />
                    ) : (
                      <IconPaperclip size={16} />
                    )}
                  </button>
                )}
                {onToggleCode && (
                  <button
                    type="button"
                    className={`ar-composer-tool-btn${codeMode ? " active" : ""}`}
                    aria-label="حالت کد"
                    disabled={streaming}
                    onClick={onToggleCode}
                  >
                    <IconCode size={16} />
                  </button>
                )}
                {showMic && (
                  <button
                    type="button"
                    className="ar-composer-tool-btn"
                    aria-label="ضبط صدا"
                    title={
                      guestMode
                        ? "برای ضبط صدا وارد شو"
                        : "ضبط صدا و تبدیل به متن · از اعتبار کم می‌شود"
                    }
                    disabled={streaming || voice.busy}
                    onClick={() => voice.start()}
                  >
                    <IconMic size={16} />
                  </button>
                )}
                {onToggleWeb && (
                  <button
                    type="button"
                    className={`ar-composer-tool-btn${webMode ? " active" : ""}`}
                    aria-label="جستجوی وب"
                    disabled={streaming}
                    onClick={onToggleWeb}
                  >
                    <IconGlobe size={16} />
                  </button>
                )}
              </div>
              <div className="ar-composer-actions">
                <button
                  type="button"
                  className={`ar-send-btn ar-send-btn--dock${streaming ? " ar-send-btn--stop" : ""}`}
                  onClick={handleAction}
                  disabled={
                    uploading || (!streaming && !input.trim() && attachments.length === 0)
                  }
                  aria-label={streaming ? "توقف" : "ارسال"}
                >
                  {streaming ? <IconStop size={16} /> : <IconSend size={16} />}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
