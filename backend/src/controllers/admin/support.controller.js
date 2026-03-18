import { randomUUID } from 'node:crypto';
import { supabase } from '../../config/database.js';

export async function listTickets(req, res) {
  try {
    const { page = 1, limit = 20, status, priority, search } = req.query;
    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;

    let query = supabase.from('support_tickets').select('*', { count: 'exact' });
    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);
    if (search) query = query.or(`subject.ilike.%${search}%,customer_name.ilike.%${search}%`);
    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data, count, error } = await query;
    if (error && error.code === '42P01') {
      return res.json({ success: true, data: [], total: 0, page: 1, limit: Number(limit), totalPages: 0 });
    }
    if (error) throw error;

    const formatted = (data || []).map(t => ({
      id: t.id,
      ticketNumber: t.ticket_number || `TKT-${t.id?.slice(0, 6)}`,
      subject: t.subject,
      customerId: t.user_id,
      customerName: t.customer_name || 'Customer',
      customerEmail: t.customer_email || '',
      category: t.category || 'general',
      priority: t.priority || 'medium',
      status: t.status || 'open',
      assignedTo: t.assigned_to,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
    }));

    res.json({ success: true, data: formatted, total: count || 0, page: Number(page), limit: Number(limit), totalPages: Math.ceil((count || 0) / Number(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getTicket(req, res) {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('support_tickets').select('*').eq('id', id).single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateTicket(req, res) {
  try {
    const { id } = req.params;
    const { status, priority, assignedTo } = req.body;
    const updates = { updated_at: new Date().toISOString() };
    if (status) updates.status = status;
    if (priority) updates.priority = priority;
    if (assignedTo !== undefined) updates.assigned_to = assignedTo;

    const { data, error } = await supabase.from('support_tickets').update(updates).eq('id', id).select().single();
    if (error && error.code === '42P01') return res.json({ success: true, data: { id, ...updates } });
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function createTicket(req, res) {
  try {
    const { subject, customerName, customerEmail, category, priority, message } = req.body;
    if (!subject) return res.status(400).json({ success: false, message: 'Subject is required' });

    const record = {
      ticket_number: `TKT-${Date.now().toString().slice(-6)}`,
      subject,
      customer_name: customerName || '',
      customer_email: customerEmail || '',
      category: category || 'general',  // allowed: general,order,payment,shipping,product,return,refund,technical,other
      priority: priority || 'medium',
      status: 'open',
      message: message || '',
      messages: message ? [{ sender: 'customer', text: message, created_at: new Date().toISOString() }] : [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('support_tickets').insert([record]).select().single();
    if (error && error.code === '42P01') return res.json({ success: true, data: { id: randomUUID(), ...record } });
    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
