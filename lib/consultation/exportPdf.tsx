import { renderToBuffer } from "@react-pdf/renderer";
import { ConsultationAnswersPdf } from "@/lib/consultation/blankPdf";
import type { ClientConsultation } from "@/types/database";

export async function buildConsultationAnswersPdf(
  consultation: ClientConsultation,
  clientName: string,
) {
  return renderToBuffer(
    <ConsultationAnswersPdf consultation={consultation} clientName={clientName} />,
  );
}
