# Migration `20191223213735`

This migration has been generated by lostfictions at 12/23/2019, 9:37:35 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
CREATE TABLE "quaint"."DiscordUser" (
  "expires" INTEGER NOT NULL DEFAULT 0  ,
  "id" TEXT NOT NULL   ,
  "refreshToken" TEXT NOT NULL DEFAULT ''  ,
  "token" TEXT NOT NULL DEFAULT ''  ,
  PRIMARY KEY ("id")
);

DROP TABLE "quaint"."Post";

DROP TABLE "quaint"."User";
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20191223213601..20191223213735
--- datamodel.dml
+++ datamodel.dml
@@ -3,22 +3,13 @@
 }
 datasource db {
   provider = "sqlite"
-  url = "***"
+  url      = "file:dev.db"
 }
-model Post {
-  id        String   @default(cuid()) @id
-  createdAt DateTime @default(now())
-  updatedAt DateTime @updatedAt
-  published Boolean  @default(false)
-  title     String
-  content   String?
-  author    User?
-}
-model User {
+model DiscordUser {
   id           String @id
   token        String
   expires      Int
   refreshToken String
```


