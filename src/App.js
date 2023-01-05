import logo from "./logo.svg";
import "./App.css";
import WalletCard from "./WalletCard";
import { Profile } from "./Profile";
import { InjectedConnector } from "wagmi/connectors/injected";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { publicProvider } from "wagmi/providers/public";
import {
  Provider,
  createClient,
  configureChains,
  useAccount,
  useConnect,
  useDisconnect,
} from "wagmi";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { Chain } from "wagmi";
import { useNetwork } from "wagmi";
import { polygon } from "wagmi/chains";
import { WagmiConfig } from "wagmi";
import { polygonMainnet, polygonTestnet } from "./methods/Chains.jsx";
import firebase from "firebase/compat/app";
const { chains, provider } = configureChains(
  [polygonMainnet],
  [
    jsonRpcProvider({
      rpc: (chain) => {
        if (chain.id !== polygonMainnet.id) return null;
        console.log(chain.id);
        return { http: chain.rpcUrls.default };
      },
    }),
  ]
);

firebase.initializeApp({
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
});

const client = createClient({
  autoConnect: true,
  connectors: [new MetaMaskConnector({ chains })],
  provider: provider,
});

export function App() {
  const { address, connector, isConnected } = useAccount();
  return (
    <center>
      <WagmiConfig client={client}>
        <Profile />
        {isConnected == true ? <></> : <></>}
      </WagmiConfig>
    </center>
  );
}

export default App;
