
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

export default function UserToggle({ initialStatus = true, userID = '' }: UserToggleProps) {

    const { isActive, isLoading, error, handleToggle } = userToggler(initialStatus, userID);

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
        </>
    )
}