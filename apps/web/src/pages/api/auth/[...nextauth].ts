import Openstad from "@/lib/auth/openstad-provider";
import NextAuth, { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    Openstad({
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      issuer: process.env.OAUTH_URL,
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "openstad" && profile?.role !== "admin") {
        // Only allow admins to sign in
        return "/api/auth/signin?error=RoleUnauthorized";
      }
      return true;
    },
    async session({ session, token }) {
      if (token.accessToken) {
        session.accessToken = token.accessToken;
      }
      return session;
    },
    async jwt({ token, account }) {
      if (account?.provider === "openstad" && account?.access_token) {
        /**
         * @todo: Fetch a jwt token from the api with the account.access_token,
         * store the token in the session so it can be used later for api calls.
         *
         * For now this is not possible since the api only creates jwt tokens
         * when oauth request flow through the api.
         *
         * Maybe this was done for security purposes.
         */
      }
      return token;
    },
  },
};

export default NextAuth(authOptions);
