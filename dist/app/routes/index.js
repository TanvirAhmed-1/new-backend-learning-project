"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRouter = void 0;
const express_1 = require("express");
const organization_route_1 = require("../modules/organization/organization.route");
const staff_route_1 = require("../modules/staff/staff.route");
const counter_routes_1 = require("../modules/counter/counter.routes");
const serviceType_route_1 = require("../modules/serviceType/serviceType.route");
const service_route_1 = require("../modules/service/service.route");
const card_route_1 = require("../modules/card/card.route");
const user_route_1 = require("../modules/user/user.route");
const transaction_route_1 = require("../modules/transaction/transaction.route");
const event_route_1 = require("../modules/event/event.route");
const eventQuota_route_1 = require("../modules/eventQuota/eventQuota.route");
const virtualCardAccess_route_1 = require("../modules/virtualCardAccess/virtualCardAccess.route");
const subscription_route_1 = require("../modules/subscription/subscription.route");
const dashboard_route_1 = require("../modules/dashboard/dashboard.route");
const router = (0, express_1.Router)();
const allRouters = [
    organization_route_1.OrganizationRouter,
    staff_route_1.StaffRoutes,
    counter_routes_1.CounterRoutes,
    serviceType_route_1.ServiceTypeRoutes,
    service_route_1.ServiceRoutes,
    card_route_1.CardRoutes,
    user_route_1.UserRoutes,
    transaction_route_1.TransactionRoutes,
    event_route_1.eventRoutes,
    eventQuota_route_1.eventQuotaRoutes,
    virtualCardAccess_route_1.VirtualCardAccessRoutes,
    subscription_route_1.SubscriptionRoutes,
    dashboard_route_1.DashboardRoutes,
];
allRouters.forEach((route) => router.use(route));
exports.BaseRouter = router;
