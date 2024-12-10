const db = require('../config/db');

// 평균 평점 계산 함수
const calculateUserAverageRating = (userId, callback) => {
    const query = `
        SELECT AVG(rating) AS averageRating
        FROM Product p
        JOIN Product_Comment c ON p.id = c.product_id
        WHERE p.user_id = ? AND c.status = 0`; // status 0은 후기를 의미

    db.query(query, [userId], (err, results) => {
        if (err) return callback(err);
        callback(null, results[0].averageRating || 0); // 기본값 0
    });
    console.log("rating값 수정됨")
};

// 상품에 대한 후기와 문의 가져오기
exports.getCommentsByProductId = (req, res) => {
    const productId = req.params.id;

    // 후기와 문의를 가져오는 쿼리
    db.query('SELECT * FROM Product_Comment WHERE product_id = ?', [productId], (err, results) => {
        if (err) {
            console.error('Error fetching comments:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        const reviews = results
            .filter(comment => comment.status === 0)
            .map(comment => ({
                id: comment.id,
                userId: comment.user_id,
                content: comment.content,
                date: `${comment.enter_date} ${comment.enter_time}`,
            }));

        const inquiries = results
            .filter(comment => comment.status === 1)
            .map(comment => ({
                id: comment.id,
                userId: comment.user_id,
                content: comment.content,
                date: `${comment.enter_date} ${comment.enter_time}`,
                reply_content: comment.reply_content,
                reply_date: comment.reply_date,
            }));

        res.json({ reviews, inquiries });
    });
};

// 후기 추가
exports.addReview = (req, res) => {
    const productId = req.params.id; // URL에서 상품 ID 가져오기
    const { user_id, content, rating } = req.body; // 요청 본문에서 작성자 ID, 내용, 평점 가져오기

    const currentDate = new Date();
    const enterDate = currentDate.toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD 형식
    const enterTime = currentDate.toTimeString().split(' ')[0].slice(0, 5).replace(':', ''); // HHMM 형식

    // seller_id는 productId에 해당하는 상품의 user_id로 설정
    const queryProductSeller = 'SELECT user_id FROM Product WHERE id = ?';

    db.query(queryProductSeller, [productId], (err, productResults) => {
        if (err || productResults.length === 0) {
            console.error('Error fetching product seller:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        const sellerId = productResults[0].user_id; // 상품의 판매자 ID

        const query = `
            INSERT INTO User_Review (product_id, user_id, content, seller_id, enter_user_id, enter_date, enter_time, rating)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

        db.query(query, [productId, user_id, content, sellerId, user_id, enterDate, enterTime, rating], (err, results) => {
            if (err) {
                console.error('Error adding review:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            res.status(201).json({ id: results.insertId, message: 'Review added successfully' });
        });
    });
};

// 후기 수정
exports.updateReview = (req, res) => {
    const productId = req.params.id; // productId 가져오기
    const reviewId = req.params.reviewIndex; // reviewId 가져오기
    const { content, rating, user_id } = req.body; // user_id도 요청 본문에서 가져옵니다.

    // 데이터베이스에서 해당 후기 업데이트
    const query = `
        UPDATE User_Review
        SET content = ?, rating = ?, enter_user_id = ?, enter_date = ?, enter_time = ?
        WHERE id = ? AND product_id = ?`;

    const currentDate = new Date();
    const enterDate = currentDate.toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD 형식
    const enterTime = currentDate.toTimeString().split(' ')[0].slice(0, 5).replace(':', ''); // HHMM 형식

    db.query(query, [content, rating, user_id, enterDate, enterTime, reviewId, productId], (err, results) => {
        if (err) {
            console.error('Error updating review:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Review not found' });
        }

        // 평균 평점 업데이트
        calculateUserAverageRating(user_id, (err, averageRating) => {
            if (err) {
                console.error('Error calculating average rating:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            db.query('UPDATE User SET rating = ? WHERE id = ?', [averageRating, user_id], (err) => {
                if (err) {
                    console.error('Error updating user rating:', err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }

                res.json({ message: 'Review updated successfully' });
            });
        });
    });
};

// 후기 삭제
exports.deleteReview = (req, res) => {
    const productId = req.params.id;
    const reviewId = req.params.reviewIndex;

    db.query('DELETE FROM User_Review WHERE id = ? AND product_id = ?', [reviewId, productId], (err, results) => {
        if (err) {
            console.error('Error deleting review:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Review not found' });
        }

        // 평균 평점 업데이트
        const user_id = req.body.user_id; // user_id를 요청 본문에서 가져옴
        calculateUserAverageRating(user_id, (err, averageRating) => {
            if (err) {
                console.error('Error calculating average rating:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            db.query('UPDATE User SET rating = ? WHERE id = ?', [averageRating, user_id], (err) => {
                if (err) {
                    console.error('Error updating user rating:', err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }

                res.json({ message: 'Review deleted successfully' });
            });
        });
    });
};

// 문의 추가
exports.addInquiry = (req, res) => {
    const productId = req.params.id;
    const { asker, content } = req.body;

    // 현재 날짜 및 시간 설정
    const currentDate = new Date();
    const enterDate = currentDate.toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD
    const enterTime = currentDate.toTimeString().split(' ')[0].slice(0, 5).replace(':', ''); // HHMM

    // 데이터베이스에 문의 추가
    const query = `
        INSERT INTO Product_Comment (product_id, user_id, content, enter_date, enter_time)
        VALUES (?, ?, ?, ?, ?)`; // status 1은 문의를 의미

    db.query(query, [productId, asker, content, enterDate, enterTime], (err, results) => {
        if (err) {
            console.error('Error adding inquiry:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.json({ id: results.insertId, message: 'Inquiry added successfully' });
    });
};

// 문의 수정
exports.updateInquiry = (req, res) => {
    const inquiryId = req.params.inquiryIndex; // inquiryId를 URL 파라미터로 가져옴
    const { content } = req.body;

    console.log(req.params.inquiryIndex);
    console.log(inquiryId);
    console.log(content);

    const query = `
        UPDATE Product_Comment
        SET content = ?
        WHERE id = ?`; // status 1은 문의를 의미

    db.query(query, [content, inquiryId], (err, results) => {
        if (err) {
            console.error('Error updating inquiry:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Inquiry not found' });
        }

        res.json({ message: 'Inquiry updated successfully' });
    });
};

// 문의 삭제
exports.deleteInquiry = (req, res) => {
    const inquiryId = req.params.inquiryIndex; // inquiryId를 URL 파라미터로 가져옴

    console.log(req.params);

    db.query('DELETE FROM Product_Comment WHERE id = ?', [inquiryId], (err, results) => {
        if (err) {
            console.error('Error deleting inquiry:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Inquiry not found' });
        }

        res.json({ message: 'Inquiry deleted successfully' });
    });
};

// 대댓글 추가 API
exports.addReply = (req, res) => {
    const inquiryId = req.params.inquiryIndex; // 문의 ID
    const { content } = req.body; // 대댓글 내용

    // product 테이블에서 user_id를 가져오는 쿼리
    const getUserIdQuery = `SELECT user_id FROM Product WHERE id = ?`;

    db.query(getUserIdQuery, [req.params.id], (err, results) => {
        if (err) {
            console.error('Error retrieving user_id:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const userId = results[0].user_id; // 제품의 user_id

        // 현재 날짜와 시간 가져오기
        const now = new Date();
        const formattedDate = now.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD 형식
        const formattedTime = now.toTimeString().slice(0, 5).replace(":", ""); // HHMM 형식

        const query = `
            UPDATE Product_Comment
            SET reply_content = ?, reply_date = ?, reply_time = ?
            WHERE id = ?`;  // status 조건 제거

        db.query(query, [content, formattedDate, formattedTime, inquiryId], (err, results) => {
            if (err) {
                console.error('Error adding reply:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'Inquiry not found' });
            }

            res.json({ message: 'Reply added successfully', userId });
        });
    });
};

// 대댓글 수정 API
exports.updateReply = (req, res) => {
    const inquiryId = req.params.inquiryIndex; // 문의 ID
    const { content } = req.body; // 수정할 대댓글 내용

    // 현재 날짜와 시간 가져오기
    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD 형식
    const formattedTime = now.toTimeString().slice(0, 5).replace(":", ""); // HHMM 형식

    const query = `
        UPDATE Product_Comment
        SET reply_content = ?, reply_date = ?, reply_time = ?
        WHERE id = ?`; // status 조건 제거

    db.query(query, [content, formattedDate, formattedTime, inquiryId], (err, results) => {
        if (err) {
            console.error('Error updating reply:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Inquiry not found' });
        }

        res.json({ message: 'Reply updated successfully' });
    });
};

// 대댓글 삭제 API
exports.deleteReply = (req, res) => {
    const inquiryId = req.params.inquiryIndex; // 문의 ID

    const query = `
        UPDATE Product_Comment
        SET reply_content = NULL, reply_date = NULL, reply_time = NULL
        WHERE id = ?`; // status 조건 제거

    db.query(query, [inquiryId], (err, results) => {
        if (err) {
            console.error('Error deleting reply:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Inquiry not found' });
        }

        res.json({ message: 'Reply deleted successfully' });
    });
};