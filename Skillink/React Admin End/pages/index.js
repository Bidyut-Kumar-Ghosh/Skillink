import { useEffect } from "react";
import { useRouter } from "next/router";
import { auth } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { withAuth } from "../firebase/useAuth";
import Head from "next/head";

function Home() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <Head>
        <title>Skillink Admin Panel</title>
        <meta name="description" content="Skillink Education Admin Panel" />
      </Head>

      <main>
        <h1
          style={{
            fontSize: "3rem",
            color: "#333",
            textAlign: "center",
          }}
        >
          Loading...
        </h1>
      </main>
    </div>
  );
}

export default withAuth(Home);
