import UserToggle from "@/components/userToggle";

export default function UserPage() {
    return (
        <div>
            <h1>User Toggle Page</h1>
            <UserToggle
                initialStatus={true}
                userID={""}
            />
        </div>
    );
}