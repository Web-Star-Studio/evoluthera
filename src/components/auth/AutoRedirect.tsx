
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const AutoRedirect = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    if (profile) {
      switch (profile.user_type) {
        case 'patient':
          navigate('/patient-dashboard', { replace: true });
          break;
        case 'psychologist':
          navigate('/psychologist-dashboard', { replace: true });
          break;
        case 'admin':
          navigate('/admin-dashboard', { replace: true });
          break;
        default:
          navigate('/login', { replace: true });
      }
    }
  }, [user, profile, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default AutoRedirect;
