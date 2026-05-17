import { permanentRedirect } from "next/navigation";

export default function LegacyProgrammesRedirectPage() {
  permanentRedirect("/programs/");
}
