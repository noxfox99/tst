import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { mainnet, polygon, arbitrum } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";

const { chains, publicClient } = configureChains(
  [mainnet, polygon, arbitrum],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: "Micro SaaS AI Builder",
  projectId: "YOUR_WALLETCONNECT_PROJECT_ID",  // Get from WalletConnect Cloud
  chains,
});

export const wagmiClient = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

export const Web3Provider = ({ children }: { children: React.ReactNode }) => (
  <WagmiConfig config={wagmiClient}>
    <RainbowKitProvider chains={chains}>{children}</RainbowKitProvider>
  </WagmiConfig>
);
