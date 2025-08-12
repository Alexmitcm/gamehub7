import type { ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { useWagmiConfig } from "@/hooks/useWagmiConfig";

interface Web3ProviderProps {
  children: ReactNode;
}

const Web3Provider = ({ children }: Web3ProviderProps) => {
  const config = useWagmiConfig();
  return <WagmiProvider config={config}>{children}</WagmiProvider>;
};

export default Web3Provider;
