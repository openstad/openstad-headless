import { NextResponse, type NextRequest } from 'next/server';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getIronSession } from 'iron-session';
import hasRole from './lib/hasRole';
import { Role } from './lib/roles';
import { createContext } from 'react';

interface OpenstadProfile extends Record<string, any> {
  id: number;
  role: Role;
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
  role: Role;
  jwt: string;
}

interface SessionData {
  [key:string]: string | number | userType | undefined,
  user?: userType,
}

const sessionOptions = {
  password: process.env.COOKIE_SECRET as string,
  cookieName: 'openstad-session',
  // By setting ttl to 0 iron-session will create a cookie with the maximum age
  // Where the cookie will expire 60 seconds before the session does.
  // Source: https://github.com/vvo/iron-session?tab=readme-ov-file#examples
  ttl: 0,
  cookieOptions: {
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  },
};

async function getSession(req: NextRequest | NextApiRequest, res: NextResponse | NextApiResponse) {
  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  return session;
}

async function authMiddleware(req: NextRequest, res: NextResponse) {

  // projectId
  let targetProjectId = 1;
  let match = req.nextUrl.pathname.match(/^\/projects\/(\d+)/)
  if (match) targetProjectId = parseInt(match[1]);
  match = req.nextUrl.pathname.match(/^\/api\/openstad\/(?:api|auth)\/project\/(\d+)/)
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

  if (!(req.nextUrl.pathname.startsWith('/_'))) { // not on internal urls

    let forceNewLogin = false;

    // check login token
    if (jwt) {
      try {
        let url = `${process.env.API_URL_INTERNAL || process.env.API_URL}/auth/project/${targetProjectId}/me`
        let response = await fetch(url, {
          headers: { Authorization: `Bearer ${jwt}` },
        })
        if (!response.ok) throw new Error('TokenValidationFailed')
        let result:OpenstadProfile = await response.json();
        if (!result.id) throw 'no user'
        if ( !( req.nextUrl.pathname.match(/^\/(?:projects)?\/?$/) && hasRole(result, 'member') ) // project overview is available for members; anything else requires
             && result.role != 'superuser'
             && result.role != 'admin' ) {
          forceNewLogin = true;
          throw 'no user';
        }
        session.user = {
          id: result.id,
          name: result.name,
          role: result.role,
          jwt: jwt as string,
        };
      } catch(err) {
        jwt = '';
        session.user = undefined;
      } finally {
        await session.save()
      }
    }

    // login if token not found
    if (!jwt && !req.nextUrl.pathname.startsWith('/api/openstad')) {
       // api routes require user but will nog login
      return signIn(req, res, targetProjectId, forceNewLogin)
    }

  }

  // api requests: add jwt
  if (jwt && req.nextUrl.pathname.startsWith('/api/openstad')) {
    let path = req.nextUrl.pathname.replace('/api/openstad', '');
    let query = searchParams ? '?' + searchParams.toString() : '';
    query = query.replace(/openstadlogintoken=(?:.(?!&|$))+./, '');
    const rewrittenUrl = `${process.env.API_URL_INTERNAL || process.env.API_URL}${path}${query}`;
    return NextResponse.rewrite(rewrittenUrl, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
  }

    // email assets requests: add jwt
    if (jwt && req.nextUrl.pathname.startsWith('/email-assets')) {
      let path = req.nextUrl.pathname.replace('/email-assets', '');
      let query = searchParams ? '?' + searchParams.toString() : '';
      query = query.replace(/openstadlogintoken=(?:.(?!&|$))+./, '');
      const rewrittenUrl = `${process.env.EMAIL_ASSETS_URL}${path}${query}`;
      return NextResponse.rewrite(rewrittenUrl, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
    }

  return res;

}

async function signIn(req: NextRequest, res: NextResponse, projectId:number = 1, forceNewLogin?: boolean) {
  if (forceNewLogin) {
    const session = await getSession(req, res);
    session.destroy()
  }
  let path = req.nextUrl.pathname.replace('/api/openstad', '');
  if (path == '/') path = '/projects';
  let redirectUri = `${process.env.URL}${path}?openstadlogintoken=[[jwt]]`;
  let loginUrl = `${process.env.API_URL}/auth/project/${projectId}/login?useAuth=default&redirectUri=${redirectUri}${ forceNewLogin ? '&forceNewLogin=1' : '' }`;
  return NextResponse.redirect(loginUrl, { headers: res.headers });
}

function clientSignIn() {
  let loginUrl = `/signin`;
  document.location.href = loginUrl;
}

type SessionUserType = {
  id?: number;
  name?: string;
  role?: string;
  jwt?: string;
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
      id: result.id,
      name: result.name,
      role: result.role,
      jwt: result.jwt,
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
  clientSignIn,
  SessionContext,
  fetchSessionUser,
  type SessionUserType,
}
