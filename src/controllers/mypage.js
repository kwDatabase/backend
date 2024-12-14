const db = require('../config/db'); // DB 연결 설정

exports.getSellingProducts = (req, res) => {
  const { userId, page = 1 } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const limit = 10; // 페이지당 최대 상품 수
  const offset = (page - 1) * limit; // 가져올 데이터의 시작점 계산

  const query = `
    SELECT Id, title, price, view_count 
    FROM Product 
    WHERE user_id = ? AND status_id = 1
    LIMIT ? OFFSET ?`; // 페이지네이션 구현

  db.query(query, [userId, limit, offset], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database query failed' });
    }

    // 전체 상품 개수 가져오기
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM Product
      WHERE user_id = ? AND status_id = 1`;

    db.query(countQuery, [userId], (err, countResults) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to fetch product count' });
      }

      const totalItems = countResults[0].total;
      const totalPages = Math.ceil(totalItems / limit);

      res.json({
        products: results,
        totalPages,
        currentPage: page,
      });
    });
  });
};


// 판매 완료된 물품 가져오기
exports.getSoldProducts = (req, res) => {
  const { userId, page = 1 } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const limit = 10; // 페이지당 최대 상품 수
  const offset = (page - 1) * limit; // 가져올 데이터의 시작점 계산

  const query = `
    SELECT Id, title, price 
    FROM Product 
    WHERE user_id = ? AND status_id = 2
    LIMIT ? OFFSET ?`; // 페이지네이션 구현

  db.query(query, [userId, limit, offset], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database query failed' });
    }

    // 전체 상품 개수 가져오기
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM Product
      WHERE user_id = ? AND status_id = 2`;

    db.query(countQuery, [userId], (err, countResults) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to fetch product count' });
      }

      const totalItems = countResults[0].total;
      const totalPages = Math.ceil(totalItems / limit);

      res.json({
        products: results,
        totalPages,
        currentPage: page,
      });
    });
  });
};

// 구매자 리뷰 가져오기
exports.getReviews = (req, res) => {
  const { sellerId, page = 1 } = req.body;

  if (!sellerId) {
    return res.status(400).json({ error: 'Seller ID is required' });
  }

  const limit = 10; // 페이지당 최대 리뷰 수
  const offset = (page - 1) * limit; // 가져올 데이터의 시작점 계산

  const query = `
    SELECT user_id, product_id, rating, content 
    FROM User_Review 
    WHERE seller_id = ?
    LIMIT ? OFFSET ?`; // LIMIT와 OFFSET을 사용하여 페이지네이션 구현

  db.query(query, [sellerId, limit, offset], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database query failed' });
    }

    // 전체 리뷰 개수도 가져오기
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM User_Review
      WHERE seller_id = ?`;

    db.query(countQuery, [sellerId], (err, countResults) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to fetch review count' });
      }

      const totalReviews = countResults[0].total;
      const totalPages = Math.ceil(totalReviews / limit);

      res.json({
        reviews: results,
        totalPages,
        currentPage: page,
      });
    });
  });
};
