import { Button } from "@/components/ui/button";
import UserToggle from "@/components/userToggle";
import Link from "next/link";

export default function UserPage() {
    return (
        <div className='p-12'>
            <h1>User Toggle Page</h1>
            <UserToggle
                initialStatus={true}
                userID={""}
            />

            <Button variant="ghost">
                <Link href={'/'}>
                    Volver al Home
                </Link>
            </Button>
        </div>
    );
}