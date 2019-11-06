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

// 12. 메인화면 (인기글 목록)



// 13. 카테고리 목록
exports.categoryList = async function (req, res) {

    const connection = await pool.getConnection(async (conn) => conn)
    try {
        const insertBoardQuery = `SELECT categoryname 
        FROM category;`
        const [rows] = await connection.query(insertBoardQuery)

        const list = [];
        for (var i = 0; i < rows.length; i++) {
            list[i] = rows[i];
        }
        console.log(list)

        connection.release()
        return res.json({
            isSuccess: true,
            code: 200,
            result: list,
            message: '카테고리 조회 성공',
        })
    } catch (err) {
        logger.error(`example non transaction Query error\n: ${JSON.stringify(err)}`)
        connection.release()
        return res.json({
            isSuccess: false,
            code: 314,
            message: '카테고리 조회 실패',
        })
    }
}


// 14. 즐겨찾기
exports.popularInsert = async function (req, res) {
    const token = req.verifiedToken;
    const json = req.body
    const boardId = req.params.boardId

    const connection = await pool.getConnection(async (conn) => conn)
    try {
        const insertCommentQuery = `INSERT INTO popular (type, user_id)
        VALUES(?, ?);
        `
        console.log(token.id)
        const selectUserInfoParams = token.id
        const [rows] = await connection.query(insertCommentQuery, [json.type, selectUserInfoParams])
        connection.release()
        return res.json({
            isSuccess: true,
            code: 200,
            result: rows,
            message: '즐겨찾기 성공',
        })
    } catch (err) {
        logger.error(`example non transaction Query error\n: ${JSON.stringify(err)}`)
        connection.release()
        return res.json({
            isSuccess: false,
            code: 318,
            message: '즐겨찾기 실패',
        })
    }
}