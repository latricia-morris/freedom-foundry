import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import brandRouter from "./brand";
import contentRouter from "./content";
import clientSetupsRouter from "./client-setups";
import supportRouter from "./support";
import referralPartnerRouter from "./referral-partner";
import personaQuizRouter from "./persona-quiz";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(brandRouter);
router.use(contentRouter);
router.use(clientSetupsRouter);
router.use(supportRouter);
router.use(referralPartnerRouter);
router.use(personaQuizRouter);

export default router;
