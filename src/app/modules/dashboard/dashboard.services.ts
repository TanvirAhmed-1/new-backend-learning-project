import prisma from "../../utils/prisma";

const getDashboardStatsFromDB = async (organizationId: string | undefined, query: Record<string, any>) => {
  const { startDate, endDate } = query;

  // Build filter for date range in transactions
  const dateFilter: Record<string, any> = {};
  if (startDate) {
    dateFilter.gte = new Date(startDate);
  }
  if (endDate) {
    // End of day
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    dateFilter.lte = end;
  }

  // Build where conditions
  const transactionWhere: Record<string, any> = {};
  const eventWhere: Record<string, any> = {};
  const counterWhere: Record<string, any> = {};
  const userWhere: Record<string, any> = {};
  const cardWhere: Record<string, any> = {};
  const staffWhere: Record<string, any> = {};

  if (organizationId) {
    transactionWhere.organizationId = organizationId;
    eventWhere.organizationId = organizationId;
    counterWhere.organizationId = organizationId;
    userWhere.organizationId = organizationId;
    cardWhere.organizationId = organizationId;
    staffWhere.organizationId = organizationId;
  }

  if (startDate || endDate) {
    transactionWhere.createdAt = dateFilter;
    eventWhere.startDate = { gte: dateFilter.gte || new Date(0) };
    if (dateFilter.lte) {
      eventWhere.endDate = { lte: dateFilter.lte };
    }
  }

  // 1. Fetch main counts & aggregate totals
  const [
    totalEvents,
    totalCounters,
    totalUsers,
    totalCards,
    totalStaffs,
    transactionSums,
  ] = await Promise.all([
    prisma.event.count({ where: eventWhere }),
    prisma.counter.count({ where: counterWhere }),
    prisma.user.count({ where: userWhere }),
    prisma.card.count({ where: cardWhere }),
    prisma.staff.count({ where: staffWhere }),
    prisma.transaction.groupBy({
      by: ["type"],
      where: transactionWhere,
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    }),
  ]);

  // Format transaction totals
  let totalSales = 0;
  let salesCount = 0;
  let totalTopups = 0;
  let topupsCount = 0;
  let totalRefunds = 0;
  let refundsCount = 0;
  let totalPenalties = 0;
  let penaltiesCount = 0;

  transactionSums.forEach((sumGroup) => {
    const amount = Number(sumGroup._sum.amount || 0);
    const count = sumGroup._count.id || 0;
    if (sumGroup.type === "USAGE") {
      totalSales = amount;
      salesCount = count;
    } else if (sumGroup.type === "TOPUP") {
      totalTopups = amount;
      topupsCount = count;
    } else if (sumGroup.type === "REFUND") {
      totalRefunds = amount;
      refundsCount = count;
    } else if (sumGroup.type === "PENALTY") {
      totalPenalties = amount;
      penaltiesCount = count;
    }
  });

  const netBalanceFlow = totalTopups - totalSales - totalRefunds;

  // 2. Fetch User Type distribution (Regular vs Event Users)
  const userTypeDistribution = await prisma.user.groupBy({
    by: ["userType"],
    where: userWhere,
    _count: {
      id: true,
    },
  });

  // 3. Card Status distribution
  const cardStatusDistribution = await prisma.card.groupBy({
    by: ["status"],
    where: cardWhere,
    _count: {
      id: true,
    },
  });

  // 4. Daily Trend Data (Sales & Topups over time)
  const dailyTransactions = await prisma.transaction.findMany({
    where: transactionWhere,
    select: {
      createdAt: true,
      type: true,
      amount: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const dailyTrendMap: Record<string, { date: string; sales: number; topups: number; count: number }> = {};
  dailyTransactions.forEach((tx) => {
    const dateStr = tx.createdAt.toISOString().split("T")[0];
    if (!dailyTrendMap[dateStr]) {
      dailyTrendMap[dateStr] = { date: dateStr, sales: 0, topups: 0, count: 0 };
    }
    const amount = Number(tx.amount);
    if (tx.type === "USAGE") {
      dailyTrendMap[dateStr].sales += amount;
    } else if (tx.type === "TOPUP") {
      dailyTrendMap[dateStr].topups += amount;
    }
    dailyTrendMap[dateStr].count += 1;
  });

  const trendData = Object.values(dailyTrendMap);

  // 5. Popular Services (Top Selling Items)
  const popularServices = await prisma.transaction.groupBy({
    by: ["serviceId"],
    where: {
      ...transactionWhere,
      type: "USAGE",
      serviceId: { not: null },
    },
    _sum: {
      amount: true,
    },
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: "desc",
      },
    },
    take: 5,
  });

  const topServices = await Promise.all(
    popularServices.map(async (group) => {
      const service = await prisma.service.findUnique({
        where: { id: group.serviceId! },
        select: { name: true, price: true },
      });
      return {
        serviceId: group.serviceId,
        name: service?.name || "Unknown Service",
        price: service?.price || 0,
        totalSalesAmount: Number(group._sum.amount || 0),
        transactionCount: group._count.id || 0,
      };
    })
  );

  // 6. Counter Performance (Sales by Counter)
  const counterPerformance = await prisma.transaction.groupBy({
    by: ["counterId"],
    where: {
      ...transactionWhere,
      type: "USAGE",
      counterId: { not: null },
    },
    _sum: {
      amount: true,
    },
    _count: {
      id: true,
    },
    orderBy: {
      _sum: {
        amount: "desc",
      },
    },
    take: 5,
  });

  const topCounters = await Promise.all(
    counterPerformance.map(async (group) => {
      const counter = await prisma.counter.findUnique({
        where: { id: group.counterId! },
        select: { name: true },
      });
      return {
        counterId: group.counterId,
        name: counter?.name || "Unknown Counter",
        totalSalesAmount: Number(group._sum.amount || 0),
        transactionCount: group._count.id || 0,
      };
    })
  );

  return {
    overview: {
      totalEvents,
      totalCounters,
      totalUsers,
      totalCards,
      totalStaffs,
      sales: {
        totalAmount: totalSales,
        count: salesCount,
      },
      topups: {
        totalAmount: totalTopups,
        count: topupsCount,
      },
      refunds: {
        totalAmount: totalRefunds,
        count: refundsCount,
      },
      penalties: {
        totalAmount: totalPenalties,
        count: penaltiesCount,
      },
      netBalanceFlow,
    },
    userTypeDistribution,
    cardStatusDistribution,
    trendData,
    topServices,
    topCounters,
  };
};

export const DashboardServices = {
  getDashboardStatsFromDB,
};
