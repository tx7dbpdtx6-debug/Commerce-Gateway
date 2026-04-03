import { Router, type IRouter } from "express";
import healthRouter from "./health";
import celebritiesRouter from "./celebrities";
import ordersRouter from "./orders";
import authRouter from "./auth";
import paymentRouter from "./payment";

const router: IRouter = Router();

router.use(healthRouter);
router.use(celebritiesRouter);
router.use(ordersRouter);
router.use(authRouter);
router.use(paymentRouter);

export default router;
