import CopyableText from "./CopyableText"
import { Link } from "react-router-dom";



const ProAttributes = (productData) => {
    let product = productData.product || {};
    
    return (
        <table className="mt-6 w-full text-sm">
            <tbody>
                <tr className="border border-purple-200 rounded-lg bg-purple-50 hover:bg-purple-100">
                    <td className="px-3 py-2 font-semibold text-purple-700 w-24 border-r border-purple-200">PRODUCT_ID:</td>
                    <td className="px-3 py-2">
                        <CopyableText className="text-purple-800 font-medium" value={product?.product_id || "N/A"} />
                    </td>
                </tr>
                <tr className="border border-purple-200 rounded-lg bg-purple-50 hover:bg-purple-100">
                    <td className="px-3 py-2 font-semibold text-purple-700 w-24 border-r border-purple-200">SKU:</td>
                    <td className="px-3 py-2">
                        <CopyableText className="text-purple-800 font-medium" value={product?.sku || "N/A"} />
                    </td>
                </tr>
                <tr className="border border-purple-200 rounded-lg bg-purple-50 hover:bg-purple-100">
                    <td className="px-3 py-2 font-semibold text-purple-700 w-24 border-r border-purple-200">Brand:</td>
                    <td className="px-3 py-2">
                        <Link to={`/brand/${product?.brand?.slug}`} className="text-purple-800 font-medium">{product?.brand?.name || "N/A"}</Link>
                    </td>
                </tr>
                <tr className="border border-purple-200 rounded-lg bg-purple-50 hover:bg-purple-100">
                    <td className="px-3 py-2 font-semibold text-purple-700 w-24 border-r border-purple-200">Category:</td>
                    <td className="px-3 py-2">
                        <Link to={`/category/${product?.category?.slug}`} className="text-purple-800 font-medium">{product?.category?.name || "N/A"}</Link>
                    </td>
                </tr>
            </tbody>
        </table>
    )
}

export default ProAttributes