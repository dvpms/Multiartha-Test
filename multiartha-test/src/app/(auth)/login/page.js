import LoginClient from "./LoginClient";

export default async function LoginPage({ searchParams }) {
  const sp = (await searchParams) || {};
  const callbackUrl = sp.callbackUrl || "/dashboard";
  return <LoginClient callbackUrl={callbackUrl} />;
}
