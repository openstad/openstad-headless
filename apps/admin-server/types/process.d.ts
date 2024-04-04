declare namespace NodeJS {
  export interface ProcessEnv {
    /**
     * The URL of the Admin portal application. Oauth callbacks will be sent to this url.
     * In development this is often http://localhost:31470
     */
    URL: string;
    /**
     * Secret used to encrypt session data on the server
     */
    COOKIE_SECRET: string;
    /**
     * Client ID for the Admin portal application
     */
    CLIENT_ID: string;
    /**
     * Client secret for the Admin portal application
     */
    CLIENT_SECRET: string;
    /**
     * Internal URL of the Openstad OAuth server. In development this is often http://localhost:31430.
     */
    OAUTH_URL_INTERNAL: string;
    /**
     * Public URL of the Openstad OAuth server. In development this is often http://localhost:31430.
     */
    OAUTH_URL: string;
    /**
     * The internal URL of the Openstad API server. In development this is often http://openstad-api-server:31410.
     */
    API_URL_INTERNAL: string;
    /**
     * The external URL of the Openstad API server. In development this is often http://localhost:31410.
     */
    API_URL: string;
    /**
     * A fixed key in the API server that can be used as an admin login
     */
    API_FIXED_AUTH_KEY: string;
  }
}
