import { supabase } from "@/integrations/supabase/client";
import { Address } from "@/types/enhanced-marketplace";

export class AddressService {
  static async getUserAddresses(userId: string): Promise<Address[]> {
    try {
      // For now, we'll get addresses from the orders table
      // In a real implementation, we would have a dedicated addresses table
      const { data, error } = await supabase
        .from('orders')
        .select('shipping_address, billing_address')
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .not('shipping_address', 'is', null);

      if (error) {
        console.error("Error fetching user addresses:", error);
        return [];
      }

      // Extract unique addresses from orders
      const addresses: Address[] = [];
      const addressMap = new Map<string, Address>();
      
      data.forEach(order => {
        if (order.shipping_address) {
          const addressKey = JSON.stringify(order.shipping_address);
          if (!addressMap.has(addressKey)) {
            const address: Address = {
              id: `addr-${Date.now()}-${Math.random()}`,
              userId: userId,
              fullName: order.shipping_address.fullName || "",
              company: order.shipping_address.company || "",
              addressLine1: order.shipping_address.addressLine1 || "",
              addressLine2: order.shipping_address.addressLine2 || "",
              city: order.shipping_address.city || "",
              state: order.shipping_address.state || "",
              postalCode: order.shipping_address.postalCode || "",
              country: order.shipping_address.country || "",
              phone: order.shipping_address.phone || "",
              isDefault: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            addressMap.set(addressKey, address);
            addresses.push(address);
          }
        }
      });

      return addresses;
    } catch (error) {
      console.error("Error in getUserAddresses:", error);
      return [];
    }
  }

  static async addAddress(userId: string, address: Omit<Address, "id" | "userId" | "createdAt" | "updatedAt">): Promise<Address> {
    try {
      // In a real implementation, we would insert into a dedicated addresses table
      // For now, we'll just return the address with an ID
      const newAddress: Address = {
        id: `addr-${Date.now()}`,
        userId: userId,
        ...address,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return newAddress;
    } catch (error) {
      console.error("Error in addAddress:", error);
      throw error;
    }
  }

  static async updateAddress(addressId: string, updates: Partial<Address>): Promise<Address> {
    try {
      // In a real implementation, we would update the address in the database
      // For now, we'll just return the updates with the ID
      const updatedAddress: Address = {
        id: addressId,
        userId: updates.userId || "",
        fullName: updates.fullName || "",
        company: updates.company || "",
        addressLine1: updates.addressLine1 || "",
        addressLine2: updates.addressLine2 || "",
        city: updates.city || "",
        state: updates.state || "",
        postalCode: updates.postalCode || "",
        country: updates.country || "",
        phone: updates.phone || "",
        isDefault: updates.isDefault || false,
        createdAt: updates.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return updatedAddress;
    } catch (error) {
      console.error("Error in updateAddress:", error);
      throw error;
    }
  }

  static async deleteAddress(addressId: string): Promise<boolean> {
    try {
      // In a real implementation, we would delete the address from the database
      // For now, we'll just return true
      return true;
    } catch (error) {
      console.error("Error in deleteAddress:", error);
      return false;
    }
  }

  static async setDefaultAddress(userId: string, addressId: string): Promise<boolean> {
    try {
      // In a real implementation, we would update the default address in the database
      // For now, we'll just return true
      return true;
    } catch (error) {
      console.error("Error in setDefaultAddress:", error);
      return false;
    }
  }
}