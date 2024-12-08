const db = require('../config/db');

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
            }));

        res.json({ reviews, inquiries });
    });
};

// 후기 추가
exports.addReview = (req, res) => {
    const productId = req.params.id;
    const { user_id, content, rating } = req.body; // reviewer를 user_id로 변경

    // 현재 날짜 및 시간 설정
    const currentDate = new Date();
    const enterDate = currentDate.toISOString().split('T')[0].replace(/-/g, '');
    const enterTime = currentDate.toTimeString().split(' ')[0].slice(0, 5).replace(':', '');

    // 데이터베이스에 후기 추가
    const query = `
        INSERT INTO Product_Comment (product_id, user_id, content, enter_user_id, enter_date, enter_time, rating, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(query, [productId, user_id, content, user_id, enterDate, enterTime, rating, 0], (err, results) => {
        if (err) {
            console.error('Error adding review:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        // 성공적으로 후기가 추가된 경우
        res.status(201).json({ id: results.insertId, message: 'Review added successfully' });
    });
};

// 문의 추가
exports.addInquiry = (req, res) => {
    const productId = req.params.id;
    const { asker, content } = req.body;

    // 데이터베이스에 문의 추가
    db.query('UPDATE Product SET inquiries = JSON_ARRAY_APPEND(inquiries, "$", ?) WHERE id = ?', [JSON.stringify({ asker, content, date: new Date(), replies: [] }), productId], (err, results) => {
        if (err) {
            console.error('Error adding inquiry:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.json({ message: 'Inquiry added successfully' });
    });
};

// 후기 수정
exports.updateReview = (req, res) => {
    const productId = req.params.id; // productId 가져오기
    const reviewId = req.params.reviewIndex; // reviewId 가져오기
    const { content, rating } = req.body;

    // 데이터베이스에서 해당 후기 업데이트
    const query = `
        UPDATE Product_Comment
        SET content = ?, rating = ?
        WHERE id = ? AND product_id = ?`;

    db.query(query, [content, rating, reviewId, productId], (err, results) => {
        if (err) {
            console.error('Error updating review:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Review not found' });
        }

        res.json({ message: 'Review updated successfully' });
    });
};

// 후기 삭제
exports.deleteReview = (req, res) => {
    const productId = req.params.id; // productId 가져오기
    const reviewId = req.params.reviewIndex; // reviewId 가져오기

    // 데이터베이스에서 후기 삭제
    db.query('DELETE FROM Product_Comment WHERE id = ? AND product_id = ?', [reviewId, productId], (err, results) => {
        if (err) {
            console.error('Error deleting review:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Review not found' });
        }

        res.json({ message: 'Review deleted successfully' });
    });
};

// 문의 수정
exports.updateInquiry = (req, res) => {
    const { productId, inquiryIndex } = req.params;
    const { content } = req.body;

    db.query('SELECT inquiries FROM Product WHERE id = ?', [productId], (err, results) => {
        if (err) {
            console.error('Error fetching product:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        const inquiries = JSON.parse(results[0].inquiries);
        if (inquiries[inquiryIndex]) {
            inquiries[inquiryIndex].content = content;

            // 수정된 문의를 데이터베이스에 저장
            db.query('UPDATE Product SET inquiries = ? WHERE id = ?', [JSON.stringify(inquiries), productId], (err) => {
                if (err) {
                    console.error('Error updating inquiry:', err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                res.json({ message: 'Inquiry updated successfully' });
            });
        } else {
            return res.status(404).json({ error: 'Inquiry not found' });
        }
    });
};

// 문의 삭제
exports.deleteInquiry = (req, res) => {
    const { productId, inquiryIndex } = req.params;

    db.query('SELECT inquiries FROM Product WHERE id = ?', [productId], (err, results) => {
        if (err) {
            console.error('Error fetching product:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        const inquiries = JSON.parse(results[0].inquiries);
        if (inquiries[inquiryIndex]) {
            inquiries.splice(inquiryIndex, 1); // 문의 삭제

            // 수정된 문의를 데이터베이스에 저장
            db.query('UPDATE Product SET inquiries = ? WHERE id = ?', [JSON.stringify(inquiries), productId], (err) => {
                if (err) {
                    console.error('Error deleting inquiry:', err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                res.json({ message: 'Inquiry deleted successfully' });
            });
        } else {
            return res.status(404).json({ error: 'Inquiry not found' });
        }
    });
};