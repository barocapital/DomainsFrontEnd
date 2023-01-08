import Button from "@mui/material/Button";
import InputLabel from "@mui/material/InputLabel";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputAdornment from "@mui/material/InputAdornment";
import FormHelperText from "@mui/material/FormHelperText";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { ethers, getDefaultAccount } from "ethers";
import "./WalletCard.css";
import { NFTStorage } from "nft.storage/dist/bundle.esm.min.js";
import QRCode from "qrcode";
import { background } from "./methods/functions.js";
import ABI from "./methods/ABI.json";

import {
  useAccount,
  usePrepareContractWrite,
  usePrepareSendTransaction,
  useContractWrite,
  useSendTransaction,
  useWaitForTransaction,
  ChainDoesNotSupportMulticallError,
} from "wagmi";
import { polygonMainnet, polygonTestnet } from "./methods/Chains.jsx";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";

const WalletCard = ({ value }) => {
  const client = new NFTStorage({
    token: process.env.REACT_APP_NFTSTORAGE_TOKEN,
  });

  const [metadataX, setMetaDatax] = useState("");
  const [imagex, setImagex] = useState("");
  const [visibleItem, setVisibleItem] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [defaultAccount, setDefaultAccount] = useState(null);
  const [userBalance, setUserBalance] = useState(null);
  const [userDomin, setUserDomin] = useState("");
  const [enableProcess, setEnableProcess] = useState(0);
  const { address, isConnected } = useAccount();
  
  async function mint() {
    let imageDentro;
    let canvasBackground = background(userDomin);
    await canvasBackground.toBlob(async function (blob) {
      const metadata = await client.store({
        name: "Baro Name Service",
        description: userDomin + process.env.REACT_APP_TLD,
        image: new File(
          [blob],
          userDomin +
            process.env.REACT_APP_TLD.toString().replace(".", "") +
            ".jpg",
          {
            type: "image/jpg",
          }),
      });
      setMetaDatax(metadata.url);
      await fetch(
        metadata.url.replace("ipfs://", "https://nftstorage.link/ipfs/")
      )
        .then((res) => res.json())
        .then((out) => {
          imageDentro = out.image.replace(
            "ipfs://",
            "https://nftstorage.link/ipfs/"
          );
        }).catch((err) => console.error(err));
      setImagex(imageDentro);
      setVisibleItem(true);
      setEnableProcess(2);
    });
  }  


  const theFlag = useMemo(() => {
    return userDomin !== "" && metadataX !== "";
  }, [userDomin, metadataX]);

  const {
    config:config,
    data: dataDomains,
    isSuccess: isSuccessPrepare,
    error: prepareError,
    isPrepareError: isPrepareError,
  } = usePrepareContractWrite({
    address: process.env.REACT_APP_MAINNET_ADDRESS,
    abi: ABI,
    functionName: "register",
    enabled: theFlag,
    args: [userDomin.replace(".baro", ""), metadataX],
    chainId: polygonMainnet.id,
    onSuccess(data) {
      console.log("Success", data);
    },
    onError(error) {
      setEnableProcess(0);
      console.log("Error", error);
    },
    onSettled(data, error) {
      console.log("Settled", { data, error });
    },
  });

  const { data, error, isError, write } = useContractWrite(config);
  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });


 
  useEffect(() => {
    if (enableProcess == 2) {
      write?.();
    }
  }, [enableProcess]);

  const canvasRef = useRef(null);



  useEffect(() => {
    async function fetchDefaultAccount() {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        setDefaultAccount(accounts[0]);
        getAccountBalance(accounts[0]);
      } catch (error) {
        console.error(error);
      }
    }

    QRCode.toCanvas(
      canvasRef.current,
      // QR code doesn't work with an empty string
      // so we are using a blank space as a fallback
      defaultAccount || " ",
      (error) => error && console.error(error)
    );
    fetchDefaultAccount();
  }, [defaultAccount]);

  const domainbaro = () => {
    let strongRegex = new RegExp("^[A-Za-z0-9_-]*$");
    if (window.ethereum && window.ethereum.isMetaMask) {
      window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then((result) => {
          accountChangedHandler(result[0]);
        });

      if (userDomin.length === 0) {
        alert("El nombre del dominio no puede quedar vacío.");
      } else {
        if (!strongRegex.test(userDomin)) {
          alert(
            "El nombre del dominio contiene caracteres no válidos. Utilice sólo Letras y Números."
          );
        } else {
          if (userDomin.length <= 20) {
            if (/[a-zA-Z]/g.test(userDomin)) {
              setEnableProcess(0);
              mint();
            } else
              alert("El nombre del dominio debe contener al menos una letra.");
          } else {
            alert("No puede ser mas de 20 caracteres");
          }
        }
      }
    }
  };

  // update account, will cause component re-render
  const accountChangedHandler = (newAccount) => {
    setDefaultAccount(newAccount);
    getAccountBalance(newAccount.toString());
  };

  const getAccountBalance = (account) => {
    window.ethereum
      .request({ method: "eth_getBalance", params: [account, "latest"] })
      .then((balance) => {
        setUserBalance(ethers.utils.formatEther(balance));
      })
      .catch((error) => {
        setErrorMessage(error.message);
      });
  };

  const chainChangedHandler = () => {
    // reload the page to avoid any errors with chain change mid use of application
    window.location.reload();
  };

  // listen for account changes
  window.ethereum.on("accountsChanged", accountChangedHandler);

  window.ethereum.on("chainChanged", chainChangedHandler);

  const cards = [1];
  return (
    <Box
      sx={{
        my: 4,
        mx: 12,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <br></br>
      <div className="walletCard">
        <div className="accountDisplay">
          <InputLabel>Dirección: {address}</InputLabel>
        </div>
        <div className="balanceDisplay">
          <InputLabel>Saldo: {userBalance}</InputLabel>
        </div>
        {errorMessage}
        <React.Fragment>
          <canvas ref={canvasRef} />

          <div className="form-container">
            <div className="first-row">
              <FormControl sx={{ m: 1, width: "25ch" }} variant="outlined">
                <OutlinedInput
                  margin="dense"
                  type="text"
                  pattern="[a-zA-Z0-9_-]{1,20}"
                  value={userDomin}
                  placeholder="domain"
                  onChange={(e) => setUserDomin(e.target.value)}
                  endAdornment={
                    <InputAdornment position="end">
                      {" "}
                      {process.env.REACT_APP_TLD}{" "}
                    </InputAdornment>
                  }
                  aria-describedby="outlined-weight-helper-text"
                  inputProps={{
                    "aria-label": "weight",
                  }}
                />
              </FormControl>
            </div>

            {isLoading ? (
              "Generando..."
            ) : (
              <Button
                variant="contained"
                color="success"
                disabled={isLoading}
                className="buttonWallet"
                onClick={domainbaro}
              >
                Obtener Billetera Personalizada
              </Button>
            )}
          </div>
          <Container sx={{ py: 8 }} maxWidth="md">
            {isSuccess && (
              <div>
                ¡Has obtenido con éxito tu NFT!
                <div>
                  {data?.hash && (
                    <React.Fragment>
                      {" "}
                      <br></br>
                      <a
                        target="_blank"
                        href={`${polygonMainnet.blockExplorers.default.url}/tx/${data?.hash}`}
                      >
                        Comprobante de transacción
                      </a>
                    </React.Fragment>
                  )}
                </div>
              </div>
            )}
            {(isPrepareError || isError) && (
              <div>Error: {(prepareError || error)?.message}</div>
            )}
          </Container>
        </React.Fragment>
      </div>
    </Box>
  );
};

export default WalletCard;
