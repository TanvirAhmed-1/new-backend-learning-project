
export type ITopupTransactionRequest = {
    userId: string;
    cardUid: string;
    amount: number;
    staffId?: string;
    counterId?: string;
    organizationId?: string;
}