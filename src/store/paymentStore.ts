import { Order, Payment, PaymentStatus } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * PaymentStore - Manages orders and payments
 * Features:
 * - Create and track service orders
 * - Update order status through workflow
 * - Process payments (Stripe integration coming soon)
 * - Retrieve orders by client or freelancer
 */
interface PaymentState {
  orders: Order[];
  payments: Payment[];
  
  // Order management
  /** Create a new service order */
  createOrder: (order: Omit<Order, "id" | "createdAt" | "updatedAt">) => Order;
  /** Update order details */
  updateOrder: (id: string, updates: Partial<Order>) => void;
  /** Update order workflow status */
  updateOrderStatus: (id: string, status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled") => void;
  /** Get all orders placed by a client */
  getOrdersByClient: (clientId: string) => Order[];
  /** Get all orders assigned to a freelancer */
  getOrdersByFreelancer: (freelancerId: string) => Order[];
  /** Get a specific order by ID */
  getOrder: (id: string) => Order | undefined;
  
  // Payment processing
  /** Create a payment record */
  createPayment: (payment: Omit<Payment, "id" | "createdAt" | "updatedAt">) => Payment;
  /** Update payment status (pending, completed, failed, etc.) */
  updatePaymentStatus: (paymentId: string, status: PaymentStatus) => void;
  /** Get all payments made by a client */
  getPaymentsByClient: (clientId: string) => Payment[];
  /** Get all payments received by a freelancer */
  getPaymentsByFreelancer: (freelancerId: string) => Payment[];
}

export const usePaymentStore = create<PaymentState>()(
  persist(
    (set, get) => ({
  orders: [],
  payments: [],

  // Órdenes
  createOrder: (orderData) => {
    const order: Order = {
      ...orderData,
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({
      orders: [...state.orders, order],
    }));
    return order;
  },

  updateOrder: (id, updates) => {
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === id
          ? { ...order, ...updates, updatedAt: new Date() }
          : order
      ),
    }));
  },

  updateOrderStatus: (id, status) => {
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === id
          ? { ...order, status, updatedAt: new Date() }
          : order
      ),
    }));
  },

  getOrdersByClient: (clientId) => {
    return get().orders.filter((order) => order.clientId === clientId);
  },

  getOrdersByFreelancer: (freelancerId) => {
    return get().orders.filter((order) => order.freelancerId === freelancerId);
  },

  getOrder: (id) => {
    return get().orders.find((order) => order.id === id);
  },

  // Pagos
  createPayment: (paymentData) => {
    const payment: Payment = {
      ...paymentData,
      id: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({
      payments: [...state.payments, payment],
    }));
    return payment;
  },

  updatePaymentStatus: (paymentId, status) => {
    set((state) => ({
      payments: state.payments.map((payment) =>
        payment.id === paymentId
          ? { ...payment, status, updatedAt: new Date() }
          : payment
      ),
    }));
  },

  getPaymentsByClient: (clientId) => {
    return get().payments.filter((payment) => payment.clientId === clientId);
  },

  getPaymentsByFreelancer: (freelancerId) => {
    return get().payments.filter(
      (payment) => payment.freelancerId === freelancerId
    );
  },
    }),
    {
      name: "payment-store",
    }
  )
);
