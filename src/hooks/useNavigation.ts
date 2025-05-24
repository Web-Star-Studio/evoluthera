
import { useNavigate, useLocation } from "react-router-dom";
import { useCallback, useEffect } from "react";

export const useNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigateToSection = useCallback((path: string) => {
    if (path.includes("#")) {
      const [route, hash] = path.split("#");
      navigate(route);
      
      // Wait for navigation to complete before scrolling
      setTimeout(() => {
        const element = document.querySelector(`[data-section="${hash}"]`) || 
                      document.querySelector(`[data-tab="${hash}"]`);
        if (element) {
          element.scrollIntoView({ 
            behavior: "smooth", 
            block: "start" 
          });
        }
      }, 100);
    } else {
      navigate(path);
    }
  }, [navigate]);

  const isActivePath = useCallback((path: string) => {
    if (path.includes("#")) {
      const route = path.split("#")[0];
      return location.pathname === route;
    }
    return location.pathname === path;
  }, [location.pathname]);

  const getCurrentSection = useCallback(() => {
    return location.hash.replace("#", "") || null;
  }, [location.hash]);

  return {
    navigateToSection,
    isActivePath,
    getCurrentSection,
    currentPath: location.pathname
  };
};
