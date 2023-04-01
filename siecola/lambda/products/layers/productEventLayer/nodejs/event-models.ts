export enum ProductEventTypeEnum {
  CREATED = 'PRODUCT_CREATED',
  UPDATED = 'PRODUCT_UPDATED',
  DELETED = 'PRODUCT_DELETED'
}

export interface ProductEvent {
  requestId: string
  eventType: ProductEventTypeEnum
  productId: string
  productCode: string
  productPrice: number
  email: string
}

export interface EventProductTableType {
  pk: string;
  sk: string;
  email: string;
  requestId: string;
  eventType: ProductEventTypeEnum;
  info: Pick<ProductEvent, 'productPrice' | 'productId'>;
  ttl: number;
  createdAt: number;
}

