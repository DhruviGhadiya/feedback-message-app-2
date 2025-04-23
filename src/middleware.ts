import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
export { default } from 'next-auth/middleware';

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/sign-in',
        '/sign-up',
        '/',
        '/verify/:path*',
    ],
};

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request });
    const url = request.nextUrl;

    // If the user is authenticated and tries to access auth pages, redirect to dashboard
    if (
        token &&
        (
            url.pathname === '/sign-in' ||
            url.pathname === '/sign-up' ||
            url.pathname === '/verify'  ||
            url.pathname === '/'
        )
    ) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // If the user is not authenticated and tries to access protected routes, redirect to sign-in
    if (
        !token &&
        url.pathname.startsWith('/dashboard')
    ) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    // Allow the request
    return NextResponse.next();
}
