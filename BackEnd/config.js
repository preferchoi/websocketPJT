const path = require('path');

const DEFAULT_ALLOWED_ORIGINS = ['http://localhost:5173'];
const allowedOriginEnv = process.env.ALLOWED_ORIGINS || process.env.CORS_ORIGIN || '';
const configuredOrigins = allowedOriginEnv
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const CORS_ORIGINS = configuredOrigins.length > 0 ? configuredOrigins : DEFAULT_ALLOWED_ORIGINS;

module.exports = {
    PORT: Number(process.env.PORT) || 8000,
    CORS_ORIGINS,
    MAX_MESSAGE_LENGTH: 500,
    MAX_IMAGE_BYTES: 5 * 1024 * 1024,
    IMAGE_RESIZE_WIDTH: 200,
    STATE_PATH: process.env.STATE_PATH || path.join(__dirname, 'state.json'),
    DEFAULT_ROOM_LIMIT: 8,
    MIN_ROOM_LIMIT: 1,
    MAX_ROOM_LIMIT: 100,
    SAVE_STATE_DEBOUNCE_MS: 250,
    MAX_USERS_PER_NAMESPACE: 100,
    ROOM_NAME_PATTERN: /^[A-Za-z0-9가-힣_-]+$/,
    ROOM_NAME_MIN_LENGTH: 1,
    ROOM_NAME_MAX_LENGTH: 20,
};
