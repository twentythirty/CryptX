let envPath = '.env'
require('dotenv').config({ path: envPath });//instatiate environment variables

CONFIG = {} //Make this global to use all over the application

CONFIG.app = process.env.APP || 'other';
CONFIG.port = process.env.PORT || '3000';

CONFIG.db_dialect = process.env.DB_DIALECT || 'postgres';
CONFIG.DATABASE_URL = process.env.DATABASE_URL
CONFIG.disclaimer = process.env.disclaimer || 'Parcel Pending API';

CONFIG.jwt_encryption = process.env.JWT_ENCRYPTION || 'jwt_please_change';
CONFIG.jwt_expiration = process.env.JWT_EXPIRATION || '10000';
