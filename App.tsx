import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Dashboard } from './components/Dashboard';
import { PrivacyPolicy } from './pages/privacy';
import { TermsAndConditions } from './pages/terms';
import { CookiesPolicy } from './pages/cookies';
import { CookieBanner } from './components/CookieBanner';

type RouteKey = 'dashboard' | 'privacy' | 'terms' | 'cookies';

function getRouteFromLocation(): RouteKey {
  if (typeof window === 'undefined') return 'dashboard';
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();

  if (
    path.startsWith('/privacy') ||
    path.startsWith('/privacy-policy') ||
    hash.includes('privacy')
  ) {
    return 'privacy';
  }

  if (
    path.startsWith('/terms') ||
    path.startsWith('/terms-and-conditions') ||
    hash.includes('terms')
  ) {
    return 'terms';
  }

  if (
    path.startsWith('/cookies') ||
    path.startsWith('/cookie-policy') ||
    path.startsWith('/cookies-policy') ||
    hash.includes('cookies')
  ) {
    return 'cookies';
  }

  return 'dashboard';
}

function App() {
  const [currentRoute, setCurrentRoute] = useState<RouteKey>(getRouteFromLocation);

  useEffect(() => {
    const cleanUrl = () => {
      if (typeof window === 'undefined') return;
      const { pathname, hash } = window.location;

      // Do not strip while Supabase is actively extracting the access_token
      if (hash.includes('access_token')) {
        return;
      }

      // If a lingering hash exists (e.g. '#', '#/', '#/transactions'), strip it
      if (hash) {
        const targetPath = pathname === '/' ? '/dashboard' : pathname;
        window.history.replaceState(null, '', targetPath);
      } else if (pathname === '/') {
        window.history.replaceState(null, '', '/dashboard');
      }
    };

    // 1. Initial attempt on load
    cleanUrl();

    // 2. If OAuth token was in the hash, poll every 80ms until Supabase consumes it, then strip
    const tokenCheckInterval = setInterval(() => {
      if (!window.location.hash.includes('access_token')) {
        cleanUrl();
        setCurrentRoute(getRouteFromLocation());
        clearInterval(tokenCheckInterval);
      }
    }, 80);

    const safetyTimeout = setTimeout(() => {
      clearInterval(tokenCheckInterval);
    }, 4000);

    // 3. Listen to Supabase auth state transitions (fires when Google OAuth session completes)
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        setTimeout(cleanUrl, 50);
        setCurrentRoute(getRouteFromLocation());
      }
    });

    // 4. Handle browser forward/backward actions
    const handleLocationChange = () => {
      cleanUrl();
      setCurrentRoute(getRouteFromLocation());
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    return () => {
      clearInterval(tokenCheckInterval);
      clearTimeout(safetyTimeout);
      authListener?.subscription?.unsubscribe();
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateTo = (route: RouteKey) => {
    if (route === 'privacy') {
      window.history.pushState({}, '', '/privacy');
      setCurrentRoute('privacy');
    } else if (route === 'terms') {
      window.history.pushState({}, '', '/terms');
      setCurrentRoute('terms');
    } else if (route === 'cookies') {
      window.history.pushState({}, '', '/cookies');
      setCurrentRoute('cookies');
    } else {
      window.history.pushState({}, '', '/dashboard');
      setCurrentRoute('dashboard');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AuthProvider>
      {currentRoute === 'privacy' && (
        <PrivacyPolicy
          onNavigateHome={() => navigateTo('dashboard')}
          onNavigateTerms={() => navigateTo('terms')}
        />
      )}

      {currentRoute === 'terms' && (
        <TermsAndConditions
          onNavigateHome={() => navigateTo('dashboard')}
          onNavigatePrivacy={() => navigateTo('privacy')}
        />
      )}

      {currentRoute === 'cookies' && (
        <CookiesPolicy
          onNavigateHome={() => navigateTo('dashboard')}
          onNavigatePrivacy={() => navigateTo('privacy')}
          onNavigateTerms={() => navigateTo('terms')}
        />
      )}

      {currentRoute === 'dashboard' && (
        <ProtectedRoute
          onNavigatePrivacy={() => navigateTo('privacy')}
          onNavigateTerms={() => navigateTo('terms')}
          onNavigateCookies={() => navigateTo('cookies')}
        >
          <Dashboard
            onNavigatePrivacy={() => navigateTo('privacy')}
            onNavigateTerms={() => navigateTo('terms')}
            onNavigateCookies={() => navigateTo('cookies')}
          />
        </ProtectedRoute>
      )}

      {/* Non-intrusive essential cookie consent notice */}
      <CookieBanner onNavigateCookies={() => navigateTo('cookies')} />
    </AuthProvider>
  );
}

export default App;