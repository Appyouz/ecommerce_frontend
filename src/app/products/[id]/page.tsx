import ProductDetailPage from "@/app/ui/product-detail"

export default function page({ params }: { params: { id: string } }) {
  return (
    <div><h1>Products</h1>
      <ProductDetailPage params={params} />
    </div >
  )
}
