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
    };
