/*
 * Copyright (c) 2018. Brightley Developed -- www.brightleydeveloped.com
 */

require('dotenv').config();

const production = process.env.NODE_ENV === "production";

const config = {};
config.production = production;
config.database = {};
config.database.postgres = process.env.DATABASE_URL || "postgres://local:password@localhost:5432/local";
if(production) {
	config.database.postgres += "?ssl=true"
}
module.exports = config;
