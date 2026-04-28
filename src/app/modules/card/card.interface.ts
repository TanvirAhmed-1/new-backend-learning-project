export interface ICreateCard {
  type: "NFC" | "RFID";
  cardUid?: string | null;
  organizationId?: string | null;
}
