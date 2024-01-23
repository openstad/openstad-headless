declare namespace NodeJS {
  export interface ProcessEnv {
    /**
     * The URL of the Admin portal application. Oauth callbacks will be sent to this url.
     * In development this is often http://localhost:3000
     */
    NEXTAUTH_URL: string;
    /**
     * Secret used to encrypt session data on the server.
     */
    NEXTAUTH_SECRET: string;
    /**
     * Client ID for the Admin portal application
     */
    CLIENT_ID: string;
    /**
     * Client secret for the Admin portal application
     */
    CLIENT_SECRET: string;
    /**
     * Internal URL of the Openstad OAuth server. In development this is often http://localhost:4000.
     */
    OAUTH_URL_INTERNAL: string;
    /**
     * Public URL of the Openstad OAuth server. In development this is often http://localhost:4000.
     */
    OAUTH_URL: string;
    /**
     * The internal URL of the Openstad API server. In development this is often http://openstad-api-server:31430.
     */
    API_URL_INTERNAL: string;
    /**
     * The external URL of the Openstad API server. In development this is often http://localhost:31430.
     */
    API_URL: string;
  }
}
