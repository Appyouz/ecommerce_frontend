import ProductDetailPage from "@/ui/product-detail";

type ProductPageProps = {
  params: {
    id: string; // The 'id' from the URL /products/[id] will be a string
  };
};
export default function Page({ params }: ProductPageProps) {
  return (
    <div>
      <h1>Product Detail</h1>
      <ProductDetailPage params={params} />
    </div>
  )
}
