[![❌](.resource/image/readme/header.svg)](https://github.com/aatar/covid-api)
[![❌](https://img.shields.io/badge/Node.js-v10.14.1-31a100.svg?logo=Node&logoColor=white&style=for-the-badge)](https://nodejs.org/)
[![❌](https://img.shields.io/badge/Release-v0.1.0-e91e62.svg?style=for-the-badge)](https://github.com/aatar/covid-api/releases)

# COVID-API

An API for querying SARS-CoV-2 cases in Argentina.

This API is an improvement of [another COVID-19 API](https://covid19api.it.itba.edu.ar/api/v1/swagger/). It has the same endpoints, but works over a database on-disk instead of memory, so it supports larger datasets (of several _GiB_).

## Documentation

The format and the dataset itself is obtained from the [National Directorate of Epidemiology and Analysis of Health Situation](http://datos.salud.gob.ar/dataset/covid-19-casos-registrados-en-la-republica-argentina). It updates every day at _20:00_ (UTC-3). You can change the source of the dataset, however.

## Requirements

You need the following:

* [Node.js v10.14.1](https://nodejs.org/) (it comes with NPM v6.4.1).
* [PostgreSQL v9.6](https://www.postgresql.org/), or superior.

## Build

Run this in the root of the repository to build the project:

```bash
user@machine:path$ npm install
```

## Execution

Create an `.env` file in the root of the repository with the following parameters (we show here the default values for everyone):

```bash
# Environment:
NODE_ENV=development

# Server:
HOST=localhost
PORT=8080

# Database:
DB_HOST=localhost
DB_NAME=postgres
DB_NAME_DEV=postgres
DB_NAME_TEST=postgres
DB_PASSWORD=postgres
DB_PORT=5432
DB_USERNAME=postgres

# Application:
CACHE_SIZE=128
COVID_DATASET=http://localhost:8081/dataset.csv
CRON_SCHEMA=0 0 21 * * *
FIRE_ON_DEPLOY=true
LOCAL_DATASET=dataset_.csv
RETRY_DOWNLOAD=600
SHRINKING_FACTOR=0.5
UPDATE_TARGET=100000
UPLOAD_THRESHOLD=8192
```

Where:

| Parameter          | Description                                                                                                         |
|:------------------:|---------------------------------------------------------------------------------------------------------------------|
| `NODE_ENV`         | One of `development`, `testing` or `production`. |
| `HOST`             | The interface where the server will listen (_e.g._, _0.0.0.0_). |
| `PORT`             | The port where to expose the server API of this project. |
| `DB_HOST`          | The IP or URI of the database host (_e.g._, _localhost_). |
| `DB_NAME_DEV`      | The name of the development's database. |
| `DB_NAME_TEST`     | The name of the test's database. |
| `DB_NAME`          | The name of the production' database. |
| `DB_PASSWORD`      | The password to access the database. |
| `DB_PORT`          | The port to access the database (usually _5432_ for PostgreSQL). |
| `DB_USERNAME`      | The user to access the database. |
| `CACHE_SIZE`       | The maximum size of the in-memory deterministic cache (in MiB). |
| `COVID_DATASET`    | The URL where to get the SARS-CoV-2 dataset (in _CSV_ format). Supports HTTP and HTTPS protocols. |
| `CRON_SCHEMA`      | The cron-schema of the scheduler. Set by default every day at _21:00_ (_1_ hour after official dataset update). |
| `FIRE_ON_DEPLOY`   | If true, when the server deploys for first time or during a restart, it will download and store the entire dataset. |
| `LOCAL_DATASET`    | The name of the file where to store the downloaded dataset (relative to the root of the project). |
| `RETRY_DOWNLOAD`   | A time in seconds the server should wait before retry another download-and-store of the dataset. |
| `SHRINKING_FACTOR` | Specifies the minimum ratio to delete in case of a fully loaded cache. |
| `UPLOAD_TARGET`    | How many records should be stored in database before logging the current count during a database update. |
| `UPLOAD_THRESHOLD` | How many records will transfer the application to the database in a bulk _upsert_ procedure. |

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
