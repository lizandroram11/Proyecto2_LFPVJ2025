import { Router } from "express";
import { analyze, home } from "../controllers/analyze.controller";

const analyzeRouter = Router();

analyzeRouter.get('/', home);
analyzeRouter.post('/analyze', analyze);

// ← Nueva ruta para errores léxicos
analyzeRouter.get('/errors', (req, res) => {
  res.render('pages/errors');
});

export default analyzeRouter;
