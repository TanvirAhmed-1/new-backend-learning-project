import { Router } from "express";
import { EventController } from "./event.controller";
import { eventSchema } from "./event.validation";
import requestValidation from "../../middlewares/requestValidation";

const route = Router();

// create event
route.post(
  "/events",
  requestValidation(eventSchema),
  EventController.createEvent
);

// get all events
route.get("/events", EventController.getAllEvent);

// get single event
route.get("/event-users/:id", EventController.getSingleEventUser);

route.get("/event-quotas/:id", EventController.getSingleEventQuota);

// update event
route.put("/event/:id", EventController.updateEvent);

// delete event
route.delete("/event/:id", EventController.deleteEvent);

// lock event
route.put("/lock-event/:id", EventController.lockEventController);


route.get("/event-analytics", EventController.getEventAnalytics);

route.get("/single-event-analytics/:id", EventController.getSingleEventAnalytics);

// get all event users
route.get("/all-event-users", EventController.getAllEventUsers);

// delete event user from event
route.delete("/delete-event-user", EventController.deleteEventUser);

export const eventRoutes = route;
