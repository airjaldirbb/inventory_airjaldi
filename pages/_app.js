import store from "@/store";
import "@/styles/globals.css";
import { Provider, useDispatch, useSelector } from "react-redux";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { useEffect, useMemo } from "react";
import { createTheme } from "@mui/material/styles";
import { loadUserFromStorage } from "@/store/authSlice";

/* ===========================
   AUTH + THEME BOOTSTRAPPER
=========================== */
function AppInitializer({ Component, pageProps }) {
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.theme.mode);
  const authInitialized = useSelector(
    (state) => state.auth.initialized
  );

  useEffect(() => {
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: { mode },
      }),
    [mode]
  );

  // 🔥 BLOCK RENDER UNTIL AUTH IS READY
  if (!authInitialized) {
    return null; // or <LoadingScreen />
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

/* ===========================
   ROOT APP
=========================== */
export default function App({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <AppInitializer Component={Component} pageProps={pageProps} />
    </Provider>
  );
}
