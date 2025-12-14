export interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  orderId: string;
  date: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  paymentMethod: 'sbp' | 'tbank' | 'sber';
  deliveryAddress: {
    fullName: string;
    address: string;
    city: string;
    phone: string;
  };
}

const ORDERS_KEY = 'boxpaper_orders';

export const saveOrder = (order: Order): void => {
  const orders = getOrders();
  orders.unshift(order);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
};

export const getOrders = (): Order[] => {
  const ordersJson = localStorage.getItem(ORDERS_KEY);
  if (!ordersJson) return [];
  try {
    return JSON.parse(ordersJson);
  } catch {
    return [];
  }
};

export const deleteOrder = (orderId: string): void => {
  const orders = getOrders();
  const filtered = orders.filter(order => order.orderId !== orderId);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(filtered));
};

export const updateOrderStatus = (orderId: string, status: Order['status']): void => {
  const orders = getOrders();
  const updated = orders.map(order => 
    order.orderId === orderId ? { ...order, status } : order
  );
  localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
};
