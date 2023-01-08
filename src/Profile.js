import React from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  usePrepareContractWrite,
} from "wagmi";
import Navbar from "./Navbar";
import WalletCard from "./WalletCard";
import Marketplace from "./Marketplace";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import FormControl from "@mui/material/FormControl";
import BaroImage from "./assets/BaroLogo.png";

export function Profile() {
  const { address, connector, isConnected } = useAccount();

  return (
    <React.Fragment>
      <Navbar isConnected={isConnected}></Navbar>
      <Box
        sx={{
          my: 8,
          mx: 12,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Grid item xs={12} sm={8} md={12} elevation={6}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {isConnected ? (
              <React.Fragment>
                <center>
                  <WalletCard />
                  <Marketplace/>
                </center>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <Box
                  sx={{
                    my: 4,
                    mx: 12,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <FormControl sx={{ m: -10 }}>
                    <img src={BaroImage} />
                  </FormControl>
                  <FormControl sx={{ m: -8 }}>
                    <h1>
                      Sabemos que el efectivo es el rey, nosotros solo lo
                      transformamos
                    </h1>
                  </FormControl>
                </Box>
              </React.Fragment>
            )}
          </Box>
        </Grid>
      </Box>
    </React.Fragment>
  );
}
