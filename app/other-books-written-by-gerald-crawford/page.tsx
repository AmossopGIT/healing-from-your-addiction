import { BooksContentPage } from "@/components/BooksContentPage";
import { geraldCrawfordBooks, trustPages } from "@/content/trustPages";
import { createPageMetadata } from "@/lib/seo";

const page = trustPages.books;

export const metadata = createPageMetadata(page.seo);

export default function OtherBooksPage() {
  return (
    <BooksContentPage
      page={page}
      books={geraldCrawfordBooks}
      breadcrumbs={[
        { name: "Home", path: "/" },
        { name: "Books by Gerald Crawford", path: page.seo.path },
      ]}
    />
  );
}
