import { supabase } from "@/integrations/supabase/client";
import type { Order, OrderItem, OrderStatus, PaymentStatus } from "@/types/enhanced-marketplace";

export class OrderService {
  static async getUserOrders(userId: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*),
          products(*)
        `)
        .eq('buyer_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching user orders:", error);
        return [];
      }

      return data.map((order: any) => ({
        id: order.id,
        buyerId: order.buyer_id,
        sellerId: order.seller_id,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        orderNumber: order.order_number,
        orderType: order.order_type,
        items: (order.order_items || []).map((item: any) => ({
          productId: item.product_id,
          variantId: item.variant_id,
          productName: item.product_name,
          productImage: item.product_image,
          sellerId: item.seller_id,
          sellerName: item.seller_name,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalPrice: item.total_price,
          selectedVariants: item.selected_variants,
          customOptions: item.custom_options,
          status: item.status,
          downloadUrl: item.download_url,
          licenseKey: item.license_key,
          deliveryDate: item.delivery_date,
          serviceNotes: item.service_notes,
        })),
        subtotal: order.subtotal,
        shippingCost: order.shipping_cost,
        taxAmount: order.tax_amount,
        discountAmount: order.discount_amount,
        discountCode: order.discount_code,
        totalAmount: order.total_amount,
        paymentMethod: order.payment_method,
        paymentCurrency: order.payment_currency,
        paymentStatus: order.payment_status as PaymentStatus,
        escrowId: order.escrow_id,
        paymentTransactionId: order.payment_transaction_id,
        shippingAddress: order.shipping_address,
        billingAddress: order.billing_address,
        shippingMethod: order.shipping_method,
        trackingNumber: order.tracking_number,
        trackingUrl: order.tracking_url,
        estimatedDelivery: order.estimated_delivery,
        actualDelivery: order.actual_delivery,
        downloadUrls: order.download_urls,
        downloadExpiresAt: order.download_expires_at,
        downloadCount: order.download_count,
        downloadLimit: order.download_limit,
        status: order.status as OrderStatus,
        fulfillmentStatus: order.fulfillment_status,
        requiresShipping: order.requires_shipping,
        autoCompleteAfterDays: order.auto_complete_after_days,
        chatThreadId: order.chat_thread_id,
        customerNotes: order.customer_notes,
        sellerNotes: order.seller_notes,
        adminNotes: order.admin_notes,
        confirmedAt: order.confirmed_at,
        processingAt: order.processing_at,
        shippedAt: order.shipped_at,
        deliveredAt: order.delivered_at,
        completedAt: order.completed_at,
        cancelledAt: order.cancelled_at,
        platformFee: order.platform_fee,
        feePercentage: order.fee_percentage,
        sellerRevenue: order.seller_revenue,
        disputeId: order.dispute_id,
        disputeReason: order.dispute_reason,
        returnRequested: order.return_requested,
        returnRequestedAt: order.return_requested_at,
        returnReason: order.return_reason,
        returnStatus: order.return_status,
        refundAmount: order.refund_amount,
        refundedAt: order.refunded_at,
        createdAt: new Date(order.created_at).toISOString(),
        updatedAt: new Date(order.updated_at).toISOString(),
      }));
    } catch (error) {
      console.error("Error in getUserOrders:", error);
      return [];
    }
  }

  static async getSellerOrders(sellerId: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*),
          products(*)
        `)
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching seller orders:", error);
        return [];
      }

      return data.map((order: any) => ({
        id: order.id,
        buyerId: order.buyer_id,
        sellerId: order.seller_id,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        orderNumber: order.order_number,
        orderType: order.order_type,
        items: (order.order_items || []).map((item: any) => ({
          productId: item.product_id,
          variantId: item.variant_id,
          productName: item.product_name,
          productImage: item.product_image,
          sellerId: item.seller_id,
          sellerName: item.seller_name,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalPrice: item.total_price,
          selectedVariants: item.selected_variants,
          customOptions: item.custom_options,
          status: item.status,
          downloadUrl: item.download_url,
          licenseKey: item.license_key,
          deliveryDate: item.delivery_date,
          serviceNotes: item.service_notes,
        })),
        subtotal: order.subtotal,
        shippingCost: order.shipping_cost,
        taxAmount: order.tax_amount,
        discountAmount: order.discount_amount,
        discountCode: order.discount_code,
        totalAmount: order.total_amount,
        paymentMethod: order.payment_method,
        paymentCurrency: order.payment_currency,
        paymentStatus: order.payment_status as PaymentStatus,
        escrowId: order.escrow_id,
        paymentTransactionId: order.payment_transaction_id,
        shippingAddress: order.shipping_address,
        billingAddress: order.billing_address,
        shippingMethod: order.shipping_method,
        trackingNumber: order.tracking_number,
        trackingUrl: order.tracking_url,
        estimatedDelivery: order.estimated_delivery,
        actualDelivery: order.actual_delivery,
        downloadUrls: order.download_urls,
        downloadExpiresAt: order.download_expires_at,
        downloadCount: order.download_count,
        downloadLimit: order.download_limit,
        status: order.status as OrderStatus,
        fulfillmentStatus: order.fulfillment_status,
        requiresShipping: order.requires_shipping,
        autoCompleteAfterDays: order.auto_complete_after_days,
        chatThreadId: order.chat_thread_id,
        customerNotes: order.customer_notes,
        sellerNotes: order.seller_notes,
        adminNotes: order.admin_notes,
        confirmedAt: order.confirmed_at,
        processingAt: order.processing_at,
        shippedAt: order.shipped_at,
        deliveredAt: order.delivered_at,
        completedAt: order.completed_at,
        cancelledAt: order.cancelled_at,
        platformFee: order.platform_fee,
        feePercentage: order.fee_percentage,
        sellerRevenue: order.seller_revenue,
        disputeId: order.dispute_id,
        disputeReason: order.dispute_reason,
        returnRequested: order.return_requested,
        returnRequestedAt: order.return_requested_at,
        returnReason: order.return_reason,
        returnStatus: order.return_status,
        refundAmount: order.refund_amount,
        refundedAt: order.refunded_at,
        createdAt: new Date(order.created_at).toISOString(),
        updatedAt: new Date(order.updated_at).toISOString(),
      }));
    } catch (error) {
      console.error("Error in getSellerOrders:", error);
      return [];
    }
  }

  static async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*),
          products(*)
        `)
        .eq('id', orderId)
        .single();

      if (error) {
        console.error("Error fetching order:", error);
        return null;
      }

      if (!data) return null;

      return {
        id: data.id,
        buyerId: data.buyer_id,
        sellerId: data.seller_id,
        customerName: data.customer_name,
        customerEmail: data.customer_email,
        orderNumber: data.order_number,
        orderType: data.order_type,
        items: (data.order_items || []).map((item: any) => ({
          productId: item.product_id,
          variantId: item.variant_id,
          productName: item.product_name,
          productImage: item.product_image,
          sellerId: item.seller_id,
          sellerName: item.seller_name,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalPrice: item.total_price,
          selectedVariants: item.selected_variants,
          customOptions: item.custom_options,
          status: item.status,
          downloadUrl: item.download_url,
          licenseKey: item.license_key,
          deliveryDate: item.delivery_date,
          serviceNotes: item.service_notes,
        })),
        subtotal: data.subtotal,
        shippingCost: data.shipping_cost,
        taxAmount: data.tax_amount,
        discountAmount: data.discount_amount,
        discountCode: data.discount_code,
        totalAmount: data.total_amount,
        paymentMethod: data.payment_method,
        paymentCurrency: data.payment_currency,
        paymentStatus: data.payment_status as PaymentStatus,
        escrowId: data.escrow_id,
        paymentTransactionId: data.payment_transaction_id,
        shippingAddress: data.shipping_address,
        billingAddress: data.billing_address,
        shippingMethod: data.shipping_method,
        trackingNumber: data.tracking_number,
        trackingUrl: data.tracking_url,
        estimatedDelivery: data.estimated_delivery,
        actualDelivery: data.actual_delivery,
        downloadUrls: data.download_urls,
        downloadExpiresAt: data.download_expires_at,
        downloadCount: data.download_count,
        downloadLimit: data.download_limit,
        status: data.status as OrderStatus,
        fulfillmentStatus: data.fulfillment_status,
        requiresShipping: data.requires_shipping,
        autoCompleteAfterDays: data.auto_complete_after_days,
        chatThreadId: data.chat_thread_id,
        customerNotes: data.customer_notes,
        sellerNotes: data.seller_notes,
        adminNotes: data.admin_notes,
        confirmedAt: data.confirmed_at,
        processingAt: data.processing_at,
        shippedAt: data.shipped_at,
        deliveredAt: data.delivered_at,
        completedAt: data.completed_at,
        cancelledAt: data.cancelled_at,
        platformFee: data.platform_fee,
        feePercentage: data.fee_percentage,
        sellerRevenue: data.seller_revenue,
        disputeId: data.dispute_id,
        disputeReason: data.dispute_reason,
        returnRequested: data.return_requested,
        returnRequestedAt: data.return_requested_at,
        returnReason: data.return_reason,
        returnStatus: data.return_status,
        refundAmount: data.refund_amount,
        refundedAt: data.refunded_at,
        createdAt: new Date(data.created_at).toISOString(),
        updatedAt: new Date(data.updated_at).toISOString(),
      };
    } catch (error) {
      console.error("Error in getOrderById:", error);
      return null;
    }
  }

  static async updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        console.error("Error updating order status:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in updateOrderStatus:", error);
      return false;
    }
  }

  static async confirmDelivery(orderId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'delivered',
          delivered_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        console.error("Error confirming delivery:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in confirmDelivery:", error);
      return false;
    }
  }

  static async cancelOrder(orderId: string, reason: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'cancelled',
          cancelled_reason: reason,
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        console.error("Error cancelling order:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in cancelOrder:", error);
      return false;
    }
  }

  static async requestReturn(orderId: string, reason: string): Promise<boolean> {
    try {
      // In a real implementation, this would create a return request
      console.log(`Return requested for order ${orderId} with reason: ${reason}`);
      return true;
    } catch (error) {
      console.error("Error requesting return:", error);
      return false;
    }
  }

  static async raiseDispute(orderId: string, reason: string, description: string): Promise<boolean> {
    try {
      // In a real implementation, this would create a dispute
      console.log(`Dispute raised for order ${orderId} with reason: ${reason}`);
      return true;
    } catch (error) {
      console.error("Error raising dispute:", error);
      return false;
    }
  }

  static async trackOrder(orderId: string): Promise<any> {
    try {
      // In a real implementation, this would fetch tracking information
      console.log(`Tracking order ${orderId}`);
      return {
        status: "in_transit",
        location: "Distribution Center",
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      };
    } catch (error) {
      console.error("Error tracking order:", error);
      return null;
    }
  }

  static async downloadDigitalProduct(orderId: string, productId: string): Promise<string> {
    try {
      // In a real implementation, this would generate a download URL
      console.log(`Downloading product ${productId} from order ${orderId}`);
      return "https://example.com/download-link";
    } catch (error) {
      console.error("Error downloading digital product:", error);
      throw error;
    }
  }
}

export const orderService = new OrderService();