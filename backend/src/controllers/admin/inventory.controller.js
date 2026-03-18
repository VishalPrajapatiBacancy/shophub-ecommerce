import { supabase } from '../../config/database.js';

export async function getInventoryOverview(req, res) {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('id, title, sku, stock, status, category_id')
      .order('stock', { ascending: true });

    if (error) throw error;

    const totalProducts = products?.length || 0;
    const inStock = products?.filter(p => (p.stock || 0) > 10).length || 0;
    const lowStock = products?.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 10).length || 0;
    const outOfStock = products?.filter(p => (p.stock || 0) === 0).length || 0;

    const formatted = (products || []).map(p => ({
      id: p.id,
      name: p.title || p.name || 'Unknown',
      sku: p.sku || `SKU-${p.id?.slice(0, 8)}`,
      stock: p.stock || 0,
      status: p.stock === 0 ? 'out_of_stock' : p.stock <= 10 ? 'low_stock' : 'in_stock',
      categoryId: p.category_id,
      lowStockThreshold: 10,
    }));

    res.json({
      success: true,
      data: {
        stats: { totalProducts, inStock, lowStock, outOfStock },
        products: formatted,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateStock(req, res) {
  try {
    const { id } = req.params;
    const { adjustment, reason, notes } = req.body;

    const { data: product, error: fetchErr } = await supabase
      .from('products')
      .select('id, stock')
      .eq('id', id)
      .single();

    if (fetchErr) throw fetchErr;

    const newStock = Math.max(0, (product.stock || 0) + Number(adjustment));

    const { data, error } = await supabase
      .from('products')
      .update({ stock: newStock, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data: {
        id: data.id,
        previousStock: product.stock || 0,
        newStock,
        adjustment: Number(adjustment),
        reason,
        notes,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
