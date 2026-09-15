'use client';

import { useSession, signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import UserBar from './UserBar';
import NoTokensBanner from './NoTokensBanner';

/** Routes reachable without a session — everything else redirects to sign-in. */
const PUBLIC_ROUTES = ['/login'];

/**
 * Client-side shell wrapping every page.
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const { data: session, status, update } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const isPublic = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    if (status === 'unauthenticated' && !isPublic) {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [status, isPublic, pathname, router]);

  if (isPublic) {
    return <>{children}</>;
  }

  if (status === 'loading') {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center" suppressHydrationWarning>
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" suppressHydrationWarning />
      </main>
    );
  }

  if (status === 'unauthenticated' || !session?.user?.email) {
    // The redirect above is in flight; render nothing rather than a flash of
    // protected chrome.
    return <main className="min-h-screen bg-background" />;
  }

  const tokens = session.tokens ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pt-4 sm:pt-6">
        <UserBar
          user={{
            email: session.user.email,
            name: session.user.name,
            image: session.user.image,
          }}
          tokens={tokens}
          onSignOut={() => signOut({ callbackUrl: '/login' })}
        />
        {tokens <= 0 && <NoTokensBanner />}
      </div>
      {children}
    </div>
  );
}
