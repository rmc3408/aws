export enum OrderEventType {
  CREATED = "ORDER EVENT CREATED",
  DELETED = "ORDER EVENT DELELED"
}

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

export interface OrderEvent {
  email: string
  orderId: string
  shipping: Shipping
  billing: Billing
  productCode: Array<string>
  requestId: string
}

export interface Envelope {
  eventType: OrderEventType,
  data: OrderEvent
}