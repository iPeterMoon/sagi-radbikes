/*
  Warnings:

  - You are about to drop the column `description` on the `user_role` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[telefono]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "user_role" DROP COLUMN "description";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "apellido" VARCHAR,
ADD COLUMN     "email" VARCHAR,
ADD COLUMN     "is_active" BOOLEAN DEFAULT true,
ADD COLUMN     "nombre" VARCHAR,
ADD COLUMN     "telefono" VARCHAR;

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_telefono_key" ON "users"("telefono");
