import ProductList from "@/components/product-list";
import { Button } from "@/components/ui/button";
import { legacyResponse } from "@/lib/mockData";
import Link from "next/link";

export default function HomePage() {

    // console.log(legacyResponse);

    return (
        <div className="p-10">
            <h1>Pagina Home, aquí mostraremos los datos recibidos</h1>

            <ProductList legacyResponse={legacyResponse} />

            <Button variant="ghost" >
                <Link
                    href={'/'}
                >
                    Volver a home
                </Link>
            </Button>
        </div>
    );
}