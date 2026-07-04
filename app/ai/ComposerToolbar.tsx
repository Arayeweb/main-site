"use client";

import { IconPaperclip, IconCode, IconGlobe, IconImage } from "./icons";

export type ComposerToolbarProps = {
  codeMode: boolean;
  webMode: boolean;
  imageMode: boolean;
  onToggleCode: () => void;
  onToggleWeb: () => void;
  onToggleImage: () => void;
  onAttachClick: () => void;
  hasAttachments?: boolean;
  attachBusy?: boolean;
  disableAttach?: boolean;
  disableImage?: boolean;
  disableAll?: boolean;
  children?: React.ReactNode;
};

export default function ComposerToolbar({
  codeMode,
  webMode,
  imageMode,
  onToggleCode,
  onToggleWeb,
  onToggleImage,
  onAttachClick,
  hasAttachments = false,
  attachBusy = false,
  disableAttach = false,
  disableImage = false,
  disableAll = false,
  children,
}: ComposerToolbarProps) {
  return (
    <div className="ar-composer-toolstrip">
      <button
        type="button"
        className={`ar-composer-tool-btn${hasAttachments ? " active" : ""}`}
        aria-label="پیوست تصویر"
        disabled={disableAll || disableAttach || attachBusy}
        onClick={onAttachClick}
        title="پیوست تصویر"
      >
        <IconPaperclip size={16} />
      </button>
      <button
        type="button"
        className={`ar-composer-tool-btn${codeMode ? " active" : ""}`}
        aria-label="حالت کد"
        disabled={disableAll || imageMode}
        onClick={onToggleCode}
        title="پاسخ با کد و مثال فنی"
      >
        <IconCode size={16} />
      </button>
      <button
        type="button"
        className={`ar-composer-tool-btn${webMode ? " active" : ""}`}
        aria-label="جستجوی وب"
        disabled={disableAll || imageMode}
        onClick={onToggleWeb}
        title="پاسخ با منابع به‌روز وب"
      >
        <IconGlobe size={16} />
      </button>
      <button
        type="button"
        className={`ar-composer-tool-btn${imageMode ? " active" : ""}`}
        aria-label="ساخت تصویر"
        disabled={disableAll || disableImage}
        onClick={onToggleImage}
        title="ساخت تصویر"
      >
        <IconImage size={16} />
      </button>
      {children}
    </div>
  );
}
