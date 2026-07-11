import { ADREADY_LANDING_SAMPLES } from "@/lib/adreadyLandingSamples";
import { AdReadyLandingPreview } from "./AdReadyLandingPreview";
import styles from "./adreadySampleLandings.module.css";

export default function AdReadySampleLandings() {
  return (
    <div className={styles.grid}>
      {ADREADY_LANDING_SAMPLES.map((sample) => (
        <AdReadyLandingPreview key={sample.slug} sample={sample} />
      ))}
    </div>
  );
}
