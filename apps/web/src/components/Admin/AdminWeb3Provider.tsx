import type { ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { useAdminWagmiConfig } from "@/hooks/useAdminWagmiConfig";

interface AdminWeb3ProviderProps {
  children: ReactNode;
}

const AdminWeb3Provider = ({ children }: AdminWeb3ProviderProps) => {
  const config = useAdminWagmiConfig();
  return <WagmiProvider config={config}>{children}</WagmiProvider>;
};

export default AdminWeb3Provider;
