## Setup

### Getting started

These instructions will help you setup the OpenStad servers.  
The are 3 different node servers working together. More elements will follow and then be added to these instructions.

Prerequisites:
- NodeJS 16+
- Access to a Mysql server

### 1. Checkout openstad-app git repo

Clone the repo:
```
git clone https://github.com/openstad/openstad-headless
```

And go to that directory and initialize:
```
cd openstad-headless
npm i
```

Note: in some environments running `npm i` requires `make` ofr another build command to compile the bcrypt libraries.

### 2. Create databases

If  your OpenStad database user has GRANT privileges you can skip this step; the setup script will create the databases for you.
But since this is usually a bad idea you may want to create the databases by hand.

In SQL:
```
CREATE DATABASE `openstad-api`;
CREATE DATABASE `openstad-oauth-server`;
```
To make these databases accessible by a user:
```
CREATE USER `USERNAME`@`%` IDENTIFIED BY 'PASSWORD';
GRANT ALL ON `openstad-api`.* TO `USERNAME`@`%`;
GRANT ALL ON `openstad-oauth-server`.* TO `USERNAME`@`%`;
```

### 3. Create an .env file
Create the `.env` file that contains the basic configuration. You will find a `.env.example` file in the root of the repo. Copy it and rename it to `.env` in the same folder.

Make sure the MySQL credentials are correct, using the username and password from the previous step.

Change value for `AUTH_FIRST_LOGIN_CODE`; you will use this code to login.

Outgoing email is used for login on sites and feedback to users. It can be circumvented, but only if you know what you are doing.

The rest of the defaults should suffice in most situations. More options are described in [this document](setup-options.md).

### 4. Run setup
Run the command
```
NODE_ENV=development npm run setup
```
This will create the necessary configuration files, install npm modules and initialize the databases.

### 5. Run the servers
The command
```
NODE_ENV=development npm run start
```
will start the servers.

#### What to expect
Three node servers should now be running.

In any setup you should be able to login with the `AUTH_FIRST_LOGIN_CODE` from the `.env` file. In a development environment additional users are available: `123` logs in an administrator, `456` a moderator and `789` an normal user.

You could try and use the servers with the description below, but preferably you now go to [step 6](#6-setup-a-reverse-proxy).

You can use your favorite http client to test the servers.
```
GET http://api.BASE_DOMAIN/api/project
Authorization: AUTH_FIRST_LOGIN_CODE
```
should give you an overview of existing projects.

```
GET http://api.BASE_DOMAIN/auth/project/1/login
```
should redirect to the auth server, and
```
GET http://auth.BASE_DOMAIN/auth/code/login?clientId=uniquecode
```
should return a HTML page with a login form

```
https://image.BASE_DOMAIN/image/forum.romanum.06.webp
```
should repond with an image of the Forum Romanum in Rome.

### 6. Setup a reverse proxy
To make the above a bit more usefull you may want to setup a reverse proxy server to make the sites and servers available.
If you the ran npm run setup command above a file nginx.config.example was created in your repo directory. Use this to setup your local nginx server by copying this file to the sites-available directory. Create a link in sites-enabled, and restart nginx.

You will probably need an entry in your /etc/hosts file:  
```
127.0.0.1 api.openstad.local auth.openstad.local image.openstad.local
```
Use the admin panel to create a new user and make that user administrator on the new site.

### Notes
- This setup is of course not secure. Remove the FORCE_HTTP param from the .env file and run npm run setup again. Then setup your proxy server to use https instead of http. If you already created sites then update the url for those sites.
- If a login attempt reults in 'Redirect host not allowed' you need to update the project config in the API:
```
PUT https://api.BASE_DOMAIN/api/project/1
Content-type: application/json
Authorization: AUTH_FIRST_LOGIN_CODE

{
  "config": {
    "allowedDomains": [
      "YOUR-CMS.BASE_DOMAIN"
    ]
  }
}
```
