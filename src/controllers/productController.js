const db = require('../config/db');
const upload = require('../middleware/upload'); // multer 설정

// 상품 목록 조회
exports.getProducts = (req, res) => {
    const query = `
        SELECT p.id, p.user_id, p.title, p.content, p.price, p.status_id, p.view_count, p.image,
               p.category_id, p.category_sub_id, p.enter_user_id, p.enter_date, p.enter_time, 
               u.rating AS rating, u.Nic_Name AS user_name,
               c.name AS category_name, sc.name AS sub_category_name
        FROM Product p
        LEFT JOIN User u ON p.enter_user_id = u.id
        LEFT JOIN Product_Category c ON p.category_id = c.id
        LEFT JOIN Product_Sub_Category sc ON p.category_sub_id = sc.sub_id;`;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching products:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        // 결과를 가공하여 반환
        const products = results.map(product => ({
            id: product.id,
            user_id: product.user_id,
            user_name: product.user_name,
            title: product.title,
            content: product.content,
            price: product.price,
            status_id: product.status_id,
            view_count: product.view_count,
            image: product.image,
            category_id: product.category_id,
            category_sub_id: product.category_sub_id,
            category_name: product.category_name, 
            sub_category_name: product.sub_category_name,
            rating: product.rating || 0, // 평점 정보, 기본값 0
            enter_date: product.enter_date,
            enter_time: product.enter_time,
        }));

        res.json(products);
    });
};

// 상품 상세 조회
exports.getProductById = (req, res) => {
    const productId = req.params.id; // URL 파라미터로부터 상품 ID를 가져옴
    const query = `
        SELECT p.id, p.title, p.image, p.price, p.content, p.status_id, p.user_id,
        p.category_id, p.category_sub_id, u.Nic_Name AS user_name, u.rating AS user_rating,
            c.name AS category_name, sc.name AS sub_category_name

        FROM Product p
        JOIN User u ON p.user_id = u.id
        LEFT JOIN Product_Category c ON p.category_id = c.id
        LEFT JOIN Product_Sub_Category sc ON p.category_sub_id = sc.sub_id
        WHERE p.id = ? `;
 
    db.query(query, [productId], (err, results) => {
        if (err) {
            console.error('Error fetching product:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }


        const product = results[0]; // 첫 번째 결과만 반환

        // 추가: User_Review에서 리뷰를 가져오는 쿼리
        db.query('SELECT * FROM User_Review WHERE product_id = ?', [productId], (err, reviewResults) => {
            if (err) {
                console.error('Error fetching reviews:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            const reviews = reviewResults.map(review => ({
                id: review.id, // id 추가
                sellerId: review.seller_id,
                rating: review.rating,
                content: review.content,
                userId: review.user_id,
                date: `${ review.enter_date } ${ review.enter_time } `,
                modifyUserId: review.modify_user_id,
                modifyDate: `${ review.modify_date } ${ review.modify_time } `,
            }));

            // 추가: Product_Comment에서 문의를 가져오는 쿼리
            db.query('SELECT * FROM Product_Comment WHERE product_id = ?', [productId], (err, commentResults) => {
                if (err) {
                    console.error('Error fetching inquiries:', err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }

                const inquiries = commentResults.map(comment => ({
                    id: comment.id,
                    userId: comment.user_id,
                    content: comment.content,
                    date: `${ comment.enter_date } ${ comment.enter_time } `,
                    replyContent: comment.reply_content,
                    replyDate: `${ comment.reply_date } ${ comment.reply_time } `,
                }));

                // 최종 응답
                res.json({
                    id: product.id,
                    title: product.title,
                    image: product.image,
                    price: product.price,
                    content: product.content,
                    status: product.status_id,
                    seller_id: product.seller_id,
                    user_id: product.user_id,
                    user_rating: product.user_rating,
                    nicNmae: product.user_name,
                    category_name: product.category_name, // 카테고리 이름 추가
                    sub_category_name: product.sub_category_name, // 서브 카테고리 이름 추가
                    reviews, // User_Review에서 가져온 리뷰
                    inquiries // Product_Comment에서 가져온 문의 
                });

            });
        });
    });
};

// 상품 조회수 증가
exports.incrementViewCount = (req, res) => {
    const productId = req.params.id;

    db.query('UPDATE Product SET view_count = view_count + 1 WHERE id = ?', [productId], (err, results) => {
        if (err) {
            console.error('Error updating view count:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.json({ message: 'View count updated successfully' });
    });
};

// 상품 추가
exports.addProduct = (req, res) => {
    console.log("back addProduct entry");
    console.log("Request Body:", req.body);
    console.log("Uploaded File:", req.file);

    if (!req.file) {
        return res.status(400).json({ error: 'Image file is required' });
    }

    const { title, content, price, category_id, sub_category_id, user_id } = req.body;

    const enter_user_id = user_id; // 현재 사용자 ID
    const enter_date = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD 형식
    const enter_time = new Date().toISOString().slice(11, 19).replace(/:/g, '').slice(0, 4); // HHMM 형식

    // 이미지 파일 경로를 저장
    const image = req.file ? `/ uploads / ${ req.file.filename } ` : null;

    const newProduct = {
        user_id,
        title,
        content,
        price,
        status_id: 1,
        view_count: 0, // 초기 조회수 0
        category_id,
        category_sub_id: sub_category_id,
        enter_user_id,
        enter_date,
        enter_time,
        image, // 이미지 URL 추가
    };

    console.log("newProduct: ", newProduct);

    db.query('INSERT INTO Product SET ?', newProduct, (err, results) => {
        if (err) {
            console.error('Error adding product:', err);
            console.log("newProduct: ", newProduct);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.json({ id: results.insertId, ...newProduct });
    });

};

// 상품 수정 정보 조회
exports.getProductForEdit = (req, res) => {
    const productId = req.params.id; // URL 파라미터로부터 상품 ID를 가져옴
    const query = `
        SELECT p.id, p.title, p.image, p.price, p.content, p.category_id, p.status_id, u.name AS user_name, u.rating AS user_rating
        FROM Product p
        JOIN User u ON p.user_id = u.id
        WHERE p.id = ? `;

    db.query(query, [productId], (err, results) => {
        if (err) {
            console.error('Error fetching product:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(results[0]); // 첫 번째 결과만 반환
    });
};

// 상품 수정 API
exports.updateProduct = [
    upload.single('image_file'), // 'image_file'로 설정된 필드 처리
    (req, res) => {
        const { id } = req.params;
        const { title, content, price, status_id, category_id, image } = req.body;

        // 필수 필드 체크
        if (!title || !content || !price || !status_id || !category_id) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const updatedProduct = {
            title,
            content,
            price,
            status_id: parseInt(status_id, 10), // 정수로 변환
            category_id,
            image: req.file ? req.file.path.replace(/\\/g, '/') : image, // 새 이미지가 있을 경우 새 경로로 설정, 없으면 기존 경로 사용
        };

        // 데이터베이스 쿼리 실행
        db.query('UPDATE Product SET ? WHERE id = ?', [updatedProduct, id], (err, results) => {
            if (err) {
                console.error('Error updating product:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            // 수정된 행이 없을 경우
            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'Product not found' });
            }

            res.json({ message: 'Product updated successfully' });
        });
    }
];

// 상품 삭제
exports.deleteProduct = (req, res) => {

    const productId = req.params.id;

    console.log("deleteProduct: ", req);

    const query = 'DELETE FROM Product WHERE id = ?';
    db.query(query, [productId], (err, results) => {
        if (err) {
            console.error('Error deleting product:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({ message: 'Product deleted successfully' });
    });
};

// 카테고리 및 서브 카테고리 조회
exports.getCategories = (req, res) => {
    const queryCategories = 'SELECT id, name FROM Product_Category';
    const querySubCategories = 'SELECT sub_id, category_id, name FROM Product_Sub_Category';

    db.query(queryCategories, (err, categories) => {
        if (err) {
            console.error('Error fetching categories:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        db.query(querySubCategories, (err, subCategories) => {
            if (err) {
                console.error('Error fetching subcategories:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            res.json({ categories, subCategories });
        });
    });
};

// 상품 구매
exports.purchaseProduct = (req, res) => {
    const productId = req.params.id;

    // 상품 상태를 2로 업데이트
    const query = 'UPDATE Product SET status_id = ? WHERE id = ?';
    db.query(query, [2, productId], (error, results) => {
        if (error) {
            console.error('Error purchasing product:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        // 상태 업데이트가 성공적으로 완료된 경우
        res.json({ message: '상품 구매가 완료되었습니다.' });
    });
};

// 상품 판매 중단
exports.stopProductSale = (req, res) => {
    const productId = req.params.id;
    console.log("start backlog", productId);

    // 상품 상태를 3으로 업데이트
    const query = 'UPDATE Product SET status_id = ? WHERE id = ?';
    db.query(query, [3, productId], (error, results) => {
        if (error) {
            console.error('Error stopping product sale:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        // 상태 업데이트가 성공적으로 완료된 경우
        res.json({ message: '상품 판매가 중지되었습니다.' });
    });
};