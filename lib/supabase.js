import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helpers
export const signIn = async (email, password) => {
  return await supabase.auth.signInWithPassword({ email, password });
};

export const signUp = async (email, password, userData) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: userData }
  });
  
  if (!error && data.user) {
    await supabase.from('user_profiles').insert({
      id: data.user.id,
      full_name: userData.full_name,
      role: userData.role || 'customer'
    });
  }
  
  return { data, error };
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};

// Product operations
export const getProducts = async (filters = {}) => {
  let query = supabase.from('products').select('*').eq('is_active', true);
  
  if (filters.room_type) query = query.eq('room_type', filters.room_type);
  if (filters.finish_type) query = query.eq('finish_type', filters.finish_type);
  if (filters.color_tone) query = query.eq('color_tone', filters.color_tone);
  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`);
  }
  if (filters.min_price) query = query.gte('price_per_sqft', filters.min_price);
  if (filters.max_price) query = query.lte('price_per_sqft', filters.max_price);
  
  return await query.order('created_at', { ascending: false });
};

export const getProductById = async (id) => {
  return await supabase.from('products').select('*').eq('id', id).single();
};

export const createProduct = async (productData) => {
  return await supabase.from('products').insert(productData).select();
};

export const updateProduct = async (id, productData) => {
  return await supabase.from('products').update(productData).eq('id', id).select();
};

export const deleteProduct = async (id) => {
  return await supabase.from('products').update({ is_active: false }).eq('id', id);
};

// Quotation operations
export const createQuotation = async (quotationData) => {
  return await supabase.from('quotations').insert(quotationData).select();
};

export const getQuotations = async (userId = null) => {
  let query = supabase.from('quotations').select('*').order('created_at', { ascending: false });
  
  if (userId) {
    query = query.eq('user_id', userId);
  }
  
  return await query;
};

export const updateQuotationStatus = async (id, status) => {
  return await supabase.from('quotations').update({ status }).eq('id', id);
};

// Enquiry operations
export const createEnquiry = async (enquiryData) => {
  return await supabase.from('enquiries').insert(enquiryData).select();
};

export const getEnquiries = async () => {
  return await supabase.from('enquiries').select('*').order('created_at', { ascending: false });
};

export const updateEnquiryStatus = async (id, status) => {
  return await supabase.from('enquiries').update({ status }).eq('id', id);
};

// Image upload
export const uploadProductImage = async (file, fileName) => {
  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });
  
  if (error) return { error };
  
  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(fileName);
  
  return { data: publicUrl };
};