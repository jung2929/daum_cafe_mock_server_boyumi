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

// 06. 게시글 리스트, 최신글 순서대로

exports.boardList = async function (req, res) {

    const connection = await pool.getConnection(async (conn) => conn)
    try {
        const insertBoardQuery = `SELECT b.title, b.contents, u.id, b.img 
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




// 07. 게시글 작성
exports.boardPost = async function (req, res) {
    console.log("board Test")
    const token = req.verifiedToken;
    const json = req.body

    const connection = await pool.getConnection(async (conn) => conn)
    try {
        const insertBoardQuery = `INSERT INTO board (title, contents, userId, img) 
        VALUES(?, ?, ?, ?);
        `
        console.log(token.id)
        const selectUserInfoParams = token.id
        const [rows] = await connection.query(insertBoardQuery, [json.title, json.contents, selectUserInfoParams, json.img])
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

// 08. 게시글 수정
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


// 09. 댓글 작성
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


// 10. 댓글 수정
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