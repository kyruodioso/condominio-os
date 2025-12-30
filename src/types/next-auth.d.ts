import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's role. */
      role: string
      /** The user's condominium ID. */
      condominiumId?: string
    } & DefaultSession["user"]
  }

  interface User {
    role: string
    condominiumId?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    condominiumId?: string
  }
}
