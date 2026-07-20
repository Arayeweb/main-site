const ENAMAD_HREF =
  "https://trustseal.enamad.ir/?id=6982136&Code=hOtGsyIqKVXt8Ue4dOIu6tssO2jVSspt";
const ENAMAD_IMG =
  "https://trustseal.enamad.ir/logo.aspx?id=6982136&Code=hOtGsyIqKVXt8Ue4dOIu6tssO2jVSspt";
const ENAMAD_CODE = "hOtGsyIqKVXt8Ue4dOIu6tssO2jVSspt";

type EnamadTrustSealProps = {
  className?: string;
  size?: number;
};

export default function EnamadTrustSeal({
  className,
  size = 80,
}: EnamadTrustSealProps) {
  return (
    <a
      href={ENAMAD_HREF}
      target="_blank"
      rel="noopener noreferrer"
      referrerPolicy="origin"
      className={className}
      aria-label="نماد اعتماد الکترونیکی"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- Enamad requires their hosted logo.aspx */}
      <img
        src={ENAMAD_IMG}
        alt="نماد اعتماد الکترونیکی"
        referrerPolicy="origin"
        width={size}
        height={size}
        style={{ cursor: "pointer", width: size, height: "auto" }}
        {...{ code: ENAMAD_CODE }}
      />
    </a>
  );
}
