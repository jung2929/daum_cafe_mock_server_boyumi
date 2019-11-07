module.exports = function (app) {
    const user = require('../controllers/userController');
    const board = require('../controllers/boardController');
    const category = require('../controllers/categoryController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');




    app.get('/', category.mainView); // 인기글 메인화면


    app.route('/search/board').post(category.search); // 검색

    app.get('/category', category.categoryList); // 카테고리 리스트 보기 
    app.route('/popular').post(jwtMiddleware, category.popularInsert); // 즐겨찾기


    app.get('/check', jwtMiddleware, user.check);
};