import { UserToggleProps } from "@/components/userToggle";
import { mockToggleUserMutation } from "@/utils/api";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface UserTogglerReturn {
    isActive: boolean;
    isLoading: boolean;
    error: boolean;
    handleToggle: () => Promise<void>;
}

export default function userToggler(initialStatus: boolean, userID: string | number): UserTogglerReturn {

    const previousStatus = useRef<boolean>(initialStatus)
    const [isActive, setIsActive] = useState<boolean>(initialStatus);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);

    const handleToggle = async (): Promise<void> => {
        previousStatus.current = isActive

        const newStatus: boolean = !isActive
        setIsActive(newStatus)
        setError(false)
        setIsLoading(true)

        try {
            await mockToggleUserMutation(String(userID), newStatus)

            toast("Everything went well", {
                description: `User status updated to ${newStatus ? "Active" : "Inactive"}`,
            })

        } catch (error) {
            setIsActive(previousStatus.current)
            setError(true)
            console.log("Error updating user status:", error);
            toast("Something went wrong", {
                description: "Error updating user status. Please try again.",
            })
        }

        setIsLoading(false)
    }

    return {
        isActive,
        isLoading,
        error,
        handleToggle
    }
}