import prisma from "../../utils/prisma";
import { sendSMS } from "../../utils/sendSMS";

const sendVirtualCardSMS = async (id: string, organizationId: string) => {
  if (!organizationId) {
    throw new Error("Organization ID is required");
  }

  const record = await prisma.virtualCardAccess.findFirst({
    where: {
      id,
      user: {
        organizationId,
      },
    },
    include: {
      user: true,
      card: true,
    },
  });

  if (!record) throw new Error("Record not found");

  if (record.status === "SENT") {
    throw new Error("SMS already sent");
  }

  if (new Date() > record.expiresAt) {
    throw new Error("Link expired");
  }

  const link = `https://your-domain.com/virtual-card?token=${record.token}`;

  const message = `Hi ${record.user.name || "User"}, click to view your virtual card: ${link}`;

  try {
    // 📲 SEND SMS
    await sendSMS(record.phone, message);

    // ✅ update status
    const updated = await prisma.virtualCardAccess.update({
      where: { id },
      data: {
        status: "SENT",
        sentAt: new Date(),
      },
    });

    return updated;
  } catch (error) {
    await prisma.virtualCardAccess.update({
      where: { id },
      data: {
        status: "FAILED",
        failedAt: new Date(),
      },
    });

    throw new Error("SMS sending failed");
  }
};

const getVirtualFormBD = async (organizationId: string) => {
  if (!organizationId) {
    throw new Error("Organization ID is required");
  }

  const record = await prisma.virtualCardAccess.findMany({
    where: {
      user: {
        organizationId,
      },
    },
    include: {
      user: true,
      card: true,
    },
  });

  return record;
};

export const VirtualCardAccessServices = {
  sendVirtualCardSMS,
  getVirtualFormBD,
};