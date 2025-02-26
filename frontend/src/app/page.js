import ClientsPage from "@/app/users/page";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <h1 className="text-4xl font-bold text-center mt-8">مرحباً بك في تطبيق UserBilling</h1>
      <h2 className="text-center text-xl m-4">هذا التطبيق يسمح لك بإدارة المستخدمين والفواتير</h2>
      <div className="flex justify-center items-center gap-4">
        <p>يمكنك زيارة هذه المسارات:</p>
        <Link href="/create-user" className="text-blue-500 hover:underline">/create-user</Link>
        <Link href="/users" className="text-blue-500 hover:underline">/users</Link>
        <Link href="/create-bill" className="text-red-500 hover:underline">/create-bill</Link>
        <Link href="/bills" className="text-red-500 hover:underline">/bills</Link>
      </div>
    </>
  );
} 