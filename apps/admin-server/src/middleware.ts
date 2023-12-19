import withAuth from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import logger from '@/lib/logger';

export default withAuth(
  async function middleware(req) {
    if (req.nextUrl.pathname.startsWith('/api/openstad')) {
      if (!req.nextauth.token?.accessToken) {
        logger.error('No access token in JWT');
        return NextResponse.json({ error: 'No access token' }, { status: 401 });
      }

      // Check if the accessToken is still valid
      // @todo: make project id dynamic
      const validationResponse = await fetch(`${process.env.API_URL}/auth/project/1/me`, {
        headers: {
          Authorization: 'Bearer ' + req.nextauth.token?.accessToken,
        },
      });

      if (!validationResponse.ok) {
        logger.error('Invalid or expired token');
        return NextResponse.redirect('/auth/signin');
      }

      logger.debug(
        { Authorization: 'Bearer ' + req.nextauth.token?.accessToken },
        'Rewrite with access token'
      );

      const searchParams = req.nextUrl?.searchParams?.toString();
      const rewrittenUrl = `${
        process.env.API_URL
      }${req.nextUrl.pathname.replace('/api/openstad', '')}${
        searchParams ? '?' + searchParams : ''
      }`;

      return NextResponse.rewrite(rewrittenUrl, {
        headers: {
          Authorization: 'Bearer ' + req.nextauth.token?.accessToken,
        },
      });
    }

    if (req.nextUrl.pathname.startsWith("/api/oauth")) {
      const searchParams = req.nextUrl?.searchParams?.toString();
      const rewrittenUrl =  `${process.env.OAUTH_URL || process.env.OAUTH_URL_INTERNAL}${req.nextUrl.pathname.replace("/api/oauth", "")}${searchParams?'?'+searchParams:''}`;

      return NextResponse.rewrite(
        rewrittenUrl,
        {
          headers: {
            Authorization: "Basic " + btoa(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`),
          },
        },
      );
    }
  },
  {
    pages: {
      signIn: '/auth/signin',
    },
  }
);
