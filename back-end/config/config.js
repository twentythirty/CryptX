let envPath = '.env'
require('dotenv').config({ path: envPath });//instatiate environment variables

CONFIG = {} //Make this global to use all over the application

CONFIG.app = process.env.APP || 'other';
CONFIG.port = process.env.PORT || '3000';

CONFIG.EMAIL_FROM = process.env.EMAIL_FROM || 'system@cryptx.io';

CONFIG.db_dialect = process.env.DB_DIALECT || 'postgres';
CONFIG.DATABASE_URL = process.env.DATABASE_URL
CONFIG.disclaimer = process.env.disclaimer || 'Parcel Pending API';
CONFIG.logger_format = process.env.LOGGER_FORMAT || ':remote-addr [:date] :method :url :status :response-time ms - :res[content-length]';

CONFIG.jwt_use_srt = (process.env.JWT_USE_SRT == 'true') || false;
CONFIG.jwt_encryption = process.env.JWT_ENCRYPTION;
CONFIG.jwt_expiration = process.env.JWT_EXPIRATION;
