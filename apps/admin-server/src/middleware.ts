import { NextResponse, type NextRequest } from 'next/server';
import { authMiddleware, getSession } from './auth';
import { HasAccess } from './lib/hasAccess';

const restrictedPaths = [
  '/areas',
  '/duplicate',
  '/settings/anonymization',
  '/settings/notifications',
  '/settings/alloweddomains',
  '/settings/design',
  '/authentication/2fa',
  '/export',
];

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

  const match = req.nextUrl.pathname.match(/^\/projects\/(\d+)(\/.*)?$/);

  if (match) {
    const subPath = match[2] || '/';
    const projectId = match[1];

    if (!HasAccess(session?.user) && restrictedPaths.includes(subPath)) {
      return NextResponse.redirect(`${process.env.URL}/projects/${projectId}/widgets`);
    } else if (!HasAccess(session?.user) && subPath === '/settings') {
      return NextResponse.redirect(`${process.env.URL}/projects/${projectId}/settings/voting`);
    }
  }

  return authMiddleware(req, res);

}
