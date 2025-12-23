
"use client";

import { mockToggleUserMutation } from "@/utils/api";
import { useRef, useState } from "react";
import { Button } from "./ui/button";
import { Alert } from "./ui/alert";
import { toast } from "sonner"
import userToggler from "@/hooks/userToggle";

export interface UserToggleProps {
    initialStatus: boolean
    userID: string
}

export default function UserToggle({ initialStatus = false, userID = '' }: UserToggleProps) {

    const { isActive, isLoading, error, handleToggle } = userToggler(initialStatus, userID);

    // const previousStatus = useRef(initialStatus)
    // const [isActive, setIsActive] = useState<boolean>(initialStatus);
    // const [isLoading, setIsLoading] = useState<boolean>(false);
    // const [error, setError] = useState<boolean>(false);

    // const handleToggle = async (): Promise<void> => {
    //     previousStatus.current = isActive

    //     const newStatus: boolean = !isActive
    //     setIsActive(newStatus)
    //     setError(false)
    //     setIsLoading(true)

    //     try {
    //         await mockToggleUserMutation(userID, newStatus)

    //         toast("Everything went well", {
    //             description: `User status updated to ${newStatus ? "Active" : "Inactive"}`,
    //         })

    //     } catch (error) {
    //         setIsActive(previousStatus.current)
    //         setError(true)
    //         console.log("Error updating user status:", error);
    //         toast("Something went wrong", {
    //             description: "Error updating user status. Please try again.",
    //         })
    //     }

    //     setIsLoading(false)
    // }
    return (
        <>
            <div className="flex flex-col">
                <Button
                    onClick={handleToggle}
                    disabled={isLoading}
                >
                    {isActive ? "User is Active" : "User is Inactive"}
                </Button>


            </div>
            {/* {
                error &&
                <div>
                    <Alert className="text-red-500 ">Error updating user status. Please try again.</Alert>
                </div>
            } */}
        </>
    )
}