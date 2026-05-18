import { Router } from "express";
import requestValidation from "../../middlewares/requestValidation";
import { CounterController } from "./counter.controller";
import { CounterValidation } from "./counter.validation";
import auth from "../../middlewares/auth";
import { Role } from "@prisma/client";

const router = Router();

router.get(
  "/counters",
  auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.OPERATOR),
  CounterController.getAllCounters
);

router.get(
  "/counter/:id",
  auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.OPERATOR),
  CounterController.getSingleCounter
);

router.post(
  "/counters",
  auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER),
  requestValidation(CounterValidation.createCounter),
  CounterController.createCounter
);

router.put(
  "/update-counter/:id",
  auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER),
  requestValidation(CounterValidation.updateCounter),
  CounterController.updateCounter
);

router.delete(
  "/delete-counter/:id",
  auth(Role.SUPER_ADMIN, Role.ADMIN),
  CounterController.deleteCounter
);

export const CounterRoutes = router;
