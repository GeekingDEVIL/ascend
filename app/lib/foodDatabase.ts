export type FoodSearchResult = {
  id: string;
  name: string;
  brand: string;
  servingSizeG: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  source: "openfoodfacts" | "usda" | "user";
  barcode?: string;
};

const OFF_API = "https://world.openfoodfacts.org";

export async function searchFoods(query: string, page = 1): Promise<{ results: FoodSearchResult[]; total: number }> {
  try {
    const url = `${OFF_API}/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=20&page=${page}`;
    const res = await fetch(url, { headers: { "User-Agent": "ASCEND-App/1.0" } });
    if (!res.ok) return { results: [], total: 0 };

    const data = await res.json();
    const results: FoodSearchResult[] = (data.products ?? [])
      .filter((p: any) => p.product_name && p.nutriments)
      .map((p: any) => ({
        id: p.code || p._id || "",
        name: p.product_name || "Unknown",
        brand: p.brands || "",
        servingSizeG: parseFloat(p.serving_quantity) || parseFloat(p.product_quantity) || 100,
        kcal: Math.round(p.nutriments["energy-kcal_100g"] || p.nutriments["energy-kcal"] || 0),
        protein: Math.round((p.nutriments.proteins_100g || 0) * 10) / 10,
        carbs: Math.round((p.nutriments.carbohydrates_100g || 0) * 10) / 10,
        fat: Math.round((p.nutriments.fat_100g || 0) * 10) / 10,
        fiber: Math.round((p.nutriments.fiber_100g || 0) * 10) / 10,
        source: "openfoodfacts" as const,
        barcode: p.code || undefined,
      }));

    return { results, total: data.count || results.length };
  } catch {
    return { results: [], total: 0 };
  }
}

export async function lookupBarcode(barcode: string): Promise<FoodSearchResult | null> {
  try {
    const res = await fetch(`${OFF_API}/api/v0/product/${encodeURIComponent(barcode)}.json`, {
      headers: { "User-Agent": "ASCEND-App/1.0" },
    });
    if (!res.ok) return null;

    const data = await res.json();
    if (data.status !== 1 || !data.product) return null;

    const p = data.product;
    return {
      id: barcode,
      name: p.product_name || "Unknown",
      brand: p.brands || "",
      servingSizeG: parseFloat(p.serving_quantity) || 100,
      kcal: Math.round(p.nutriments?.["energy-kcal_100g"] || 0),
      protein: Math.round((p.nutriments?.proteins_100g || 0) * 10) / 10,
      carbs: Math.round((p.nutriments?.carbohydrates_100g || 0) * 10) / 10,
      fat: Math.round((p.nutriments?.fat_100g || 0) * 10) / 10,
      fiber: Math.round((p.nutriments?.fiber_100g || 0) * 10) / 10,
      source: "openfoodfacts",
      barcode,
    };
  } catch {
    return null;
  }
}
