import Head from "next/head";
import "tailwindcss/tailwind.css";
import { AppProps } from "next/app";
import { DashboardLayout } from "@/dashboard/Layout";
import { AuthProvider } from "@/auth/AuthContext";
import { AuthGuard } from "@/auth/AuthGuard";
import { useRouter } from "next/router";

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isLoginPage = router.pathname === "/login";

  return (
    <>
      <Head>
        <title>Dermify Admin Dashboard</title>
        <meta
          name="description"
          content="Dermify skincare analysis admin dashboard"
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>
      <AuthProvider>
        {isLoginPage ? (
          <Component {...pageProps} />
        ) : (
          <AuthGuard>
            <DashboardLayout>
              <Component {...pageProps} />
            </DashboardLayout>
          </AuthGuard>
        )}
      </AuthProvider>
    </>
  );
}

export default MyApp;
