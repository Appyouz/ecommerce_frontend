export interface SellerProfile {
  store_name: string;
  business_email: string;
  phone_number: string;
  business_address: string;
  tax_id?: string;
  is_verified?: boolean;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "BUYER" | "SELLER";
  seller_profile?: SellerProfile;
}
