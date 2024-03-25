import { NextResponse, type NextRequest } from 'next/server';
import { authMiddleware, getSession, signOut } from './auth';

export default async function middleware(req: NextRequest) {

  const res = NextResponse.next();
  const session = await getSession(req, res);

  // ignore
  if (req.nextUrl.pathname.startsWith('/_next')) return res; // internal urls
  if (req.nextUrl.pathname.startsWith('/favicon') ) return res;

  // default page
  console.log(session);
  if (req.nextUrl.pathname.match(/^\/?$/)) // home
  if (session.user) {
    return NextResponse.redirect(`${process.env.URL}/projects`);
  } else {
    return res;
  }

  return authMiddleware(req, res);

}
