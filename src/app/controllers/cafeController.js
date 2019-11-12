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
        const insertCafeQuery = `INSERT INTO cafe (name)
          VALUES (?);`
        console.log(token.id)
        const selectUserInfoParams = token.id
        const [rows] = await connection.query(insertCafeQuery, [
            json.cafeName
        ])
        console.log(rows)

        connection.release()
        return res.json({
            isSuccess: true,
            code: 200,
            result: rows,
            message: '카페생성 성공',
        })
    } catch (err) {
        logger.error(`Cafe Create Query error\n: ${JSON.stringify(err)}`)
        connection.release()
        return res.json({
            isSuccess: false,
            code: 315,
            message: '카페 생성 실패',
        })
    }
}


// 카페 리스트
exports.cafeList = async function (req, res) {

    const connection = await pool.getConnection(async (conn) => conn)
    try {
        const CafeListdQuery = `SELECT name 
FROM cafe;`
        const [rows] = await connection.query(CafeListdQuery)

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
            message: '카페목록 조회 성공',
        })
    } catch (err) {
        logger.error(`Cafe List Query error\n: ${JSON.stringify(err)}`)
        connection.release()
        return res.json({
            isSuccess: false,
            code: 314,
            message: '카페목록 조회 실패',
        })
    }
}