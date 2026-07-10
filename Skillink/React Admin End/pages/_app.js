import { useMemo } from "react";
import { useRouter } from "next/router";
import "../styles/globals.css";
import { AuthProvider, withAuth } from "../firebase/useAuth";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const isLoginPage = router.pathname === "/login";

  const PageComponent = useMemo(
    () => (isLoginPage ? Component : withAuth(Component)),
    [Component, isLoginPage]
  );

  return (
    <AuthProvider>
      <PageComponent {...pageProps} />
    </AuthProvider>
  );
}
