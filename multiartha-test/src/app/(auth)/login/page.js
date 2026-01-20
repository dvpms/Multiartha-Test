import LoginClient from "./LoginClient";

export default function LoginPage({ searchParams }) {
  const callbackUrl = searchParams?.callbackUrl || "/dashboard";
  return <LoginClient callbackUrl={callbackUrl} />;
}
