const db = require('../config/db'); // DB 연결 설정

// 현재 판매 중인 물품 가져오기
exports.getSellingProducts = (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const query = `
    SELECT Id, title, price, view_count 
    FROM Product 
    WHERE user_id = ? AND status_id = 1
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database query failed' });
    }

    res.json(results);
  });
};

// 판매 완료된 물품 가져오기
exports.getSoldProducts = (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const query = `
    SELECT Id, title, price 
    FROM Product 
    WHERE user_id = ? AND status_id = 2
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database query failed' });
    }

    res.json(results);
  });
};

// 구매자 리뷰 가져오기
exports.getReviews = (req, res) => {
  const { sellerId } = req.body;

  if (!sellerId) {
    return res.status(400).json({ error: 'Seller ID is required' });
  }

  const query = `
    SELECT reviewer, product_id, rating, content 
    FROM User_Review 
    WHERE seller_id = ?
  `;

  db.query(query, [sellerId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database query failed' });
    }

    res.json(results);
  });
};
