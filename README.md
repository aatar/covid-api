[![❌](.resource/image/readme/header.svg)](https://github.com/aatar/covid-api)
[![❌](https://img.shields.io/badge/Node.js-v10.14.1-31a100.svg?logo=Node&logoColor=white&style=for-the-badge)](https://nodejs.org/)
[![❌](https://img.shields.io/badge/Release-v0.3.0-e91e62.svg?style=for-the-badge)](https://github.com/aatar/covid-api/releases)

# COVID-API

An API for querying SARS-CoV-2 cases in Argentina.

This API is an improvement of [another COVID-19 API](https://covid19api.it.itba.edu.ar/api/v1/swagger/). It has the same endpoints, but works over a database on-disk instead of memory, so it supports larger datasets (of several _GiB_). Additionally, we provide a customizable cache for accelerating queries, without the need to access the database.

## Documentation

The format and the dataset itself is obtained from the [National Directorate of Epidemiology and Analysis of Health Situation](http://datos.salud.gob.ar/dataset/covid-19-casos-registrados-en-la-republica-argentina). It updates every day at _00:00_ (UTC-3). You can change the source of the dataset, however.

After executing the project, visit the `/api/v0.3.0/swagger` endpoint to access the _Swagger UI_. It uses [OpenAPI v3.0.3](https://swagger.io/specification/) specification to show the available endpoints.

## Requirements

You need the following:

* [Node.js v10.14.1](https://nodejs.org/) (it comes with NPM v6.4.1).
* [OpenSSL v1.1.1i](https://openssl.org/), or superior.
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
PORT=8443
CERTIFICATE=certificate.pem
PRIVATE_KEY=private-key.pem
PRIVATE_KEY_PASSPHRASE=private-key-passphrase
USE_TLS=true

# Database:
DB_HOST=localhost
DB_NAME=postgres
DB_NAME_DEV=postgres
DB_NAME_TEST=postgres
DB_PASSWORD=postgres
DB_PORT=5432
DB_USERNAME=postgres

# Application:
CACHE_COOLDOWN=10
CACHE_SIZE=128
COVID_DATASET=http://localhost:8081/dataset.csv
CRON_SCHEMA=0 0 0 * * *
FIRE_ON_DEPLOY=true
LOCAL_DATASET=dataset_.csv
MAXIMUM_CACHEABLE_SIZE=32
RETRY_DOWNLOAD=600
SHRINKING_FACTOR=0.5
UPDATE_TARGET=100000
UPLOAD_THRESHOLD=8192
USE_FAST_STORE=true
UNZIPPED_DATASET=Covid19Casos.csv
```

Where:

| Parameter                | Description                                                                                                         |
|:------------------------:|---------------------------------------------------------------------------------------------------------------------|
| `NODE_ENV`               | One of `development`, `testing` or `production`. |
| `HOST`                   | The interface where the server will listen (_e.g._, _0.0.0.0_). |
| `PORT`                   | The port where to expose the server API of this project. |
| `CERTIFICATE`            | The file that contains a valid certificate, or a self-signed one (in PEM format). |
| `PRIVATE_KEY`            | The file that contains the private-key associated with the certificate (in PEM format). |
| `PRIVATE_KEY_PASSPHRASE` | The file that contains the passphrase of the private-key. |
| `USE_TLS`                | A flag to indicate the use of a secure transport protocol (use TLS by default). |
| `DB_HOST`                | The IP or URI of the database host (_e.g._, _localhost_). |
| `DB_NAME_DEV`            | The name of the development's database. |
| `DB_NAME_TEST`           | The name of the test's database. |
| `DB_NAME`                | The name of the production' database. |
| `DB_PASSWORD`            | The password to access the database. |
| `DB_PORT`                | The port to access the database (usually _5432_ for PostgreSQL). |
| `DB_USERNAME`            | The user to access the database. |
| `CACHE_COOLDOWN`         | The time in seconds to wait between the disabled of cache and his invalidation, prior to a database update. |
| `CACHE_SIZE`             | The maximum size of the in-memory deterministic cache (in MiB). |
| `COVID_DATASET`          | The URL where to get the SARS-CoV-2 dataset (in _CSV_ format). Supports HTTP and HTTPS protocols. |
| `CRON_SCHEMA`            | The cron-schema of the scheduler. Set by default every day at _21:00_ (_1_ hour after official dataset update). |
| `FIRE_ON_DEPLOY`         | If true, when the server deploys for first time or during a restart, it will download and store the entire dataset. |
| `LOCAL_DATASET`          | The name of the file where to store the downloaded dataset (relative to the root of the project). |
| `MAXIMUM_CACHEABLE_SIZE` | If an object is heavier in MiB than this value, it never would be cached. |
| `RETRY_DOWNLOAD`         | A time in seconds the server should wait before retry another download-and-store of the dataset. |
| `SHRINKING_FACTOR`       | Specifies the minimum ratio to delete in case of a fully loaded cache. |
| `UPLOAD_TARGET`          | How many records should be stored in database before logging the current count during a database update. |
| `UPLOAD_THRESHOLD`       | How many records will transfer the application to the database in a bulk _upsert_ procedure. |
| `USE_FAST_STORE`         | Uses a fast method to update the entire database, but it requires a PostgreSQL system. |
| `UNZIPPED_DATASET`       | Indicates the name of the file to store when the dataset comes in ZIP format, and needs and extraction process. |

Because this may runs over TLS (Transport Layer Security), you need a private-key and a self-signed certificate (or a valid certificate chain) to execute. With OpenSSL, you can create boths. Run this commands in order in the root of the repository:

```bash
user@machine:path$ openssl rand -out private-key-passphrase -base64 48
user@machine:path$ openssl ecparam -genkey -name secp384r1 -outform PEM -out private-key_.pem -conv_form uncompressed -param_enc named_curve -check -noout
user@machine:path$ openssl ec -inform PEM -outform PEM -in private-key_.pem -out private-key.pem -AES-256-CBC -passout stdin -conv_form uncompressed -param_enc named_curve -check < private-key-passphrase
user@machine:path$ rm private-key_.pem
user@machine:path$ openssl req -config .resource/openssl/1.1.1i/root -x509 -keyform PEM -inform PEM -outform PEM -passin stdin -key private-key.pem -out certificate.pem -sha512 -days 3650 -utf8 -verify -verbose -addext "subjectAltName=critical,DNS:covid-api.itba.edu.ar,email:covid-api@itba.edu.ar" < private-key-passphrase
user@machine:path$ openssl x509 -inform PEM -in certificate.pem -noout -text
```

With this commands you get a `certificate.pem`, a `private-key.pem` and a `private-key-passphrase` file in the root of the project. How you may see in this commands, the private-key is an elliptic curve `secp384r1` protected with AES-256 in CBC mode. The passphrase is just _48_ bytes of Base-64 encoded random data and the certificate is of type _X.509 v3_ with _10 years_ of validity, a SHA-512 digest and a proper _Subject Alternative Name (SAN)_, that obviously you can modify to your needs. The last command just prints-out the certificate in a human-readable form.

Its not required, but you can modify the `.resource/openssl/1.1.1i/root` file, for example, to change the _Distinguished Name (DN)_ of the root certificate.

Be aware that, because of the SAN, you may need to have a valid domain name or an static entry in the `/etc/hosts` file (in _Windows_, the same file can be finded at `C:\Windows\System32\drivers\etc\hosts`).

If you access an endpoint you can expect a failure in the certificate chain, and that's fine: you need to add the self-signed certificate to your computer's __trust-store__. To do this, you must check the documentation of your OS.

Finnaly, run this in the root of the repository to run the project:

```bash
user@machine:path$ npm run migrations
user@machine:path$ npm start
```

If you need to access the app externally and you don't want to deploy on a real server, you can configure a _port-forwarding_ on your router. It should have:

* A `<host:port>` pair with the values of your local application (_e.g._, _192.168.0.7:8443_).
* A `<0.0.0.0:port>` pair with a public port and an all-zeros IP (_e.g._, _0.0.0.0:443_).
* An indication that the forwarding is for `TCP` protocol (instead of UDP).

Then, to find your public IP, you can go to [ipinfo.io](https://ipinfo.io/what-is-my-ip).

## Deploy

Run this to deploy the project over a production machine:

```bash
user@machine:path$ npm run migrations
user@machine:path$ node server.js
```

## Authors

* [Ariel Atar](https://github.com/aatar)
* [Agustín Golmar](https://github.com/agustin-golmar)
