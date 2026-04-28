import { Router } from "express";
import { OrganizationRouter } from "../modules/organization/organization.route";
import { StaffRoutes } from "../modules/staff/staff.route";
import { CounterRoutes } from "../modules/counter/counter.routes";
import { ServiceTypeRoutes } from "../modules/serviceType/serviceType.route";
import { ServiceRoutes } from "../modules/service/service.route";
import { CardRoutes } from "../modules/card/card.route";
import { UserRoutes } from "../modules/user/user.route";
import { TransactionRoutes } from "../modules/transaction/transaction.route";
import { eventRoutes } from "../modules/event/event.route";
import { eventQuotaRoutes } from "../modules/eventQuota/eventQuota.route";

const router = Router();

const allRouters = [
  OrganizationRouter,
  StaffRoutes,
  CounterRoutes,
  ServiceTypeRoutes,
  ServiceRoutes,
  CardRoutes,
  UserRoutes,
  TransactionRoutes,
  eventRoutes,
  eventQuotaRoutes,
];

allRouters.forEach((route) => router.use(route));

export const BaseRouter = router;
