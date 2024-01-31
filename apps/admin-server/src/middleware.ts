import withAuth from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import logger from '@/lib/logger';

export default withAuth(
  function middleware(req) {
    if (req.nextUrl.pathname.startsWith('/api/openstad')) {

      // deze afvanging zou op user role moeten werken maar die lijkt niet beschikbeer;
      // voorlopig lijkt dit acceptabel omdat je alleen met role admin kunt inloggen op deze server
      if (!req.nextauth.token?.accessToken) {
        logger.error('No admin user found');
        return NextResponse.json({ error: 'No admin user found' }, { status: 401 });
      }

      logger.debug(
        { Authorization: process.env.API_FIXED_AUTH_KEY },
        'Rewrite with API_FIXED_AUTH_KEY'
      );

      const searchParams = req.nextUrl?.searchParams?.toString();
      const rewrittenUrl = `${
        process.env.API_URL_INTERNAL
      }${req.nextUrl.pathname.replace('/api/openstad', '')}${
        searchParams ? '?' + searchParams : ''
      }`;

      return NextResponse.rewrite(rewrittenUrl, {
        headers: {
          Authorization: process.env.API_FIXED_AUTH_KEY
        },
      });
    }

    if (req.nextUrl.pathname.startsWith("/api/oauth")) {
      const searchParams = req.nextUrl?.searchParams?.toString();
      const rewrittenUrl =  `${process.env.OAUTH_URL_INTERNAL || process.env.OAUTH_URL}${req.nextUrl.pathname.replace("/api/oauth", "")}${searchParams?'?'+searchParams:''}`;

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
