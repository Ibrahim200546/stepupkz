// Database types for Supabase tables

export interface Profile {
  id: string;
  first_name?: string;
  last_name?: string;
  nickname?: string;
  avatar_url?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ChatMember {
  id: string;
  chat_id: string;
  user_id: string;
  joined_at: string;
  profiles?: Profile;
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  attachment_url?: string;
  attachment_type?: string;
  created_at: string;
  updated_at?: string;
  deleted?: boolean;
  sender?: Profile;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_variant_id: string;
  quantity: number;
  price: number;
  product_variants?: {
    size?: string;
    products: {
      name: string;
      product_images: Array<{ url: string }>;
    };
  };
}

export interface Order {
  id: string;
  user_id: string;
  cart_id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  shipping_address?: string;
  created_at: string;
  updated_at?: string;
  order_items: OrderItem[];
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category?: string;
  stock?: number;
  vendor_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: string;
  email?: string;
  role?: string;
  created_at?: string;
}

export interface Vendor {
  id: string;
  owner_id: string;
  name: string;
  description?: string;
  phone?: string;
  address?: string;
  logo?: string;
  verified: boolean;
  created_at: string;
}

export interface MessageReport {
  id: string;
  message_id: string;
  reported_by: string;
  reason: string;
  status: 'open' | 'reviewed' | 'resolved';
  created_at: string;
  reviewed_at?: string;
  message?: Message;
  reporter?: Profile;
}

export interface UserPresence {
  user_id: string;
  status: 'online' | 'offline';
  last_seen: string;
  updated_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}
