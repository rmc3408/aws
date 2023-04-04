export enum OrderEventType {
  CREATED = "ORDER_CREATED",
  DELETED = "ORDER_DELETED"
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

type OrderEventInfo = {
  orderId: string
  messageId: string
  productCodes: Array<string>
}

export interface OrderEventDatabase {
  pk: string
  sk: string
  email: string
  createdAt: number
  requestId: string
  eventType: OrderEventType
  info: OrderEventInfo
  ttl: number
}