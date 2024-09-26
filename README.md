# Encrypted Chat

## Requirements
- Node.js v20.9 recommended (18.19 minimum)
- PostgreSQL v16


## Install

### Create DB
- Access PostgreSQL: `psql -U postgres`
- Create a New Database: `CREATE DATABASE echat;`
- Create a New User: `CREATE USER echatuser WITH PASSWORD 'secret_db_password';`
- Grant Privileges to the User: `GRANT ALL PRIVILEGES ON DATABASE echat TO echatuser;`
- Exit `\q`
- Access created Database `psql -U postgres -d echat`
- Grant Privileges to the User for the schema: `GRANT all ON SCHEMA public TO echatuser;`

### Install dependencies
- run `npm i` in `front-end` and `back-end` folders

### Set up environment variables
- copy `.env.template` in `back-end` folder, rename it to `.env`
- replace DB credentials with proper values
- replace random secrets (salts and peppers) with unique random values


## Start the app

- run `npm run start` in `front-end` folder
- run `npm run dev` in `back-end` folder
- on the first run DB migrations will be applied, dummy users created (see `back-end/src/migrations/dummy-users.migration.ts`):

UserName | Password
--- | ---
Alfa | Zulu
Bravo | X-ray
Charlie | Zulu
Delta | Whiskey


## Concepts

### Credentials

- all secret values and DB credentials are stored in environment variables (see `.env`)

### User passwords
- passwords are stored as hashes
- password hashing is performed by bcrypt
- secret `pepper` is used for all passwords. Pepper is stored in environment variable
- random `salt` is used for passwords. Salting is performed by bcrypt. Salt is stored as a part of password hash

### Authorization
- If RSA privateKey is not present in the storage, an RSA key pair is generated on client side. Public key is sent to server and saved to DB
- On successful login `privateKey` is stored on client (if was generated)
- Server issues an JWT token with limited lifetime. Client stores the token for future use
- On page refresh user will be signed out if: JWT token is not present, privateKey is not present or JWT token is expired
