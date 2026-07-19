import { DIRECT_MODELS } from '@/lib/aiModels';

export type CmsModelOption = {
  id: string;
  label: string;
  tier: string;
  blurb: string;
};

export function getCmsModelOptions(): CmsModelOption[] {
  return DIRECT_MODELS.map((m) => ({
    id: m.id,
    label: m.personaName ?? m.name,
    tier: m.tier,
    blurb: m.blurb,
  }));
}

export const CMS_DEFAULT_MODEL = 'economy';
