import { Router } from 'express';
import * as GamesController from '../../controllers/games.controller.js';

const router = Router();

router.get('/search', GamesController.search);
router.get('/genres', GamesController.getGenres);
router.get('/genre/:genreId', GamesController.getByGenre);
router.get('/popular', GamesController.getPopular);
router.get('/trending', GamesController.getTrending);
router.get('/upcoming', GamesController.getUpcoming);
router.get('/:id', GamesController.getById);

export default router;
