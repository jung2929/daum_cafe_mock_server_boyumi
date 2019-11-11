module.exports = function (app) {
    const user = require('../controllers/userController');
    const board = require('../controllers/boardController');
    const category = require('../controllers/categoryController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');
    const cafe = require('../controllers/cafeController');

    app.route('/cafe/create').post(jwtMiddleware, cafe.cafeMake); // 카페생성
    app.get('/cafe', cafe.cafeList); // 카페 리스트


};