import { supabase } from "@/lib/supabase";

const BUCKET_NAME = "product-images";

export async function uploadProductImage(
  file: File,
  productId: string
): Promise<string> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${productId}-${Date.now()}.${fileExt}`;
  const filePath = `products/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw uploadError;

  // Get public URL
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function deleteProductImage(filePath: string): Promise<void> {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath]);

  if (error) throw error;
}

export function getImagePath(publicUrl: string): string {
  // Extract path from public URL for deletion purposes
  const matches = publicUrl.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/);
  return matches ? matches[1] : publicUrl;
}
