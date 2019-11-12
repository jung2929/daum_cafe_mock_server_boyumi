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
    const ListBoardQuery = `SELECT b.title, b.contents, u.id, b.img,
        CASE
        WHEN TIMESTAMPDIFF(MINUTE, b.createAt, CURRENT_TIMESTAMP) < 60
        then CONCAT(TIMESTAMPDIFF(MINUTE, b.createAt, CURRENT_TIMESTAMP), ' 분전')
        WHEN TIMESTAMPDIFF(HOUR, b.createAt, CURRENT_TIMESTAMP) < 24
        then CONCAT(TIMESTAMPDIFF(HOUR, b.createAt, CURRENT_TIMESTAMP), ' 시간 전')
        else CONCAT(TIMESTAMPDIFF(DAY, b.createAt, CURRENT_TIMESTAMP), ' 일 전')
        END AS createdAt
        FROM board AS b JOIN user AS u ON u.id = b.userId AND b.status != 'DELETED'
        WHERE b.cafeName=?
        ORDER BY b.createAt DESC limit 0,5;`

    const [rows] = await connection.query(ListBoardQuery, [req.params.cafeName])
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


//  게시글 작성
exports.boardPost = async function (req, res) {
  console.log('board Test')
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
      json.cafeName,
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

//  게시글 수정
exports.boardModify = async function (req, res) {
  const token = req.verifiedToken
  const json = req.body
  const boardId = req.params.boardId
  console.log(req.params.boardId)
  console.log(boardId)

  const connection = await pool.getConnection(async (conn) => conn)
  try {
    const modifyBoardQuery = `SELECT userId FROM board WHERE idboard = ?;`
    console.log(token.id)
    const selectUserInfoParams = token.id
    const [rows] = await connection.query(modifyBoardQuery, boardId)

    console.log('rows test ' + rows[0].userId)

    if (rows[0].userId != token.id) {
      connection.release()
      return res.json({
        isSuccess: false,
        code: 316,
        message: '로그인 정보가 다릅니다',
      })
    }

    const patchBoardQuery = `UPDATE board SET title=?, contents=?, img=? WHERE idboard=?;`
    const [result] = await connection.query(patchBoardQuery, [json.title, json.contents, json.img, boardId])
    connection.release()

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

// 게시글 삭제
exports.deleteBoard = async function (req, res) {
  const token = req.verifiedToken
  const data = req.body
  console.log(token)
  try {
    const connection = await pool.getConnection(async (conn) => conn)
    try {
      const selectBoardDeleteQuery = `UPDATE board 
          SET status='DELETED' 
          WHERE idboard=? AND userId=?;
          `
      console.log(token.id)
      const selectUserInfoParams = token.id
      const [boardDeleteRows] = await connection.query(selectBoardDeleteQuery, [
        req.params.boardId,
        selectBoardDeleteQuery,
      ])
      connection.release()
      res.json({
        boardDeleteRows: boardDeleteRows,
        isSuccess: true,
        code: 200,
        message: '게시글 삭제 성공',
      })
    } catch (err) {
      logger.error(`App - boardDelete Query error\n: ${JSON.stringify(err)}`)
      console.log(err)
      connection.release()
      return false
    }
  } catch (err) {
    logger.error(`App - boardDelete DB Connection error\n: ${JSON.stringify(err)}`)
    return false
  }
}

//  댓글 작성
exports.commentPost = async function (req, res) {
  const token = req.verifiedToken
  const json = req.body

  const connection = await pool.getConnection(async (conn) => conn)
  try {
    const insertCommentQuery = `INSERT INTO comment (content, userId, boardIdx) 
        VALUES(?, ?, ?);
        `
    console.log(token.id)
    const selectUserInfoParams = token.id
    const [rows] = await connection.query(insertCommentQuery, [json.contents, selectUserInfoParams, req.params.boardId])
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
    console.log('commentId : ' + commentId)
    const [rows] = await connection.query(modifyCommentQuery, commentId)

    console.log(rows[0])
    if (rows[0].userId != token.id) {
      connection.release()
      return res.json({
        isSuccess: false,
        code: 319,
        message: '로그인 정보가 다릅니다',
      })
    }

    const patchCommentQuery = `UPDATE comment SET content=? WHERE idcomment=?;`
    const [result] = await connection.query(patchCommentQuery, [json.contents, commentId])
    connection.release()
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


// 댓글삭제
exports.deleteComment = async function (req, res) {
  const token = req.verifiedToken
  const data = req.body
  console.log(token)
  try {
    const connection = await pool.getConnection(async (conn) => conn)
    try {
      const selectCommentDeleteQuery = `UPDATE comment
          SET status='DELETED' 
          WHERE idcomment=? AND userId=?;
          `
      console.log(token.id)
      const selectUserInfoParams = token.id
      const [commentDeleteRows] = await connection.query(selectCommentDeleteQuery, [
        req.params.boardId,
        selectBoardDeleteQuery,
      ])
      connection.release()
      res.json({
        commentDeleteRows: commentDeleteRows,
        isSuccess: true,
        code: 200,
        message: '댓글 삭제 성공',
      })
    } catch (err) {
      logger.error(`App - commentDelete Query error\n: ${JSON.stringify(err)}`)
      console.log(err)
      connection.release()
      return false
    }
  } catch (err) {
    logger.error(`App - commentDelete DB Connection error\n: ${JSON.stringify(err)}`)
    return false
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

    // 댓글 여러개 띄어놓는거 예외처리할것!

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



// 내가 쓴 글 조회
exports.myBoard = async function (req, res) {
  const token = req.verifiedToken
  const connection = await pool.getConnection(async (conn) => conn)
  try {
    const myBoardListQuery = `SELECT b.title, b.contents, u.name, b.img,
        CASE
        WHEN TIMESTAMPDIFF(MINUTE, b.createAt, CURRENT_TIMESTAMP) < 60
        then CONCAT(TIMESTAMPDIFF(MINUTE, b.createAt, CURRENT_TIMESTAMP), ' 분전')
        WHEN TIMESTAMPDIFF(HOUR, b.createAt, CURRENT_TIMESTAMP) < 24
        then CONCAT(TIMESTAMPDIFF(HOUR, b.createAt, CURRENT_TIMESTAMP), ' 시간 전')
        else CONCAT(TIMESTAMPDIFF(DAY, b.createAt, CURRENT_TIMESTAMP), ' 일 전')
        END AS createdAt
        FROM board AS b JOIN user AS u ON u.id = b.userId AND u.status != 'DELETED'
        AND b.status != 'DELETED'
        WHERE u.id=?
        ORDER BY b.createAt DESC limit 0,5;`

    const [rows] = await connection.query(myBoardListQuery, token.id)
    connection.release()
    return res.json({
      isSuccess: true,
      code: 200,
      result: rows,
      message: '내가 쓴 글 목록 조회 성공',
    })
  } catch (err) {
    logger.error(`My board List Query error\n: ${JSON.stringify(err)}`)
    connection.release()
    return res.json({
      isSuccess: false,
      code: 314,
      message: '내가 쓴 글 목록 조회 실패',
    })
  }
}

// 내가 댓글 쓴 글
exports.myComment = async function (req, res) {
  const token = req.verifiedToken
  const connection = await pool.getConnection(async (conn) => conn)
  try {
    const myBoardListQuery = `SELECT b.title, b.contents, b.idboard,
    CASE
    WHEN TIMESTAMPDIFF(MINUTE, b.createAt, CURRENT_TIMESTAMP) < 60
    then CONCAT(TIMESTAMPDIFF(MINUTE, b.createAt, CURRENT_TIMESTAMP), ' 분전')
    WHEN TIMESTAMPDIFF(HOUR, b.createAt, CURRENT_TIMESTAMP) < 24
    then CONCAT(TIMESTAMPDIFF(HOUR, b.createAt, CURRENT_TIMESTAMP), ' 시간 전')
    else CONCAT(TIMESTAMPDIFF(DAY, b.createAt, CURRENT_TIMESTAMP), ' 일 전')
    END AS createdAt
    FROM board AS b JOIN user AS u JOIN comment AS c
    ON u.id = c.userId AND c.boardIdx = b.idboard
    AND c.status != 'DELETED' AND b.status != 'DELETED'
    WHERE u.id=?
    GROUP BY b.idboard
    ORDER BY b.createAt DESC limit 0,5;`

    const [rows] = await connection.query(myBoardListQuery, token.id)
    connection.release()
    return res.json({
      isSuccess: true,
      code: 200,
      result: rows,
      message: '내가 쓴 댓글 목록 조회 성공',
    })
  } catch (err) {
    logger.error(`My Comment List Query error\n: ${JSON.stringify(err)}`)
    connection.release()
    return res.json({
      isSuccess: false,
      code: 314,
      message: '내가 쓴 댓글 목록 조회 실패',
    })
  }
}