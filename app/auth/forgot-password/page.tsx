import { ForgotPasswordForm } from "@/components/forgot-password-form";

export const metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  return <main className="grid min-h-screen place-items-center px-5 py-20"><div className="w-full max-w-md"><ForgotPasswordForm /></div></main>;
}
