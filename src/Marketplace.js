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
import Baro from "./methods/Baro.json";
import { BigNumber } from 'ethers'
import Card from '@mui/material/Card';
import {
  useAccount,
  usePrepareContractWrite,
  usePrepareSendTransaction,
  useContractWrite,
  useSendTransaction,
  useWaitForTransaction,
  ChainDoesNotSupportMulticallError,
} from "wagmi";
import Typography from '@mui/material/Typography';
import { polygonMainnet, polygonTestnet } from "./methods/Chains.jsx";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";
import CardActions from '@mui/material/CardActions';
const Marketplace = ({ value }) => {
  const [price, setPrice] = useState("10");
  const [activateERC20, setActivateERC20] = useState(0);
  const [actualIndex, setActualIndex] = useState(0);
  const [textBoxes, setTextBoxes] = useState(
    [
      { value:"",
      price:"50000000000000000000",
      text:"Recarga de $50 pesos",
      image:"https://www.telcel.com/content/dam/htmls/img/icons/logo-telcel.svg"
     }, 
    { value: "",price:"100000000000000000000",text:"Recarga de $100 pesos",image:"https://www.telcel.com/content/dam/htmls/img/icons/logo-telcel.svg"  },
  ]);

  const handleChange = (e, index) => {
    const values = [...textBoxes];
    values[index].value = e.target.value;
    setTextBoxes(values);
  };

  async function sendBaros(){
    setActivateERC20(1);
  }

  const detectChanges = useMemo(() => {
    return textBoxes.map((textBox) => textBox.value).some((value) => value !== "10" && value !== "") && activateERC20===1 && price!==0;
  }, [textBoxes,activateERC20,price]);
  
  
  const {
    config:configERC20,
    data: dataDomainsERC20,
    isSuccess: isSuccessPrepareERC20,
    error: prepareErrorERC20,
    isPrepareError: isPrepareErrorERC20,
  } = usePrepareContractWrite({
    address: process.env.REACT_APP_MAINNET_ERC20_ADDRESS,
    abi: Baro,
    functionName: "transfer",
    enabled: detectChanges,
    args: ["0xADe4BEa7db7e35a5bE2CC9c528169Cb6cF2f4b6E",price],
    chainId: polygonMainnet.id,
    onSuccess(data) {
      console.log("Success", data);
      writeERC20?.();
    },
    onError(error) {
      setActivateERC20(0);
      setPrice(0);
    },
    onSettled(data, error) {
      console.log("Settled", { data, error });
    },
  });

  const { data:dataERC20, error:errorERC20, isError:isErrorERC20, write:writeERC20 } = useContractWrite(configERC20);
  const { isLoading:isLoadingERC20, isSuccess:isSuccessERC20,isError:isErrorWaitERC20 } = useWaitForTransaction({
    hash: dataERC20?.hash,
  });
 
  useEffect(() => {
    if(activateERC20==1)
    {
      let newTextBoxes = [...textBoxes];
      setTextBoxes(newTextBoxes);
      setActivateERC20(0);
    }
  }, [isErrorERC20]);

  useEffect(() => {
    if(isSuccessERC20)
    {
        const db = firebase.firestore();
        db.collection("transactions")
        .add({
          phone: textBoxes[actualIndex].value ,
          transactionHash: "https://polygonscan.com/tx/" + dataERC20.hash,
        })
        .then(function (docRef) {
          console.log("Document written with ID: ", docRef.id);
        })
        .catch(function (error) {
          console.error("Error adding document: ", error);
        });
    }
  }, [isSuccessERC20]);

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

      <div className="walletCard">



        <React.Fragment>

        <h1>Mercado</h1>
          <Container sx={{ py: 8 }} maxWidth="md">
            <Grid container spacing={4}>
                    {textBoxes.map((textBox, index) => (
                         <Grid item key={index} xs={12} sm={6} md={4}>
                         <Card
                           sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                         >
                            <br></br>
                                <CardMedia
                                    component="img"
                                    image={textBox.image}
                                    alt="random"
                                />
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography gutterBottom variant="h5" component="h2">
                                    {textBox.text}
                                    </Typography>
                                    <OutlinedInput
                                    margin="dense"
                                    type="tel" 
                                    id="phone" 
                                    size="13"
                                    pattern="[0-9]{1,10}"
                                    value={textBox.value}
                                    placeholder="Teléfono" onChange={e => handleChange(e, index)}
                                    aria-describedby="outlined-weight-helper-text"
                                    inputProps={{
                                        "aria-label": "weight",
                                    }}
                                    />
                                    <br></br>
                                    <br></br>
                                    <center>
                                        <Button
                                        variant="contained"
                                        color="success"
                                        className="buttonWallet"
                                        onClick={(e) => {


                                        const isNumber = /^\d+$/.test(textBox.value); // Check if price is a number
                                        if (isNumber) { // If price is a number, set activateERC20 to 1
                                            e.preventDefault()
                                            setActivateERC20(0);
                                            setPrice(textBox.price);
                                            setActualIndex(index);
                                            sendBaros();
                                        } else { // If price is not a number, display an error message
                                          alert("Télefono con formato incorrecto");
                                        }
                                        }}
                                    >
                                        {textBox.text}
                                    </Button>
                                </center>
                                </CardContent>

                     </Card>
                     </Grid>
                    ))}

                </Grid>
          </Container>
        </React.Fragment>
      </div>
    </Box>
  );
};

export default Marketplace;
