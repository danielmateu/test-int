// Simulamos lo que haría una mutación de GraphQl

export const mockToggleUserMutation = async (userID: string, newStatus: boolean) => {
    return new Promise<void>((resolve, reject) => {
        console.log(`Sending info to server ${userID} and ${newStatus}`)

        setTimeout(() => {

            // Simulamos fallo aleatorio
            const shouldFail = Math.random() < 0.5;

            if (shouldFail) {
                console.log("Algo ha fallado en el servidor")
                reject("Error updating user status on server");
            }

            console.log("Server updated successfully")
            resolve();

        }, 1500)
    })
}