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
    async jwt({ token, account, profile }) {
      if (account?.provider === "openstad" && account?.access_token) {
        /**
         * Fetch a jwt token from the api with the account.access_token,
         * store the token in the token payload so it can be used later for api calls.
         */
        try {
          // @todo: make project id and useAuth dynamic
          const tokenResponse = await fetch(
            `${process.env.API_URL}/auth/project/1/connect-user?useAuth=uniquecode`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                access_token: account.access_token,
                iss: process.env.OAUTH_URL,
              }),
            }
          );
          if (tokenResponse.ok) {
            const tokenData = (await tokenResponse.json()) as { jwt: string };
            token.accessToken = tokenData.jwt;
          }
        } catch (error) {
          console.error(error);
        }
      }
      return token;
    },
  },
};

export default NextAuth(authOptions);
