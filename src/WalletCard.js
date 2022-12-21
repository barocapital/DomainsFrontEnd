 import React, { useState, useEffect, useRef } from "react";
 import { ethers } from "ethers";
 import "./WalletCard.css";
 import { NFTStorage } from "nft.storage/dist/bundle.esm.min.js";
 import QRCode from "qrcode";
 import {background} from "./methods/functions.js"
 var connected = false;
 
 const WalletCard = () => {
   const client = new NFTStorage({
     token: process.env.REACT_APP_NFTSTORAGE_TOKEN,
   });
   const [imagex, setImagex] = useState("");
   const [visibleItem, setVisibleItem] = useState(false);
   const [errorMessage, setErrorMessage] = useState(null);
   const [defaultAccount, setDefaultAccount] = useState(null);
   const [domainAccount, setDomainAccount] = useState(null);
   const [userBalance, setUserBalance] = useState(null);
   const [userDomin, setUserDomin] = useState("");
   const [connButtonText, setConnButtonText] = useState("Connect Wallet");
 
   async function mint() {

  /*-----*/
     let imageDentro;
     let canvasBackground= background(userDomin);
     console.log(canvasBackground);
     canvasBackground.toBlob(async function (blob) {
       const metadata = await client.store({
         name: "Baro Name Service",
         description: userDomin + process.env.REACT_APP_TLD,
         image: new File(
           [blob],
           userDomin + process.env.REACT_APP_TLD.toString().replace(".", "") + ".jpg",
           {
             type: "image/jpg",
           }
         ),
       });
       alert("Procesando dominio,espere un momento...");
       await fetch(
         metadata.url.replace("ipfs://", "https://nftstorage.link/ipfs/")
       )
         .then((res) => res.json())
         .then((out) => {
           imageDentro = out.image.replace(
             "ipfs://",
             "https://nftstorage.link/ipfs/"
           );
         })
         .catch((err) => console.error(err));
       setVisibleItem(true);
       setImagex(imageDentro);
     });
   }
 
   const canvasRef = useRef(null);
 
   useEffect(() => {
     QRCode.toCanvas(
       canvasRef.current,
       // QR code doesn't work with an empty string
       // so we are using a blank space as a fallback
       defaultAccount || " ",
       (error) => error && console.error(error)
     );
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
         alert("Caja de texto vacia");
       } else {
         if (!strongRegex.test(userDomin)) {
           alert("Caracter invalido");
         } else {
           mint();
         }
       }
     }
   };
 
   const connectWalletHandler = () => {
     if (window.ethereum && window.ethereum.isMetaMask) {
       window.ethereum
         .request({ method: "eth_requestAccounts" })
         .then((result) => {
           accountChangedHandler(result[0]);
           setConnButtonText("Wallet Connected");
           getAccountBalance(result[0]);
 
           connected = true;
         })
         .catch((error) => {
           setErrorMessage(error.message);
         });
     } else {
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
 
       <div className="accountDisplay">
         <h3>Address: {defaultAccount}</h3>
       </div>
       <div className="balanceDisplay">
         <h3>Balance: {userBalance}</h3>
       </div>
       {errorMessage}
       {connected === true ? (
         <React.Fragment>
           <canvas ref={canvasRef} />
           <section>
             <div className="form-container">
               <div className="first-row">
                 <input
                   type="text"
                   pattern="[a-zA-Z0-9_-]{1,100}"
                   value={userDomin}
                   placeholder="domain"
                   onChange={(e) => setUserDomin(e.target.value)}
                   //onkeypress="return event.charCode >= 48 && event.charCode <= 57"
                 />
                 <p className="tld"> {process.env.REACT_APP_TLD} </p>
               </div>
               <button className="buttonWallet" onClick={domainbaro}>
                 Mint
               </button>
             </div>
             <p></p>
             {visibleItem ? (
               <>
                 <img
                   src={imagex}
                   style={{
                     width: "228px",
                     height: "228px",
                     margin: "5 auto",
                   }}
                 ></img>
               </>
             ) : (
               <></>
             )}
           </section>
         </React.Fragment>
       ) : (
         <React.Fragment>
           <canvas ref={canvasRef} style={{ display: "none" }} />
         </React.Fragment>
       )}
     </div>
   );
 };
 
 export default WalletCard;
 