const { Router } = require('express');
const authorize = require('../middleware/authorize');
const {
  getHistory,
  createWorkout,
  updateWorkout,
  deleteWorkout,
} = require('../controllers/workout.controller');

const router = Router();

router.get('/history', getHistory);
router.post('/', createWorkout);
router.patch('/:id', authorize('workouts'), updateWorkout);
router.delete('/:id', authorize('workouts'), deleteWorkout);

module.exports = router;
