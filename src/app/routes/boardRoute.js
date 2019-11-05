module.exports = function (app) {
    const user = require('../controllers/userController');
    const board = require('../controllers/boardController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');


    app.route('/board/post').post(jwtMiddleware, board.boardPost); // 글쓰기
    app.get('/board', board.boardList); // 게시글 리스트 
    app.route('/board/:boardId/modifyPost').patch(jwtMiddleware, board.boardModify);
    app.get('/check', jwtMiddleware, user.check);
};