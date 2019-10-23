# GOV.UK PaaS Deployments

## Overview

The purpose of this API is essentially to handle user data around the
deployments on PaaS Admin through out to their environments.

## Usage

```
npm run build              # compile the build to ./dist
npm run test               # run all the tests and linters
npm run lint               # run code linters
npm run fix                # try to autofix problems with js/css
npm run start              # rebuild and start the server
```

## Requirements

* [Node.js](https://nodejs.org/en/) version `~ 10` LTS - consider using
  [NVM](https://github.com/creationix/nvm) (`nvm use` in this repo) for version
management
* [npm](https://www.npmjs.com/) versions `~ 6`
* [postgres](https://www.postgresql.org/) versions `~> 9`

## Prerequisites

If you are planning to run this locally, you will likely need to have a
`postgres` database ready.

This can be achieved with:

```sh
docker run --rm -it -p 5432:5432 -d postgres --name paas-deployments
```

This will spin up `postgres` instance. You then should be able to get into the
instance and setup your database.

Run the following to log into the instance:
```sh
psql -h 0.0.0.0 -p 5432 -U postgres
```

Once in the instance, run following to create a database:

```sql
CREATE DATABASE deployments;
```

You then can quit the client (`\q`) and close that connection. It will keep
postgres running in the background.

If you happen to want to wipe the DB or not run it again, run the following
command:

```sh
docker kill paas-deployments
```

## Getting Started

Clone this repository and then use `npm` to install the project dependencies:

```sh
npm install
```

Execute the unit tests to ensure everything looks good:

```sh
npm run test
```

Start the server pointing at stubbed APIs

```sh
export DATABASE_URL=postgres://postgres@localhost:5432/deployments

npm run start
```

You can then interact with the API with the use of `curl` or [`Postman`](https://www.getpostman.com/).
