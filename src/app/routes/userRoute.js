module.exports = function (app) {
    const user = require('../controllers/userController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.route('/app/signUp').post(user.signUp); // 회원가입
    app.route('/app/signIn').post(user.signIn); // 로그인
    app.get('/user/info', jwtMiddleware, user.userInfo); // 내 정보보기
    app.route('/user/modifyInfo').patch(jwtMiddleware, user.modifyUser); // 내 정보 수정

    app.route('/user/resign').patch(jwtMiddleware, user.deleteUser); // 회원탈퇴

    app.get('/check', jwtMiddleware, user.check);
};