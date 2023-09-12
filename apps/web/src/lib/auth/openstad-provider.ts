import type { OAuthConfig, OAuthUserConfig } from "next-auth/providers/oauth";

export interface OpenstadProfile extends Record<string, any> {
  user_id: string;
  email: string | null;
  role: string;
  firstName: string | null;
  lastName: string | null;
  postcode: string | null;
  phoneNumber: string | null;
  hashedPhoneNumber: string | null;
  extraData: Record<string, any>;
  scope: string;
}

export default function Openstad<P extends OpenstadProfile>(
  options: OAuthUserConfig<P>
): OAuthConfig<P> {
  return {
    id: "openstad",
    name: "Openstad",
    type: "oauth",
    authorization: `${options.issuer}/dialog/authorize`,
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
        name: profile.firstName + " " + profile.lastName,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        role: profile.role,
        postcode: profile.postcode,
        phoneNumber: profile.phoneNumber,
        hashedPhoneNumber: profile.hashedPhoneNumber,
        extraData: profile.extraData,
        scope: profile.scope,
      };
    },
  };
}
