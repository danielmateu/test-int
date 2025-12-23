'use client'

import { ProductAdapter } from '@/lib/mock-data-interface';
import { legacyResponse } from '@/lib/mockData';
import { useMemo, useState } from 'react';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';

interface legacyResponseProps {
    legacyResponse: typeof legacyResponse;
}

export default function ProductList({ legacyResponse }: legacyResponseProps) {

    const products = legacyResponse.map(ProductAdapter.adapt)

    const [searchTerm, setSearchTerm] = useState<string>("");

    const filteredProducts = useMemo(() => {
        return products.filter(product => product.name.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase()))
    }, [products, searchTerm]);

    // console.log({ filteredProducts });

    return (
        <div className="space-y-12">
            {/* <h1>Hello Page</h1> */}
            <Input
                type="text"
                placeholder='Filtra por nombre'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-96'
            />

            <ul>
                {
                    filteredProducts.map(product => (
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