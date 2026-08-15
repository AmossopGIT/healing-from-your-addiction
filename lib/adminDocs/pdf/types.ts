export type AdminDocPdfPayload =
  | {
      kind: "markdown";
      slug: string;
      title: string;
      description: string;
      category: string;
      markdown: string;
    }
  | {
      kind: "admin-login-guide";
      slug: string;
    }
  | {
      kind: "lead-onboarding-guide";
      slug: string;
    }
  | {
      kind: "programme-start-guide";
      slug: string;
    };
