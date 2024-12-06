const db = require('../config/db');

// 대시보드 통계 데이터 조회
exports.GetDashboardStats = (req, res) => {
    db.query(`
        SELECT 
            COUNT(*) as total_users,
            SUM(CASE WHEN last_login_date >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as active_users
        FROM USER
    `, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results[0]);
    });
};

// 사용자 활동 데이터 조회 
exports.GetUserActivityTrend = (req, res) => {
    db.query(`
        SELECT 
            DATE_FORMAT(last_login_date, '%Y-%m-%d') as date,
            COUNT(*) as user_count
        FROM USER 
        WHERE last_login_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY DATE_FORMAT(last_login_date, '%Y-%m-%d')
        ORDER BY date ASC
    `, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
};

// 권한 그룹 분포 데이터 조회
exports.GetAuthGroupDistribution = (req, res) => {
    db.query(`
        SELECT 
            agn.Group_Name,
            COUNT(DISTINCT u.Id) as user_count
        FROM AUTH_GROUP_NAME agn
        LEFT JOIN USER u ON u.Auth_Group_Id = agn.Id
        GROUP BY agn.Id, agn.Group_Name
    `, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
};

// 카테고리별 판매 현황
exports.GetCategorySales = (req, res) => {
    db.query(`
        SELECT 
            pc.name as category_name,
            COUNT(p.Id) as total_count,
            COUNT(CASE WHEN p.status_id = 2 THEN 1 END) as sold_count,
            AVG(p.price) as avg_price
        FROM Product_Category pc
        LEFT JOIN Product p ON pc.Id = p.category_id
        GROUP BY pc.Id, pc.name
        ORDER BY sold_count DESC
    `, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
};

// 서브카테고리별 상품 현황
exports.GetSubCategoryProducts = (req, res) => {
    db.query(`
        SELECT 
            pc.name as category_name,
            psc.name as subcategory_name,
            COUNT(p.Id) as product_count,
            SUM(p.view_count) as total_views
        FROM Product_Sub_Category psc
        JOIN Product_Category pc ON psc.Category_Id = pc.Id
        LEFT JOIN Product p ON psc.sub_id = p.category_sub_id
        GROUP BY pc.Id, pc.name, psc.sub_id, psc.name
        ORDER BY product_count DESC
    `, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
};

// 인기 상품 TOP 10
exports.GetPopularProducts = (req, res) => {
    db.query(`
        SELECT 
            p.Id,
            p.title,
            p.price,
            p.view_count,
            pc.name as category_name,
            u.Nic_Name as seller_name,
            COUNT(pc2.Id) as comment_count
        FROM Product p
        JOIN Product_Category pc ON p.category_id = pc.Id
        JOIN USER u ON p.user_id = u.Id
        LEFT JOIN Product_Comment pc2 ON p.Id = pc2.product_id
        WHERE p.status_id = 1
        GROUP BY p.Id, p.title, p.price, p.view_count, pc.name, u.Nic_Name
        ORDER BY p.view_count DESC
        LIMIT 10
    `, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
};

// 가격대별 상품 분포
exports.GetPriceDistribution = (req, res) => {
    db.query(`
        SELECT 
            CASE 
                WHEN price <= 10000 THEN '1만원 이하'
                WHEN price <= 50000 THEN '5만원 이하'
                WHEN price <= 100000 THEN '10만원 이하'
                WHEN price <= 500000 THEN '50만원 이하'
                ELSE '50만원 초과'
            END as price_range,
            COUNT(*) as product_count
        FROM Product
        WHERE status_id = 1
        GROUP BY 
            CASE 
                WHEN price <= 10000 THEN '1만원 이하'
                WHEN price <= 50000 THEN '5만원 이하'
                WHEN price <= 100000 THEN '10만원 이하'
                WHEN price <= 500000 THEN '50만원 이하'
                ELSE '50만원 초과'
            END
        ORDER BY 
            MIN(price)
    `, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
};

// 최근 거래 활동
exports.GetRecentActivities = (req, res) => {
    db.query(`
        SELECT 
            p.Id,
            p.title,
            p.price,
            ps.name as status,
            p.Enter_Date,
            p.Enter_Time,
            u.Nic_Name as seller_name
        FROM Product p
        JOIN Product_Status ps ON p.status_id = ps.Id
        JOIN USER u ON p.user_id = u.Id
        ORDER BY p.Enter_Date DESC, p.Enter_Time DESC
        LIMIT 10
    `, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
};
