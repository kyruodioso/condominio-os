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
      /** The user's condominium ID. */
      condominiumId?: string
      /** The user's unit ID (if resident). */
      unitId?: string
      unitNumber?: string
    } & DefaultSession["user"]
  }

  interface User {
    role: string
    condominiumId?: string
    unitId?: string
    unitNumber?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    condominiumId?: string
    unitId?: string
    unitNumber?: string
  }
}
