//types/next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser, DefaultJWT } from "src/types/next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    accessToken?: string;
  }
}