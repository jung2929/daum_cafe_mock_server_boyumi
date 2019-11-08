const {
    pool
} = require('../../../config/database')
const {
    logger
} = require('../../../config/winston')

const jwt = require('jsonwebtoken')
const regexEmail = require('regex-email')
const idReg = /^[A-za-z]/g
const crypto = require('crypto')
const secret_config = require('../../../config/secret')

// 게시글 리스트, 최신글 순서대로

exports.boardList = async function (req, res) {

    const connection = await pool.getConnection(async (conn) => conn)
    try {
        const insertBoardQuery = `SELECT b.title, b.contents, u.id, b.img,
        CASE
        WHEN TIMESTAMPDIFF(MINUTE, b.createAt, CURRENT_TIMESTAMP) < 60
        then CONCAT(TIMESTAMPDIFF(MINUTE, b.createAt, CURRENT_TIMESTAMP), ' 분전')
        WHEN TIMESTAMPDIFF(HOUR, b.createAt, CURRENT_TIMESTAMP) < 24
        then CONCAT(TIMESTAMPDIFF(HOUR, b.createAt, CURRENT_TIMESTAMP), ' 시간 전')
        else CONCAT(TIMESTAMPDIFF(DAY, b.createAt, CURRENT_TIMESTAMP), ' 일 전')
        END AS createdAt
        FROM board AS b JOIN user AS u ON u.id = b.userId 
        ORDER BY b.createAt DESC limit 0,5;`

        const [rows] = await connection.query(insertBoardQuery)
        connection.release()
        return res.json({
            isSuccess: true,
            code: 200,
            result: rows,
            message: '화면조회 성공',
        })
    } catch (err) {
        logger.error(`example non transaction Query error\n: ${JSON.stringify(err)}`)
        connection.release()
        return res.json({
            isSuccess: false,
            code: 314,
            message: '화면조회 실패',
        })
    }
}

// 새로고침 
exports.boardRefresh = async function (req, res) {

    return res.redirect('/board');
}


//  게시글 작성
exports.boardPost = async function (req, res) {
    console.log("board Test")
    const token = req.verifiedToken;
    const json = req.body
    // console.log("type test " + json.categorytype)

    const connection = await pool.getConnection(async (conn) => conn)
    try {
        const insertBoardQuery = `INSERT INTO board (title, contents, userId, img, categorytype)
        VALUES(?, ?, ?, ?, ?);`
        console.log(token.id)
        const selectUserInfoParams = token.id
        const [rows] = await connection.query(insertBoardQuery, [json.title, json.contents, selectUserInfoParams, json.img, json.categorytype])
        console.log(rows)

        // const subscribeUserQuery = `SELECT user_id FROM popular WHERE type=?;`
        // const [subscribeUser] = await connection.query(subscribeUser, [json.categorytype])



        // // ======== push 기능
        // var message = {
        //     "to": subscribeUser.user_id
        // }




        connection.release()
        return res.json({
            isSuccess: true,
            code: 200,
            result: rows,
            message: '글쓰기 성공',
        })
    } catch (err) {
        logger.error(`example non transaction Query error\n: ${JSON.stringify(err)}`)
        connection.release()
        return res.json({
            isSuccess: false,
            code: 315,
            message: '글쓰기 실패',
        })
    }
}

//  게시글 수정
exports.boardModify = async function (req, res) {
    const token = req.verifiedToken
    const json = req.body
    const boardId = req.params.boardId
    console.log(req.params.boardId)
    console.log(boardId)

    const connection = await pool.getConnection(async (conn) => conn)
    try {
        const modifyBoardQuery = `SELECT userId FROM board WHERE idboard=?;`
        console.log(token.id)
        const selectUserInfoParams = token.id
        const [rows] = await connection.query(modifyBoardQuery, boardId)
        connection.release()
        console.log("rows test " + rows[0].userId)

        if (rows[0].userId != token.id) {
            return res.json({
                isSuccess: false,
                code: 316,
                message: '로그인 정보가 다릅니다'
            })
        }

        const patchBoardQuery = `UPDATE board SET title=?, contents=?, img=? WHERE idboard=?;`
        const [result] = await connection.query(patchBoardQuery, [json.title, json.contents, json.img, boardId])

        return res.json({
            isSuccess: true,
            code: 200,
            result: result,
            message: '게시글 수정 성공',
        })
    } catch (err) {
        logger.error(`example non transaction Query error\n: ${JSON.stringify(err)}`)
        connection.release()
        return res.json({
            isSuccess: false,
            code: 317,
            message: '게시글 수정 실패',
        })
    }
}


//  댓글 작성
exports.commentPost = async function (req, res) {
    const token = req.verifiedToken;
    const json = req.body
    const boardId = req.params.boardId

    const connection = await pool.getConnection(async (conn) => conn)
    try {
        const insertCommentQuery = `INSERT INTO comment (content, userId, boardIdx) 
        VALUES(?, ?, ?);
        `
        console.log(token.id)
        const selectUserInfoParams = token.id
        const [rows] = await connection.query(insertCommentQuery, [json.contents, selectUserInfoParams, boardId])
        connection.release()
        return res.json({
            isSuccess: true,
            code: 200,
            result: rows,
            message: '답글쓰기 성공',
        })
    } catch (err) {
        logger.error(`example non transaction Query error\n: ${JSON.stringify(err)}`)
        connection.release()
        return res.json({
            isSuccess: false,
            code: 318,
            message: '답글쓰기 실패',
        })
    }
}


// 댓글 수정
exports.commentModify = async function (req, res) {
    const token = req.verifiedToken
    const json = req.body
    const boardId = req.params.boardId
    const commentId = req.params.commentId

    const connection = await pool.getConnection(async (conn) => conn)
    try {
        const modifyCommentQuery = `SELECT userId FROM comment WHERE idcomment=?;`
        console.log(token.id)
        const selectUserInfoParams = token.id
        console.log("commentId : " + commentId)
        const [rows] = await connection.query(modifyCommentQuery, commentId)
        connection.release()
        console.log(rows[0])
        if (rows[0].userId != token.id) {
            return res.json({
                isSuccess: false,
                code: 319,
                message: '로그인 정보가 다릅니다'
            })
        }

        const patchCommentQuery = `UPDATE comment SET content=? WHERE idcomment=?;`
        const [result] = await connection.query(patchCommentQuery, [json.contents, commentId])

        console.log(result)
        return res.json({
            isSuccess: true,
            code: 200,
            result: result,
            message: '댓글 수정 성공',
        })
    } catch (err) {
        logger.error(`example non transaction Query error\n: ${JSON.stringify(err)}`)
        connection.release()
        return res.json({
            isSuccess: false,
            code: 320,
            message: '댓글 수정 실패',
        })
    }
}


// 글 상세보기
exports.boardDetail = async function (req, res) {


    connection = await pool.getConnection(async (conn) => conn)
    try {

        const viewCountQuery = `UPDATE board SET views = views+1 WHERE idboard=?;`
        const view = await connection.query(viewCountQuery, [req.params.boardId])

        const BoardViewQuery = `SELECT b.title, b.contents, b.userId, b.img, c.content,
        CASE
        WHEN TIMESTAMPDIFF(MINUTE, c.createAt, CURRENT_TIMESTAMP) < 60
        then CONCAT(TIMESTAMPDIFF(MINUTE, c.createAt, CURRENT_TIMESTAMP), ' 분전')
        WHEN TIMESTAMPDIFF(HOUR, c.createAt, CURRENT_TIMESTAMP) < 24
        then CONCAT(TIMESTAMPDIFF(HOUR, c.createAt, CURRENT_TIMESTAMP), ' 시간 전')
        else CONCAT(TIMESTAMPDIFF(DAY, c.createAt, CURRENT_TIMESTAMP), ' 일 전')
        END AS createdAt
        FROM board AS b
        JOIN comment AS c ON b.idBoard = c.boardIdx WHERE b.idBoard=?;`

        const [rows] = await connection.query(BoardViewQuery, [req.params.boardId])

        connection.release()
        return res.json({
            isSuccess: true,
            code: 200,
            result: rows,
            message: '글 상세보기 성공',
        })
    } catch (err) {
        logger.error(`example non transaction Query error\n: ${JSON.stringify(err)}`)
        connection.release()
        return res.json({
            isSuccess: false,
            code: 314,
            message: '글 상세보기 실패',
        })
    }
}