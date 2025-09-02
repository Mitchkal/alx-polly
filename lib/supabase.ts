import { createServerClient, CookieOptions } from '@supabase/ssr';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { createClient as createLegacyClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export function createServerSideClient(cookieStore: ReadonlyRequestCookies) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: (name: string, value: string, options: CookieOptions) => {
          try {
            cookieStore.set(name, value, options);
          } catch (error) {
            // The `cookies().set()` method can only be called in a Server Component or Route Handler.
            // For more info: https://nextjs.org/docs/app/api-reference/functions/cookies#cookiessetname-value-options
          }
        },
        remove: (name: string, options: CookieOptions) => {
          try {
            cookieStore.set(name, '', options);
          } catch (error) {
            // The `cookies().set()` method can only be called in a Server Component or Route Handler.
            // For more info: https://nextjs.org/docs/app/api-reference/functions/cookies#cookiessetname-value-options
          }
        },
      },
    }
  );
}

// export function createClientBrowser() {
//   return createLegacyClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
//   );
// }