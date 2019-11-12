module.exports = function (app) {
    const user = require('../controllers/userController');
    const board = require('../controllers/boardController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.route('/board/post').post(jwtMiddleware, board.boardPost); // 글쓰기
    app.get('/:cafeName/board', board.boardList); // 게시글 리스트 

    app.route('/board/:boardId/modifyPost').patch(jwtMiddleware, board.boardModify); // 게시글 수정
    app.route('/board/:boardId').delete(jwtMiddleware, board.deleteBoard); // 게시글 삭제

    app.route('/board/:boardId/comment').post(jwtMiddleware, board.commentPost); // 댓글 작성
    app.route('/board/:boardId/modifyComment/:commentId').patch(jwtMiddleware, board.commentModify); // 댓글 수정
    app.route('/board/:boardId/comment/:commentId').delete(jwtMiddleware, board.deleteComment); // 댓글 삭제

    app.get('/board/:boardId', board.boardDetail); // 게시글 상세보기

    app.get('/user/board', jwtMiddleware, board.myBoard); // 내가 쓴 글 목록
    app.get('/user/comment', jwtMiddleware, board.myComment); // 댓글 단 글


    app.get('/check', jwtMiddleware, user.check);
};