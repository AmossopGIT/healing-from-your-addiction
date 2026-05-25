import type { ClientProfile } from "@/types/database";

export function isClientOnboardingComplete(clientProfile: Pick<ClientProfile, "onboarding_completed_at"> | null | undefined) {
  return Boolean(clientProfile?.onboarding_completed_at);
}
