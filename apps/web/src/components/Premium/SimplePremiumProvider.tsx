import { useSimplePremium } from "@/hooks/useSimplePremium";

interface SimplePremiumProviderProps {
  children: React.ReactNode;
}

const SimplePremiumProvider = ({ children }: SimplePremiumProviderProps) => {
  // Initialize premium status on app startup
  useSimplePremium();

  return <>{children}</>;
};

export default SimplePremiumProvider;
