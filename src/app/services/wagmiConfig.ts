import { createConfig, http, WagmiConfig } from "wagmi";
import { mainnet, polygon, arbitrum } from "wagmi/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";

const wagmiClient = createConfig(
  getDefaultConfig({
    appName: "Micro SaaS AI Builder",
    projectId: "YOUR_WALLETCONNECT_PROJECT_ID", // Get from WalletConnect Cloud
    chains: [mainnet, polygon, arbitrum],
    transports: {
      [mainnet.id]: http(),
      [polygon.id]: http(),
      [arbitrum.id]: http(),
    },
  })
);

export const Web3Provider = ({ children }: { children: React.ReactNode }) => (
  <WagmiConfig config={wagmiClient}>{children}</WagmiConfig>
);
