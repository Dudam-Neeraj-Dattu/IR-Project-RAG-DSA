import { Router } from "express";
import { searchProblems } from "../controllers/problem.controller.js";

const router = Router();

router.route('/search').post(searchProblems);

export default router;