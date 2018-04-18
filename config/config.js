let envPath = process.env.NODE_ENV === 'dev' ? '.env' : 'test.env';
require('dotenv').config({ path: envPath });//instatiate environment variables

CONFIG = {} //Make this global to use all over the application

CONFIG.app = process.env.APP || 'other';
CONFIG.port = process.env.PORT || '3000';

CONFIG.db_dialect = process.env.DB_DIALECT || 'postgres';
CONFIG.db_host = process.env.DB_HOST || 'localhost';
CONFIG.db_port = process.env.DB_PORT || '5432';
CONFIG.db_name = process.env.DB_NAME || 'pens_test';
CONFIG.db_user = process.env.DB_USER || 'anatolij';
CONFIG.db_password = process.env.DB_PASSWORD || '';
CONFIG.disclaimer = process.env.disclaimer || 'Parcel Pending API';

CONFIG.jwt_encryption = process.env.JWT_ENCRYPTION || 'jwt_please_change';
CONFIG.jwt_expiration = process.env.JWT_EXPIRATION || '10000';
