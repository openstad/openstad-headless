import withAuth from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(function middleware(req) {
  if (req.nextUrl.pathname.startsWith("/api/openstad")) {
    return NextResponse.rewrite(
      process.env.API_URL + req.nextUrl.pathname.replace("/api/openstad", ""),
      {
        headers: {
          Authorization: "Bearer " + req.nextauth.token?.accessToken,
        },
      }
    );
  }
});
