import { supabase } from "@/lib/supabase";

export interface ProductVariant {
  id: string;
  name: string;
  quantity: number;
  price?: number;
  image_url?: string; // imagen principal/portada de la variante (compatibilidad)
  image_urls?: string[]; // todas las fotos de la variante, en orden (la primera = portada)
  nutrition_facts_url?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
  image_url: string;
  has_variants: boolean;
  variants: ProductVariant[];
  is_bestseller: boolean;
  created_at: string;
  updated_at: string;
  // Aún no hay datos reales de reseñas en el proyecto. Quedan opcionales para
  // que la UI de rating (ProductCard) los muestre en cuanto existan, sin
  // inventar valores mientras tanto.
  rating?: number;
  reviewCount?: number;
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createProduct(
  product: Omit<Product, "id" | "created_at" | "updated_at">,
): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .insert([product])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProduct(
  id: string,
  product: Partial<Omit<Product, "id" | "created_at">>,
): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .update({
      ...product,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) throw error;
}
