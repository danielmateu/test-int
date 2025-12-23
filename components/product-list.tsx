'use client'

import { ProductAdapter } from '@/lib/mock-data-interface';
import { legacyResponse } from '@/lib/mockData';
import { useMemo, useState } from 'react';
import { Input } from './ui/input';

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
        <div>
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
                            {product.name} - {product.price} - {product.date ? product.date.toString() : "Sin fecha"}
                        </li>
                    ))
                }
            </ul>


        </div>
    );
}