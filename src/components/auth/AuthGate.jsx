import { useAuth } from '../../context/AuthContext';

export function AuthGate({ children }) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F7FA] gap-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="font-poppins text-sm text-text-secondary">Restoring session...</p>
      </div>
    );
  }

  return children;
}
