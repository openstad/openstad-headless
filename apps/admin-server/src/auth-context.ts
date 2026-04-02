import { createContext } from 'react';

type SessionUserType = {
  id?: number;
  name?: string;
  role?: string;
  jwt?: string;
};

async function fetchSessionUser() {
  try {
    let response = await fetch('/api/current-user', {
      headers: { 'Content-type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error('Fetch failed');
    }
    let result = await response.json();
    return {
      id: result.id,
      name: result.name,
      role: result.role,
      jwt: result.jwt,
    };
  } catch (err) {
    console.log(err);
    return {};
  }
}

function clientSignIn() {
  let loginUrl = `/signin`;
  document.location.href = loginUrl;
}

let defaultSession: SessionUserType = {};
let SessionContext = createContext(defaultSession);

export { SessionContext, fetchSessionUser, clientSignIn, type SessionUserType };
