import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LoginPage } from './LoginPage';

type ProtectedRouteProps = {
  children: React.ReactNode;
  onNavigatePrivacy?: () => void;
  onNavigateTerms?: () => void;
  onNavigateCookies?: () => void;
};

export function ProtectedRoute({
  children,
  onNavigatePrivacy,
  onNavigateTerms,
  onNavigateCookies,
}: ProtectedRouteProps) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <LoginPage
        onNavigatePrivacy={onNavigatePrivacy}
        onNavigateTerms={onNavigateTerms}
        onNavigateCookies={onNavigateCookies}
      />
    );
  }

  return <>{children}</>;
}
