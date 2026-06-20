import type { ReactNode } from "react";

type AdminDocScreenFrameProps = {
  url: string;
  caption?: string;
  children: ReactNode;
};

export function AdminDocScreenFrame({ url, caption, children }: AdminDocScreenFrameProps) {
  return (
    <figure className="admin-doc-screen">
      <div className="admin-doc-screen-chrome" aria-hidden="true">
        <div className="admin-doc-screen-dots">
          <span />
          <span />
          <span />
        </div>
        <div className="admin-doc-screen-url">{url}</div>
      </div>
      <div className="admin-doc-screen-body">{children}</div>
      {caption ? <figcaption className="admin-doc-screen-caption">{caption}</figcaption> : null}
    </figure>
  );
}
