import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      sessionVersion: number;
      role: string;
      organizationId?: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    sessionVersion?: number;
    role?: string;
    organizationId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sessionVersion?: number;
    id?: string;
    role?: string;
    organizationId?: string;
  }
}
