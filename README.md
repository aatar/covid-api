[![❌](.resource/image/readme/header.svg)](https://github.com/aatar/covid-api)
[![❌](https://img.shields.io/badge/Node.js-v10.14.1-31a100.svg?logo=Node&logoColor=white&style=for-the-badge)](https://nodejs.org/)
[![❌](https://img.shields.io/badge/Release-v0.1.0-e91e62.svg?style=for-the-badge)](https://github.com/aatar/covid-api/releases)

# COVID-API

An API for querying SARS-CoV-2 cases in Argentina.

## Documentation

Complete.

## Requirements

You need the following:

* [Node.js v10.14.1](https://nodejs.org/) (it comes with NPM v6.4.1).
* [PostgreSQL v9.6](https://www.oracle.com/java/technologies/javase-downloads.html), or superior.

## Build

Run this in the root of the repository to build the project:

```bash
user@machine:path$ npm install
```

## Execution

Create an `.env` file in the root of the repository with the following parameters:

```bash
DB_HOST=<db-host>
DB_NAME=<production-db>
DB_NAME_DEV=<development-db>
DB_NAME_TEST=<testing-db>
DB_PASSWORD=<db-password>
DB_PORT=<db-port>
DB_USERNAME=<db-user>
NODE_ENV=<environment>
PORT=<server-port>
```

Where:

* `<db-host>`: the IP or URI of the database host (_e.g._, _localhost_).
* `<db-password>`: the password to access the database.
* `<db-port>`: the port to access the database (usually _5432_).
* `<db-user>`: the user to access the database.
* `<development-db>`: the name of the development's database.
* `<environment>`: one of `development`, `testing` or `production`.
* `<production-db>`: the name of the production' database.
* `<server-port>`: the port where to expose the server API of this project.
* `<testing-db>`: the name of the test's database.

Run this in the root of the repository to finally run the project:

```bash
user@machine:path$ npm run migrations
user@machine:path$ npm start
```

## Deploy

Run this to deploy the project over a production machine:

```bash
user@machine:path$ npm run migrations
user@machine:path$ node server.js
```

## Authors

* [Ariel Atar](https://github.com/aatar)
* [Agustín Golmar](https://github.com/agustin-golmar)
