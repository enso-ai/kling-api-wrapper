import { NextResponse } from 'next/server';

// extract google iap header
export async function GET(req) {
    try {
        if (process.env.NODE_ENV === 'development') {
            // in dev mode, we don't have the special google header
            return NextResponse.json({
                email: 'developer@localhost.com',
                name: 'developer',
                domain: 'localhost.com'
            })
        }

        // Extract user info from IAP headers
        const rawEmail = req.headers.get('x-goog-authenticated-user-email');
        const userEmail = rawEmail ? rawEmail.split(':')[1] : null;

        if (!userEmail) {
            return NextResponse.json(
                { error: 'No user information found' },
                { status: 401 }
            );
        }

        // Return user info
        return NextResponse.json({
            email: userEmail,
            name: userEmail.split('@')[0], // Extract name from email
            domain: userEmail.split('@')[1]
        });
    } catch (error) {
        return NextResponse.json(
            { error: error.message || 'Failed to get user info' },
            { status: 500 }
        );
    }
}