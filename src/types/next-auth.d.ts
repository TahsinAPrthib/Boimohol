import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      role: string;
      name?: string | null;
      email?: string | null;
      // When the password was last changed, as the login token saw it at
      // sign-in (0: never). See src/lib/account-rules.ts.
      passwordStamp?: number;
    };
  }
  interface User {
    username: string;
    role: string;
    passwordStamp?: number;
  }
}
