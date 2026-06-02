'use client'

import { useMemo, useState } from 'react';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';

interface legacyResponseProps {
    legacyResponse?: any[];
}

export default function ProductList({ legacyResponse = [] }: legacyResponseProps) {

    const products = useMemo(() => {
        return legacyResponse.map((product: any) => ({
            id: product?.id || Math.random().toString(),
            name: product?.name || '',
            price: product?.price || 0,
            date: product?.date || null
        }));
    }, [legacyResponse]);

    const [searchTerm, setSearchTerm] = useState<string>("");

    const filteredProducts = useMemo(() => {
        return products.filter((product: any) => 
            product.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [products, searchTerm]);

    return (
        <div className="space-y-12">
            <Input
                type="text"
                placeholder='Filtra por nombre'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-96'
            />

            <ul>
                {
                    filteredProducts.map((product: any) => (
                        <li key={product.id}>
                            <Card>
                                <CardContent>
                                    {product.name} - {product.price}€ - {product.date ? product.date.toString() : "Sin fecha"}
                                </CardContent>
                            </Card>
                        </li>
                    ))
                }
            </ul>
        </div>
    );
}