import { Router, type IRouter } from "express";
import healthRouter from "./health";
import celebritiesRouter from "./celebrities";
import ordersRouter from "./orders";
import authRouter from "./auth";
import paymentRouter from "./payment";
import adminRouter from "./admin";
import contactRouter from "./contact";

const router: IRouter = Router();

router.use(healthRouter);
router.use(celebritiesRouter);
router.use(ordersRouter);
router.use(authRouter);
router.use(paymentRouter);
router.use(adminRouter);
router.use(contactRouter);

export default router;
