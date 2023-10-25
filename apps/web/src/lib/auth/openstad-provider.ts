import type { OAuthConfig, OAuthUserConfig } from "next-auth/providers/oauth";

export interface OpenstadProfile extends Record<string, any> {
  user_id: string;
  role: string | null;
  name: string | null;
  email: string | null;
  phoneNumber: string | null;
  hashedPhoneNumber: string | null;
  phoneNumberConfirmed: string | boolean | null;
  streetName: string | null;
  houseNumber: string | null;
  suffix: string | null;
  postcode: string | null;
  city: string | null;
  scope: string | null;
}

export default function Openstad<P extends OpenstadProfile>(
  options: {
    issuerExternalUrl: string;
  } & OAuthUserConfig<P>
): OAuthConfig<P> {
  return {
    id: "openstad",
    name: "Openstad",
    type: "oauth",
    authorization: `${options.issuerExternalUrl}/dialog/authorize`,
    token: `${options.issuer}/oauth/token`,
    userinfo: {
      url: `${options.issuer}/api/userinfo`,
      params: {
        client_id: options.clientId,
      },
    },
    client: {
      client_id: options.clientId,
      client_secret: options.clientSecret,
    },
    profile(profile) {
      return {
        id: profile.user_id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        postcode: profile.postcode,
        phoneNumber: profile.phoneNumber,
        phoneNumberConfirmed: profile.phoneNumber,
        hashedPhoneNumber: profile.hashedPhoneNumber,
        scope: profile.scope,
      };
    },
  };
}
