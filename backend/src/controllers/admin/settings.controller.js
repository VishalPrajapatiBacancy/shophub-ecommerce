import { supabase } from '../../config/database.js';

const DEFAULT_SETTINGS = {
  storeName: 'ShopHub',
  storeEmail: 'admin@shophub.com',
  storePhone: '+1 234 567 8900',
  storeAddress: '123 Main St, New York, NY 10001',
  currency: 'USD',
  currencySymbol: '$',
  timezone: 'America/New_York',
  taxRate: 8,
  taxEnabled: true,
  freeShippingThreshold: 50,
  defaultShippingRate: 5.99,
  expressShippingRate: 15.99,
  orderPrefix: 'ORD-',
  autoConfirmOrders: false,
  lowStockThreshold: 10,
  logo: '',
  favicon: '',
  primaryColor: '#2563EB',
};

export async function getSettings(req, res) {
  try {
    const { data, error } = await supabase.from('settings').select('*').single();
    if (error && (error.code === '42P01' || error.code === 'PGRST116')) {
      return res.json({ success: true, data: DEFAULT_SETTINGS });
    }
    if (error) throw error;
    const s = data?.value || data || DEFAULT_SETTINGS;
    res.json({ success: true, data: typeof s === 'string' ? JSON.parse(s) : s });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateSettings(req, res) {
  try {
    const updates = req.body;

    // Try upsert
    const { data, error } = await supabase
      .from('settings')
      .upsert([{ id: 1, value: updates, updated_at: new Date().toISOString() }])
      .select()
      .single();

    if (error && error.code === '42P01') {
      return res.json({ success: true, data: updates });
    }
    if (error) throw error;
    res.json({ success: true, data: updates });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
