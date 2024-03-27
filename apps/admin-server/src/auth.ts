import { NextResponse, type NextRequest } from 'next/server';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getIronSession } from 'iron-session';
import hasRole from './lib/hasRole';
import { createContext } from 'react';

interface OpenstadProfile extends Record<string, any> {
  id: number;
  role: string | undefined;
  name: string | undefined;
  email: string | undefined;
  phoneNumber: string | undefined;
  hashedPhoneNumber: string | undefined;
  phoneNumberConfirmed: string | boolean | undefined;
  streetName: string | undefined;
  houseNumber: string | undefined;
  suffix: string | undefined;
  postcode: string | undefined;
  city: string | undefined;
  scope: string | undefined;
}

type userType = {
  id: number;
  name: string | undefined;
  role: string | undefined;
}

interface SessionData {
  [key:string]: string | number | userType | undefined,
  user?: userType,
}

const sessionOptions = {
  password: process.env.COOKIE_SECRET as string,
  cookieName: 'openstad-session',
  cookieOptions: {
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 100,
  },
};

async function getSession(req: NextRequest | NextApiRequest, res: NextResponse | NextApiResponse) {
  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  return session;
}

async function authMiddleware(req: NextRequest, res: NextResponse) {

  // signout
  if (req.nextUrl.pathname.startsWith('/signout')) return signOut(req, res);
  if (req.nextUrl.pathname.startsWith('/auth/signout')) return res;

  // projectId
  let targetProjectId = 1;
  let match = req.nextUrl.pathname.match(/^\/projects\/(\d+)/)
  if (match) targetProjectId = parseInt(match[1]);
  match = req.nextUrl.pathname.match(/^\/api\/openstad\/api\/project\/(\d+)/)
  if (match) targetProjectId = parseInt(match[1]);

  // session
  const session = await getSession(req, res);
  let jwt = session[`project-${targetProjectId}`] || session[`project-1`];
  
  // store login token
  const searchParams = req.nextUrl?.searchParams;
  let openstadlogintoken = searchParams.get('openstadlogintoken');
  if (openstadlogintoken) {
    jwt = openstadlogintoken;
    session[`project-${targetProjectId}`] = jwt;
    await session.save()
    let path = req.nextUrl.pathname;
    if (path == '' || path == '/') path = '/projects';
    let query = searchParams ? '?' + searchParams.toString() : '';
    query = query.replace(/openstadlogintoken=(?:.(?!&|$))+./, '');
    if (query == '?') query = '';
    let newUrl = `${process.env.URL}${path}${query}`;
    return NextResponse.redirect( newUrl, { headers: res.headers });
  }

  if (!req.nextUrl.pathname.startsWith('/_')) { // not on internal urls

    let forceNewLogin = false;

    // check login token
    if (jwt) {
      try {
        let url = `${process.env.API_URL_INTERNAL}/auth/project/${targetProjectId}/me`
        let response = await fetch(url, {
          headers: { Authorization: `Bearer ${jwt}` },
        })
        if (!response.ok) throw new Error('TokenValidationFailed')
        let result:OpenstadProfile = await response.json();
        if (!result.id) throw 'no user'
        if ( !( req.nextUrl.pathname.match(/^\/(?:projects)?\/?/) && hasRole(result, 'member') ) // project overview is available for members; anything else requires 
             && result.role != 'superuser'
             && result.role != 'admin' ) {
          forceNewLogin = true;
          throw 'no user';
        }
        session.user = {
          id: result.id,
          name: result.name,
          role: result.role,
        };
      } catch(err) {
        jwt = '';
        session.user = undefined;
      } finally {
        await session.save()
      }
    }
    
    // login if token not found
    if (!jwt) {
      return signIn(req, targetProjectId, forceNewLogin)
    }  

  }
  
  // api requests: add jwt
  if (req.nextUrl.pathname.startsWith('/api/openstad')) {
    let path = req.nextUrl.pathname.replace('/api/openstad', '');
    let query = searchParams ? '?' + searchParams.toString() : '';
    query = query.replace(/openstadlogintoken=(?:.(?!&|$))+./, '');
    const rewrittenUrl = `${process.env.API_URL}${path}${query}`;
    return NextResponse.rewrite(rewrittenUrl, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
  }  

  return res;

}

function signIn(req: NextRequest, projectId?: number, forceNewLogin?: boolean) {
  projectId = projectId || 1;
  let path = req.nextUrl.pathname.replace('/api/openstad', '');
  if (path == '/') path = '/projects';
  let redirectUri = `${process.env.URL}${path}?openstadlogintoken=[[jwt]]`;
  let loginUrl = `${process.env.API_URL}/auth/project/${projectId}/login?useAuth=default&redirectUri=${redirectUri}${ forceNewLogin ? '&forceNewLogin=1' : '' }`;
  return NextResponse.redirect(loginUrl);
}

function clientSignIn(projectId?: number, forceNewLogin?: boolean) {
  if (typeof projectId == 'undefined') projectId = 1;
  if (typeof forceNewLogin == 'undefined') forceNewLogin = true;
  let loginUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/project/1/login?useAuth=default&redirectUri=${process.env.NEXT_PUBLIC_URL}/projects`;
  document.location.href = loginUrl;
}

async function signOut(req: NextRequest, res: NextResponse) {
  const session = await getSession(req, res);
  Object.keys(session).map(key => session[key] = undefined);
  await session.save()
  return NextResponse.redirect( `${process.env.URL}/auth/signout`, { headers: res.headers });
}

type SessionUserType = {
  name?: string;
  role?: string;
}

async function fetchSessionUser() {
  try {
    let response = await fetch('/api/current-user', {
      headers: { 'Content-type': 'application/json' },
    })
    if (!response.ok) {
      throw new Error('Fetch failed')
    }
    let result = await response.json();
    return {
      name: result.name,
      role: result.role,
    }
  } catch(err) {
    console.log(err);
    return {};
  }
}

let defaultSession:SessionUserType = {};
let SessionContext = createContext(defaultSession);

export {
  authMiddleware,
  getSession,
  sessionOptions,
  signIn,
  signOut,
  clientSignIn,
  SessionContext,
  fetchSessionUser,
  type SessionUserType,
}

