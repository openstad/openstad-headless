import withAuth from "next-auth/middleware";
import { NextResponse } from "next/server";
import logger from "@/lib/logger";

export default withAuth(
  function middleware(req) {
    if (req.nextUrl.pathname.startsWith("/api/openstad")) {
      if (!req.nextauth.token?.accessToken) {
        logger.error("No access token in JWT");
        return NextResponse.json({ error: "No access token" }, { status: 401 });
      }
      logger.debug(
        { Authorization: "Bearer " + req.nextauth.token?.accessToken },
        "Rewrite with access token"
      );
      return NextResponse.rewrite(
        process.env.API_URL + req.nextUrl.pathname.replace("/api/openstad", ""),
        {
          headers: {
            Authorization: "Bearer " + req.nextauth.token?.accessToken,
          },
        }
      );
    }
  },
  {
    pages: {
      signIn: "/auth/signin",
    },
  }
);
