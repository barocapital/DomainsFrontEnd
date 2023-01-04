import React, { useState, useContext } from "react";
import {
  AppBar,
  Button,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  useAccount,
  useConnect,
  useDisconnect,
  usePrepareContractWrite,
} from "wagmi";
import "./Navbar.css";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const Navbar = (props) => {
  const { address, connector, isConnected } = useAccount();
  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect();
  const { disconnect } = useDisconnect();
  const theme = createTheme({
    palette: {
      primary: {
        main: "#DD7F44",
      },
      secondary: {
        main: "#f44336",
      },
    },
  });
  return (
    <React.Fragment>
      <ThemeProvider theme={theme}>
        <AppBar>
          <Toolbar>
            <Typography variant="h6" color="inherit" noWrap>
              Baro Capital
            </Typography>

            {props.isConnected ? (
              <React.Fragment>
                <div className="divButton2">
                  <Button variant="contained" disabled size="small">
                    {address.substring(0, 10)}
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={disconnect}
                  >
                    Desconectar
                  </Button>
                </div>
              </React.Fragment>
            ) : (
              <React.Fragment>
                {connectors.map((connector) => (
                  <div className="divButton2">
                    <Button
                      variant="contained"
                      color="success"
                      disabled={!connector.ready}
                      key={connector.id}
                      onClick={() => connect({ connector })}
                    >
                      {connector.name}
                      {!connector.ready && " (unsupported)"}
                      {isLoading &&
                        connector.id === pendingConnector?.id &&
                        " (connecting)"}
                    </Button>
                  </div>
                ))}
              </React.Fragment>
            )}
            {error && <div>{error.message}</div>}
          </Toolbar>
        </AppBar>
      </ThemeProvider>
    </React.Fragment>
  );
};

export default Navbar;
