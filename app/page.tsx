import { Button } from "@/components/ui/button";
// import { Link } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex gap-10 min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <Button variant="ghost" size="icon">
        <Link href={'/home'}>
          Click aquí
        </Link>
      </Button>

      <Button>
        <Link href={'/user'}>
          User Page
        </Link>
      </Button>
    </div>
  );
}
