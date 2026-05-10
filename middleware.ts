import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except for static files, api, etc.
  matcher: [
    // Match all pathnames that don't start with:
    // - _next (Next.js internals)
    // - api (API routes)
    // - static files (images, fonts, etc.)
    '/((?!_next|api|.*\\..*).*)'
  ]
};
