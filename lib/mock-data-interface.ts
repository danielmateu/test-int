export interface mockDataInterface {
    id: number;
    name: string;
    price: string;
    date: Date | null | string;
}

export class ProductAdapter {
    static adapt(data: any): mockDataInterface {
        return {
            id: data.ID_PROD,
            name: data.Name_Desc ? data.Name_Desc.charAt(0).toUpperCase() + data.Name_Desc.slice(1).toLowerCase() : "",
            price: data.PRICE_val ? parseFloat(data.PRICE_val).toFixed(2) : "0.00",
            date: data.created_at ? new Date(data.created_at).toLocaleDateString() : null,
        };
    }
}
