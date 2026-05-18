import { Router } from "express";
import { EventController } from "./event.controller";
import { eventSchema } from "./event.validation";
import requestValidation from "../../middlewares/requestValidation";
import auth from "../../middlewares/auth";
import { Role } from "@prisma/client";

const route = Router();

// create event
route.post(
  "/events",
  auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER),
  requestValidation(eventSchema),
  EventController.createEvent
);

// get all events
route.get(
  "/events",
  auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.OPERATOR),
  EventController.getAllEvent
);

// get single event
route.get(
  "/event-users/:id",
  auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.OPERATOR),
  EventController.getSingleEventUser
);

route.get(
  "/event-quotas/:id",
  auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.OPERATOR),
  EventController.getSingleEventQuota
);

// update event
route.put(
  "/event/:id",
  auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER),
  EventController.updateEvent
);

// delete event
route.delete(
  "/event/:id",
  auth(Role.SUPER_ADMIN, Role.ADMIN),
  EventController.deleteEvent
);

// lock event
route.put(
  "/lock-event/:id",
  auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER),
  EventController.lockEventController
);

route.get(
  "/event-analytics",
  auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER),
  EventController.getEventAnalytics
);

route.get(
  "/single-event-analytics/:id",
  auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER),
  EventController.getSingleEventAnalytics
);

// get all event users
route.get(
  "/all-event-users",
  auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.OPERATOR),
  EventController.getAllEventUsers
);

// delete event user from event
route.delete(
  "/delete-event-user",
  auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER),
  EventController.deleteEventUser
);

export const eventRoutes = route;
