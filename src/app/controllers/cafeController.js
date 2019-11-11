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


// 카페 생성
exports.cafeMake = async function (req, res) {
    const token = req.verifiedToken
    const json = req.body
    // console.log("type test " + json.categorytype)

    const connection = await pool.getConnection(async (conn) => conn)
    try {
        const insertBoardQuery = `INSERT INTO board (title, contents, userId, img, categorytype, cafeName)
          VALUES(?, ?, ?, ?, ?, ?);`
        console.log(token.id)
        const selectUserInfoParams = token.id
        const [rows] = await connection.query(insertBoardQuery, [
            json.title,
            json.contents,
            selectUserInfoParams,
            json.img,
            json.categorytype,
            json.cafeName
        ])
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


// 카페 리스트
exports.cafeList = async function (req, res) {
    const token = req.verifiedToken
    const json = req.body
    // console.log("type test " + json.categorytype)

    const connection = await pool.getConnection(async (conn) => conn)
    try {
        const insertBoardQuery = `INSERT INTO board (title, contents, userId, img, categorytype, cafeName)
          VALUES(?, ?, ?, ?, ?, ?);`
        console.log(token.id)
        const selectUserInfoParams = token.id
        const [rows] = await connection.query(insertBoardQuery, [
            json.title,
            json.contents,
            selectUserInfoParams,
            json.img,
            json.categorytype,
            json.cafeName
        ])
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