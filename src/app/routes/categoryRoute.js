module.exports = function (app) {
    const user = require('../controllers/userController');
    const board = require('../controllers/boardController');
    const category = require('../controllers/categoryController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');


    app.get('/category', category.categoryList);


    app.route('/popular').post(jwtMiddleware, category.popularInsert);


    app.get('/check', jwtMiddleware, user.check);
};