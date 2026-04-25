import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key to check settings in middleware (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /admin routes except /admin/login
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const adminSession = request.cookies.get('admin_session');

    if (!adminSession || adminSession.value !== 'true') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // 1. Skip check for maintenance page, admin routes, and static assets
  if (
    pathname.startsWith('/maintenance') || 
    pathname.startsWith('/admin') || 
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.') // for static files like logo.png
  ) {
    return NextResponse.next();
  }

  // 2. Fetch Maintenance Mode Status (Cached in Vercel Edge for performance if possible, but standard fetch for now)
  try {
    const { data: setting } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('key', 'maintenance_mode')
      .single();

    if (setting?.value === 'true') {
      // Allow admins to see the site even in maintenance mode
      const adminSession = request.cookies.get('admin_session');
      if (adminSession?.value !== 'true') {
        return NextResponse.redirect(new URL('/maintenance', request.url));
      }
    }
  } catch (error) {
    console.error('Middleware: Error checking maintenance mode', error);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
