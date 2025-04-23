import "../styles/globals.css";
import { AuthProvider } from "../firebase/useAuth";

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
