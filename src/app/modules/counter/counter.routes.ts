import { Router } from "express";
import requestValidation from "../../middlewares/requestValidation";
import { CounterController } from "./counter.controller";
import { CounterValidation } from "./counter.validation";

const router = Router();

router.get("/counters", CounterController.getAllCounters);

router.get("/counter/:id", CounterController.getSingleCounter);

router.post(
  "/counters",
  requestValidation(CounterValidation.createCounter),
  CounterController.createCounter
);

router.put(
  "/update-counter/:id",
  requestValidation(CounterValidation.updateCounter),
  CounterController.updateCounter
);

router.delete("/delete-counter/:id", CounterController.deleteCounter);

export const CounterRoutes = router;
