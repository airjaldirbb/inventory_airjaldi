import store from "@/store";
import "@/styles/globals.css";
import { Provider, useSelector } from "react-redux";
import { ThemeProvider,CssBaseline} from "@mui/material";
import { useMemo } from "react";
import { createTheme, } from "@mui/material/styles";


// ✅ Inner app that has access to Redux
function ThemedApp({ Component, pageProps }) {
  const mode = useSelector((state) => state.theme.mode);

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
    }
  }), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}


export default function App(props) {
  return (
    <Provider store={store}>
      <ThemedApp {...props} />
    </Provider>
  );
}
