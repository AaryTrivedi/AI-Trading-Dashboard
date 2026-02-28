import { auth as jwtAuth } from 'express-oauth2-jwt-bearer';
import { env } from './env.js';

/**
 * Auth0 JWT validation middleware (RS256).
 * Use on routes that require a valid Auth0 access token.
 * On success, req.auth is set (header, payload, token); use setUserIdMiddleware to set req.userId from payload.sub.
 */
export const auth0Jwt = jwtAuth({
  issuerBaseURL: env.AUTH0_ISSUER_BASE_URL.replace(/\/$/, ''),
  audience: env.AUTH0_AUDIENCE,
  tokenSigningAlg: env.AUTH0_TOKEN_SIGNING_ALG,
});
