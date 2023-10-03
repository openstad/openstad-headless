import Openstad from "@/lib/auth/openstad-provider";
import NextAuth, { NextAuthOptions } from "next-auth";
import logger from "@/lib/logger";

export const authOptions: NextAuthOptions = {
  providers: [
    Openstad({
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      issuer: process.env.OAUTH_URL,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "openstad" && profile?.role !== "admin") {
        logger.debug({ account, profile }, "RoleUnauthorized");
        // Only allow admins to sign in
        return "/api/auth/signin?error=RoleUnauthorized";
      }
      return true;
    },
    async jwt({ token, account, profile }) {
      if (account?.provider === "openstad" && account?.access_token) {
        if (token.accessToken) {
          logger.debug("Next-auth JWT token already has an access token");
          return token;
        }
        /**
         * Fetch a jwt token from the api with the account.access_token,
         * store the token in the token payload so it can be used later for api calls.
         */
        try {
          logger.debug(
            "Fetch JWT token from api with access token from provider"
          );
          // @todo: make project id and useAuth dynamic
          const tokenResponse = await fetch(
            `${process.env.API_URL}/auth/project/1/connect-user`,
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
            logger.debug({ token, tokenData }, "JWT token fetched from api");
          } else {
            const errorData = await tokenResponse.json();
            logger.error(
              { status: tokenResponse.statusText, errorData },
              "Error fetching jwt token from api"
            );
            return {
              ...token,
              error: "TokenFetchError",
            }
          }
        } catch (error) {
          logger.error(error, 'Error fetching jwt token from api');
          return {
            ...token,
            error: "TokenFetchError",
          }
        }
      }
      return token;
    },
  },
};

export default NextAuth(authOptions);
