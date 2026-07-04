"use client";

import { IconSend, IconStop, IconPaperclip, IconCode, IconGlobe, IconMic, IconX } from "./icons";
import { useComposerVoice } from "./useComposerVoice";

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
  attachments?: { url: string; preview: string }[];
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

  function handleAction() {
    if (streaming) onStop?.();
    else onSubmit();
  }

  return (
    <div className="ar-composer ar-composer--dock">
      <div className="ar-composer-box">
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
        {attachments.length > 0 && (
          <div className="ar-attach-preview-row">
            {attachments.map((a) => (
              <div key={a.url} className="ar-attach-preview">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.preview} alt="" />
                <button type="button" aria-label="حذف" onClick={() => onRemoveAttachment?.(a.url)}>
                  <IconX size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="ar-composer-foot">
          <div className="ar-composer-toolstrip">
            {showAttach && (
              <button
                type="button"
                className={`ar-composer-tool-btn${attachments.length > 0 ? " active" : ""}`}
                aria-label="پیوست تصویر"
                disabled={uploading || streaming || attachments.length >= 2}
                onClick={onAttachClick}
              >
                <IconPaperclip size={16} />
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
                className={`ar-composer-tool-btn${voice.recording ? " active" : ""}`}
                aria-label="ضبط صدا"
                title={guestMode ? "برای ضبط صدا وارد شو" : "ضبط و تبدیل به متن"}
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
              disabled={!streaming && !input.trim() && attachments.length === 0 && !uploading}
              aria-label={streaming ? "توقف" : "ارسال"}
            >
              {streaming ? <IconStop size={16} /> : <IconSend size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
