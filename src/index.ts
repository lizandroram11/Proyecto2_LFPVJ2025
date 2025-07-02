import express from 'express';
import path from 'path';                // ← Nuevo
import analyzeRouter from './routes/analyze.routes';

const app = express();

app.set('view engine', 'ejs');
// ← Aquí le dices que tus vistas están en ../views (al lado de src/)
app.set('views', path.join(__dirname, '../views'));

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.text());

app.use(analyzeRouter);

app.listen(3000, () => {
    console.log("The server is listening on: http://localhost:3000");
});
