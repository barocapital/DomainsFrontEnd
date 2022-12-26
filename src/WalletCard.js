 import React, { useState, useEffect, useRef,useMemo } from "react";
 import  {ethers,getDefaultAccount}  from "ethers";
 import "./WalletCard.css";
 import { NFTStorage } from "nft.storage/dist/bundle.esm.min.js";
 import QRCode from "qrcode";
 import {background} from "./methods/functions.js"
 import ABI from "./methods/ABI.json"
 import { useAccount,usePrepareContractWrite,usePrepareSendTransaction, useContractWrite,useSendTransaction,useWaitForTransaction, ChainDoesNotSupportMulticallError  } from 'wagmi'
 import {polygonMainnet,polygonTestnet} from './methods/Chains.jsx'
 var connected = false;
 
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
   const [enableProcess,setEnableProcess ]= useState(0);
   const { address, isConnected } = useAccount()
   async function mint() {
     let imageDentro;
     let canvasBackground= background(userDomin);
    await canvasBackground.toBlob(async function (blob) {
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
         })
         .catch((err) => console.error(err));
       setImagex(imageDentro);
       setVisibleItem(true);
       setEnableProcess(2);
     });
    
   }
   const theFlag = useMemo(() => {
    return userDomin !== "" &&  metadataX !== "";
  }, [userDomin, metadataX]);

 
   const { 
    config,
    data:datax,
    isSuccess:isSuccessPrepare,
    error: prepareError,
    isPrepareError: isPrepareError,
  } = usePrepareContractWrite({
    address: '0xF9FB1B27314Fa5bA136C765bE2439C9513aEf13C',
    abi: ABI,
    functionName: 'register',
    enabled:theFlag,
    args: [userDomin.replace(".baro", ""), metadataX],
    chainId:polygonTestnet.id,
    onSuccess(data) {
      console.log('Success', data)

    },
    onError(error) {
      setEnableProcess(0)
      console.log('Error', error)
    },
   onSettled(data, error) {
      console.log('Settled', { data, error })
    },
  })


  const { data,error, isError ,write } = useContractWrite(config)
  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  })

  const [isInitialRender, setIsInitialRender] = useState(true);

  useEffect(() => {
      if(enableProcess==2)
      {
        console.log("--");
        write?.();
      }
  }, [enableProcess]);
  const canvasRef = useRef(null);
 
   useEffect(() => {
    async function fetchDefaultAccount() {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const accounts = await provider.send("eth_requestAccounts", []);
        setDefaultAccount(accounts[0]);
        getAccountBalance(accounts[0])
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
         alert("Caja de texto vacia");
       } else {
         if (!strongRegex.test(userDomin)) {
           alert("Caracter invalido");
         } else {
          setEnableProcess(0);
           mint();
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
 
   return (
    <center>
     <div className="walletCard">
       <div className="accountDisplay">
         <h3>Address: {address}</h3>
         
       </div>
       <div className="balanceDisplay">
         <h3>Balance: {userBalance}</h3>
       </div>
       {errorMessage}
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

               {isLoading ? 'Minting...' :                
               <button disabled={isLoading} className="buttonWallet" onClick={domainbaro}>
                 Mint
               </button>
               }
                     {isSuccess && (
                  <div>
                    Successfully minted your NFT!
                    <div>
                      <a href={`${data?.hash}`}>Hash</a>
                    </div>
                  </div>
                )}
               {(isPrepareError || isError) && (
                <div>Error: {(prepareError || error)?.message}</div>
              )}
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

     </div>
     </center>
   );
 };
 
 export default WalletCard;
 