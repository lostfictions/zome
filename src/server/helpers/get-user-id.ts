import { verify } from "jsonwebtoken";

import { APP_SECRET } from "../env";

export default function getUserId(session?: string): string | null {
  if (session) {
    try {
      return verify(session, APP_SECRET) as string;
    } catch (e) {
      console.log(`[couldn't verify user]`, e);
    }
  }
  return null;
}
