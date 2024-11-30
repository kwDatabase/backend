var express = require('express');
const db = require('../config/db');
const jwt = require('jsonwebtoken'); // JWT 라이브러리
require('dotenv').config(); // 환경 변수에서 SECRET_KEY 가져오기

exports.SelectAllUser = (req, res) => {
    const query = 'SELECT * FROM user';
    db.query(query, (err, results) => {
      if(err){
        console.error(err.message);
        return res.status(500).json({error: 'Database query failed'});
      }
      console.log(results);
      res.json(results);
    });
};

exports.SelectUserById = (req, res) =>{
    const query = `SELECT * FROM user where id = ${req.params.id}`;
    db.query(query, (err, results) => {
      if(err){
        console.error(err.message);
        return res.status(500).json({error: 'Database query failed'});
      }
      console.log(results);
      res.json(results);
    });
}

exports.Login = (req, res) => {
  const { id, password } = req.body; // 요청 본문에서 ID와 Password를 받음

  // 1. 입력값 검증
  if (!id || !password) {
    return res.status(400).json({ error: 'ID와 Password를 모두 입력해야 합니다.' });
  }

  // 2. ID로 사용자 탐색
  const query = `SELECT Id, Password, Name, Nic_Name FROM USER WHERE Id = ?`;
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('DB Error:', err.message);
      return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }

    // 3. 일치하는 ID가 없는 경우
    if (results.length === 0) {
      return res.status(404).json({ error: '존재하지 않는 ID입니다.' });
    }

    const user = results[0];

    // 4. Password 확인
    if (user.Password !== password) {
      console.log('로그인 실패:', `ID: ${id}, 입력된 Password: ${password}`);
      return res.status(401).json({ error: '비밀번호가 일치하지 않습니다.' });
    }

    // 5. JWT 토큰 생성
    const token = jwt.sign(
      { id: user.Id, name: user.Name, nickname: user.Nic_Name },
      process.env.SECRET_KEY, // 환경 변수에 저장된 비밀키 사용
      { expiresIn: '1h' } // 토큰 유효 기간: 1시간
    );

    // 6. 성공 응답
    console.log('로그인 성공:', `ID: ${id}`);
    return res.status(200).json({
      message: '로그인 성공!',
      user: {
        id: user.Id,
        name: user.Name,
        nickname: user.Nic_Name,
      },
      token, // 클라이언트가 인증 요청 시 사용할 토큰
    });
  });
};


exports.JoinNewUser = async (req, res) => {
  const { id, password, name, nickname } = req.body;

  // 1. 필수 입력값 확인
  if (!id || !password || !name) {
    return res.status(400).json({ error: 'ID, Password, Name은 필수 입력 항목입니다.' });
  }

  try {
    // 2. 중복 ID 확인
    const checkUserQuery = `SELECT * FROM USER WHERE Id = ?`;
    const [existingUser] = await db.promise().query(checkUserQuery, [id]);
    if (existingUser.length > 0) {
      return res.status(409).json({ error: '이미 존재하는 ID입니다.' });
    }

    // 3. 별명이 없으면 ID를 별명으로 설정
    const finalNickname = nickname || id;

    // 4. 중복 별명 확인
    const checkNicknameQuery = `SELECT * FROM USER WHERE Nic_Name = ?`;
    const [existingNickname] = await db.promise().query(checkNicknameQuery, [finalNickname]);
    if (existingNickname.length > 0) {
      return res.status(409).json({ error: '이미 사용 중인 별명입니다.' });
    }

    // 5. 현재 날짜와 시간 생성
    const now = new Date();
    const currentDate = now.toISOString().slice(0, 10).replace(/-/g, '');
    const currentTime = now.toTimeString().slice(0, 5).replace(':', '');

    // 6. 새 사용자 추가
    const insertUserQuery = `
      INSERT INTO USER (
        Id, Password, Name, Nic_Name, Enter_User_Id, Enter_Date, Enter_Time, Modify_User_Id, Modify_Date, Modify_Time
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      id,
      password,
      name,
      finalNickname, // Nic_Name에 저장
      id, // Enter_User_Id
      currentDate, // Enter_Date
      currentTime, // Enter_Time
      id, // Modify_User_Id
      currentDate, // Modify_Date
      currentTime, // Modify_Time
    ];

    const [result] = await db.promise().query(insertUserQuery, values);

    // 7. 성공 응답
    return res.status(201).json({ message: '회원가입이 완료되었습니다.' });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: '서버 오류로 인해 회원가입에 실패했습니다.' });
  }
};

