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

// 인기글 출력 메인화면

exports.mainView = async function (req, res) {

    const connection = await pool.getConnection(async (conn) => conn)
    try {
        const mainQuery = `SELECT b.title, b.contents, u.id 
        FROM board AS b JOIN user AS u ON u.id = b.userId 
        ORDER BY b.views DESC limit 0,5;`
        const [rows] = await connection.query(mainQuery)

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
            message: '인기글 메인화면 조회 성공',
        })
    } catch (err) {
        logger.error(`example non transaction Query error\n: ${JSON.stringify(err)}`)
        connection.release()
        return res.json({
            isSuccess: false,
            code: 314,
            message: '인기글 메인화면 조회 실패',
        })
    }
}

//  카테고리 목록
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
        const insertCommentQuery = `INSERT INTO popular (categorytype, cafeName, user_id)
VALUES(?, ?, ?);
`
        console.log(token.id)
        const selectUserInfoParams = token.id
        const [rows] = await connection.query(insertCommentQuery, [json.categorytype, json.cafeName, selectUserInfoParams])
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

// 검색
exports.search = async function (req, res) {
    const json = req.body

    const connection = await pool.getConnection(async (conn) => conn)
    try {
        const SearchQuery = `SELECT b.title, b.contents, u.name 
        FROM board b JOIN user u 
            ON b.userId = u.id
        WHERE
            b.title LIKE '%${json.word}%' OR
            b.contents LIKE '%${json.word}%' OR
            u.name LIKE '%${json.word}%';`
        const [rows] = await connection.query(SearchQuery)
        console.log(rows)
        const list = [];
        if (rows.length === 0)
            list[0] = "검색 결과가 없습니다.";
        else {
            for (var i = 0; i < rows.length; i++) {
                list[i] = rows[i];
            }
        }

        console.log(list)

        connection.release()
        return res.json({
            isSuccess: true,
            code: 200,
            result: rows,
            message: '검색 성공',
        })
    } catch (err) {
        logger.error(`example non transaction Query error\n: ${JSON.stringify(err)}`)
        connection.release()
        return res.json({
            isSuccess: false,
            code: 314,
            message: '검색 실패',
        })
    }
}