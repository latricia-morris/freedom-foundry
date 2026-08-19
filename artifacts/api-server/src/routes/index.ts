import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import brandRouter from "./brand";
import contentRouter from "./content";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(brandRouter);
router.use(contentRouter);

export default router;
