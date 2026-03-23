import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/request', '/pending'];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          request.cookies.set({ name, value });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: Record<string, unknown>) {
          request.cookies.set({ name, value: '' });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  // 로그인 안 한 사용자 → 공개 경로만 허용
  if (!user && !isPublicPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // 로그인한 사용자
  if (user) {
    const { data: employee } = await supabase
      .from('employees')
      .select('role')
      .eq('auth_id', user.id)
      .single();

    // employees 레코드 없음 → /pending (대기)
    if (!employee?.role) {
      if (!isPublicPath(pathname) && pathname !== '/pending') {
        const url = request.nextUrl.clone();
        url.pathname = '/pending';
        return NextResponse.redirect(url);
      }
      return response;
    }

    // /login이나 /pending 접근 → 역할별 대시보드로
    if (pathname === '/login' || pathname === '/pending') {
      const url = request.nextUrl.clone();
      url.pathname = `/${employee.role}/dashboard`;
      return NextResponse.redirect(url);
    }

    // 역할별 접근 제어: 자기 역할 경로만 허용
    const rolePrefix = `/${employee.role}`;
    const protectedPrefixes = ['/office', '/field', '/admin'];
    const isProtectedPath = protectedPrefixes.some((p) => pathname.startsWith(p));

    if (isProtectedPath) {
      const isOwnPath = pathname.startsWith(rolePrefix);
      // admin은 모든 경로 접근 가능
      const isAdmin = employee.role === 'admin';

      if (!isOwnPath && !isAdmin) {
        const url = request.nextUrl.clone();
        url.pathname = `/${employee.role}/dashboard`;
        return NextResponse.redirect(url);
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|icons|sw.js|api).*)',
  ],
};
