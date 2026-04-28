import { randomBytes } from "crypto";


export const getToday = () => new Date().toISOString().split("T")[0];

export const updateVisit = (existing: any) => {
  const today = getToday();
  const visits = existing && typeof existing === "object" ? existing : {};

  visits[today] = (visits[today] || 0) + 1;

  return visits;
};


// card

const generateCardUid = () => {
  return randomBytes(7).toString("hex").toUpperCase(); 
};
export const generateCardCode = () => {
  return `C-${randomBytes(4).toString("hex").toUpperCase()}`;
};

 export const generateUniqueCardData = async (tx: any) => {
  let cardUid;
  let cardCode;
  let exists = true;

  while (exists) {
    cardUid = generateCardUid();
    cardCode = generateCardCode();

    const found = await tx.card.findFirst({
      where: {
        OR: [{ cardUid }, { cardCode }],
      },
    });

    if (!found) {
      exists = false;
    }
  }

  return { cardUid, cardCode };
};
