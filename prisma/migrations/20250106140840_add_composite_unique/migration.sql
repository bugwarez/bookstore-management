/*
  Warnings:

  - A unique constraint covering the columns `[bookstoreId,bookId]` on the table `BookstoreBook` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "unique_bookstore_book" ON "BookstoreBook"("bookstoreId", "bookId");
