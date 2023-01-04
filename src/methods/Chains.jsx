import { Chain } from "wagmi";

export const  polygonMainnet: Chain = {
  id: 137,
  name: "Polygon Mainnet",
  network: "poligon mainnet",
  nativeCurrency: {
    name: "Matic",
    symbol: "Matic",
    decimals: 18,
  },
  rpcUrls: {
    alchemy: process.env.REACT_APP_RPC_ALCHEMY_POLYGON_MAINNET,
    default: process.env.REACT_APP_RPC_QUICKNODE_POLYGON_MAINNET,
  },
  blockExplorers: {
    default: { name: "PolygonScan", url: "https://polygonscan.com/" },
  },
  testnet: false,
};

export const polygonTestnet: Chain = {
  id: 80001,
  name: "Polygon Mumbai",
  network: "poligon mumbai",
  nativeCurrency: {
    name: "Matic",
    symbol: "Matic",
    decimals: 18,
  },
  rpcUrls: {
    alchemy: process.env.REACT_APP_RPC_ALCHEMY_MUMBAI_TESTNET,
    default: process.env.REACT_APP_RPC_QUICKNODE_MUMBAI_TESTNET,
  },
  blockExplorers: {
    default: { name: "PolygonScan", url: "https://mumbai.polygonscan.com/" },
  },
  testnet: true,
};
