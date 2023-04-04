enum PaymentEnumType {
  CASH = 'CASH',
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
}

enum ShippingEnumType {
  URGENT = 'URGENT',
  ECONOMIC = 'ECONOMIC',
}

enum ShippingCarrierEnumType {
  FEDEX = 'FEDEX',
  UPS = 'UPS',
}

type Shipping = {
  type: ShippingEnumType;
  carrier: ShippingCarrierEnumType;
};

type Billing = {
  payment: PaymentEnumType;
  totalPrice: number;
};

export type OrderProduct = {
  price: number;
  code: string;
};

export interface OrderDatabase {
  pk: string;
  sk: string;
  createdAt: number;
  shipping: Shipping;
  billing: Billing;
  products?: Array<OrderProduct>;
  email: string;
}

export interface OrderResponse {
  createdAt: number;
  id: string;
  shipping?: Shipping;
  billing?: Billing;
  email: string;
  products?: Array<OrderProduct>;
}

export interface OrderRequest {
  email: string;
  productIds: string[];
  payment: PaymentEnumType;
  shipping: Shipping;
}
