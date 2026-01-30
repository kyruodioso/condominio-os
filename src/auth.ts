import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Unit from '@/models/Unit';
import bcrypt from 'bcryptjs';

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            authorize: async (credentials) => {
                await dbConnect();
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await User.findOne({ email: credentials.email });

                if (!user) {
                    throw new Error("User not found.");
                }

                const isPasswordCorrect = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                );

                if (!isPasswordCorrect) {
                    throw new Error("Invalid credentials.");
                }

                // Si es un residente (tiene unitNumber y condominiumId), buscamos su Unit ID
                if (user.unitNumber && user.condominiumId) {
                    const unit = await Unit.findOne({
                        condominiumId: user.condominiumId,
                        number: user.unitNumber
                    });
                    if (unit) {
                        // Asignamos el ID de la unidad al objeto usuario para pasarlo al token
                        user.unitId = unit._id.toString();
                    }
                }

                return user;
            },
        }),
    ],
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                // @ts-ignore
                token.role = user.role;
                // @ts-ignore
                token.condominiumId = user.condominiumId?.toString();
                // @ts-ignore
                if (user.unitId) token.unitId = user.unitId;
                // @ts-ignore
                if (user.unitNumber) token.unitNumber = user.unitNumber;

                // Map profile name to token name
                // @ts-ignore
                if (user.profile?.name) {
                    // @ts-ignore
                    token.name = user.profile.name;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                // @ts-ignore
                session.user.id = token.id;
                // @ts-ignore
                session.user.role = token.role;
                // @ts-ignore
                session.user.condominiumId = token.condominiumId?.toString();
                // @ts-ignore
                if (token.unitId) session.user.unitId = token.unitId;
                // @ts-ignore
                if (token.unitNumber) session.user.unitNumber = token.unitNumber;
            }
            return session;
        },
    },
});
