"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventRoutes = void 0;
const express_1 = require("express");
const event_controller_1 = require("./event.controller");
const event_validation_1 = require("./event.validation");
const requestValidation_1 = __importDefault(require("../../middlewares/requestValidation"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
const route = (0, express_1.Router)();
// create event
route.post("/events", (0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.MANAGER), (0, requestValidation_1.default)(event_validation_1.eventSchema), event_controller_1.EventController.createEvent);
// get all events
route.get("/events", (0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.MANAGER, client_1.Role.OPERATOR), event_controller_1.EventController.getAllEvent);
// get single event
route.get("/event-users/:id", (0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.MANAGER, client_1.Role.OPERATOR), event_controller_1.EventController.getSingleEventUser);
route.get("/event-quotas/:id", (0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.MANAGER, client_1.Role.OPERATOR), event_controller_1.EventController.getSingleEventQuota);
// update event
route.put("/event/:id", (0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.MANAGER), event_controller_1.EventController.updateEvent);
// delete event
route.delete("/event/:id", (0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), event_controller_1.EventController.deleteEvent);
// lock event
route.put("/lock-event/:id", (0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.MANAGER), event_controller_1.EventController.lockEventController);
route.get("/event-analytics", (0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.MANAGER), event_controller_1.EventController.getEventAnalytics);
route.get("/single-event-analytics/:id", (0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.MANAGER), event_controller_1.EventController.getSingleEventAnalytics);
// get all event users
route.get("/all-event-users", (0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.MANAGER, client_1.Role.OPERATOR), event_controller_1.EventController.getAllEventUsers);
// delete event user from event
route.delete("/delete-event-user", (0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.MANAGER), event_controller_1.EventController.deleteEventUser);
exports.eventRoutes = route;
