-- An admin can keep a book out of the home page's automatic sections.
ALTER TABLE "Book" ADD COLUMN "hideFromHome" BOOLEAN NOT NULL DEFAULT false;
