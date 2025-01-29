import { NextResponse, type NextRequest } from 'next/server';
import { authMiddleware, getSession } from './auth';

export default async function middleware(req: NextRequest) {

  const res = NextResponse.next();
  const session = await getSession(req, res);

  // ignore
  if (req.nextUrl.pathname.startsWith('/_next')) return res; // internal urls
  if (req.nextUrl.pathname.startsWith('/favicon') ) return res;
  if (req.nextUrl.pathname.startsWith('/health')) return res;
  if (req.nextUrl.pathname.startsWith('/api/health')) return res;

  // default page
  if (req.nextUrl.pathname.match(/^\/?$/)) { // home
    if (session.user) {
      return NextResponse.redirect(`${process.env.URL}/projects`);
    } else {
      return res;
    }
  }

  // signin
  if (req.nextUrl.pathname.match(/^\/signin$/i)) {
    return NextResponse.redirect(`${process.env.API_URL}/auth/project/1/login?useAuth=default&redirectUri=${process.env.URL}/projects`);
  }

  // signout
  if (req.nextUrl.pathname.match(/^\/signout$/i)) {
    const session = await getSession(req, res);
    session.destroy()
    return NextResponse.redirect(`${process.env.API_URL}/auth/project/1/logout?useAuth=default&redirectUri=${process.env.URL}/`, { headers: res.headers });
  }

  return authMiddleware(req, res);

}
