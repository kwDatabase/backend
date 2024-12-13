const authenticateToken = require('../authenticateToken');

exports.getMyPage = [authenticateToken, (req, res) => {
  const userId = req.user.id; // JWT에서 사용자 ID 가져오기

  const query = 'SELECT * FROM USER WHERE Id = ?';
  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: '서버 오류' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    res.status(200).json({
      message: '마이페이지 로드 성공',
      user: results[0],
    });
  });
}];
