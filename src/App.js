import logo from "./logo.svg";
import "./App.css";
import WalletCard from "./WalletCard";
import {Profile} from "./Profile";
import { InjectedConnector } from 'wagmi/connectors/injected'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { publicProvider } from 'wagmi/providers/public'
import { Provider,createClient,configureChains } from 'wagmi'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import { Chain } from 'wagmi'
import { useNetwork } from 'wagmi'
import { polygon} from 'wagmi/chains'
import { WagmiConfig } from 'wagmi'
import {polygonMainnet,polygonTestnet} from './methods/Chains.jsx'


const { chains, provider } = configureChains(
  [polygonTestnet],
  [
    jsonRpcProvider({
      rpc: (chain) => {
        if (chain.id !== polygonTestnet.id) return null;
        console.log(chain.id);
        return { http: chain.rpcUrls.default };
      },
    }),
  ]
);


const client = createClient({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    new InjectedConnector({
      chains,
      options: {
        name: 'Injected',
        shimDisconnect: true,
      },
    }),
  ],
  provider:provider
})


function App() {
  return (
    <div className="App">
     <WagmiConfig client={client}>
      <Profile/>
      <WalletCard/>
    </WagmiConfig>

    </div>
  );
}

export default App;
