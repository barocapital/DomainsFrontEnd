// https://docs.metamask.io/guide/ethereum-provider.html#using-the-provider

import React, { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import "./WalletCard.css";
import QRCode from "qrcode";

const WalletCard = () => {
  const [errorMessage, setErrorMessage] = useState(null);
  const [defaultAccount, setDefaultAccount] = useState(null);
  const [userBalance, setUserBalance] = useState(null);
  const [connButtonText, setConnButtonText] = useState("Connect Wallet");

  const canvasRef = useRef();

  useEffect(() => {
    QRCode.toCanvas(
      canvasRef.current,
      // QR code doesn't work with an empty string
      // so we are using a blank space as a fallback
      defaultAccount || " ",
      (error) => error && console.error(error)
    );

    QRCode.toDataURL(defaultAccount, function (err, url) {
      console.log(url);
    });
  }, [defaultAccount]);

  const connectWalletHandler = () => {
    if (window.ethereum && window.ethereum.isMetaMask) {
      console.log("MetaMask Here!");

      window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then((result) => {
          accountChangedHandler(result[0]);
          setConnButtonText("Wallet Connected");
          getAccountBalance(result[0]);
        })
        .catch((error) => {
          setErrorMessage(error.message);
        });
    } else {
      console.log("Need to install MetaMask");
      setErrorMessage("Please install MetaMask browser extension to interact");
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

  return (
    <div className="walletCard">
      <h4> {"Conexión a MetaMask"} </h4>
      <button className="buttonWallet" onClick={connectWalletHandler}>
        {connButtonText}
      </button>
      {/*
      <div className="form-container">
        <div className="first-row">
          <input
            type="text"
            value={url}
            placeholder="domain"
            onChange={(e) => setUrl(e.target.value)}
          />
          <p className="tld"> {tld} </p>
        </div>
      </div>
*/}
      <div className="accountDisplay">
        <h3>Address: {defaultAccount}</h3>
      </div>
      <div className="balanceDisplay">
        <h3>Balance: {userBalance}</h3>
      </div>
      {errorMessage}

      <section>
        <canvas ref={canvasRef} />

        <p></p>
      </section>
    </div>
  );
};

export default WalletCard;
