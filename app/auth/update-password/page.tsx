import { UpdatePasswordForm } from "@/components/update-password-form";

export const metadata = { title: "Choose a password" };

export default function UpdatePasswordPage() {
  return <main className="grid min-h-screen place-items-center px-5 py-12"><div className="w-full max-w-md"><UpdatePasswordForm /></div></main>;
}
