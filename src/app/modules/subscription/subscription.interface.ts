import { BillingCycle, SubscriptionStatus, PaymentStatus } from "@prisma/client";

export interface ICreateSubscriptionPlan {
  name: string;
  description?: string;
  price: number;
  billingCycle?: BillingCycle;
  maxUsers?: number;
  maxEvents?: number;
  maxStaffs?: number;
}

export interface IBuySubscription {
  organizationId: string;
  planId: string;
  paymentMethod: string;
  transactionId: string;
}

export interface ILogPayment {
  subscriptionId: string;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  billingPeriodStart: Date;
  billingPeriodEnd: Date;
  status: PaymentStatus;
}
