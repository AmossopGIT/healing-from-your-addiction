import Link from "next/link";

type AdminTablePaginationProps = {
  page: number;
  totalPages: number;
  totalCount: number;
  prevHref: string | null;
  nextHref: string | null;
};

export function AdminTablePagination({
  page,
  totalPages,
  totalCount,
  prevHref,
  nextHref,
}: AdminTablePaginationProps) {
  if (totalCount <= 0 || totalPages <= 1) return null;

  return (
    <nav className="admin-table-pagination" aria-label="Table pagination">
      <p className="cms-field-help">
        Page {page} of {totalPages} ({totalCount} item{totalCount === 1 ? "" : "s"})
      </p>
      <div className="cms-form-actions">
        {prevHref ? (
          <Link className="button button-secondary" href={prevHref}>
            Previous
          </Link>
        ) : (
          <span className="button button-secondary" aria-disabled="true">
            Previous
          </span>
        )}
        {nextHref ? (
          <Link className="button button-secondary" href={nextHref}>
            Next
          </Link>
        ) : (
          <span className="button button-secondary" aria-disabled="true">
            Next
          </span>
        )}
      </div>
    </nav>
  );
}
