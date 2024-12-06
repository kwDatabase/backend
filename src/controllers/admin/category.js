var express = require('express');
const db = require('../../config/db');

exports.SelectAllCategory = (req, res) => {
    db.query("SELECT c.Id , c.name, c.sort_number AS category_sort_number, s.sub_id, s.name AS sub_category_name, s.sort_number AS sub_category_sort_number FROM Product_Category c LEFT JOIN Product_Sub_Category s ON c.Id = s.Category_Id;", (err, results) => {
        if (err) return res.status(500).send(err);
        const categoriesMap = new Map();

        results.forEach(row => {
          if (!categoriesMap.has(row.Id)) {
            categoriesMap.set(row.Id, {
              Id: row.Id,
              name: row.name,
              sort_number: row.category_sort_number,
              sub_category: []
            });
          }

          if (row.sub_id) {
            const category = categoriesMap.get(row.Id);
            category.sub_category.push({
              sub_id: row.sub_id,
              name: row.sub_category_name,
              sort_number: row.sub_category_sort_number,
            });
          }
        });

        const categories = Array.from(categoriesMap.values());
        console.log(categories);
        res.json(categories);
    });
};
exports.CheckCategoryName = (req, res) => {
    const name = req.params.name;
    db.query("SELECT EXISTS (SELECT 1 FROM Product_Category WHERE name = ?) as `exists`", [name], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json({ exists: results[0].exists === 1 });
    });
};

exports.CreateCategory = async (req, res) => {
    const { name, Enter_User_Id } = req.body;
    var next_sort_number = await getCategoryMaxSortNo() + 1;
    var date = new Date();
    var Enter_Date = date.getFullYear() + ('' + date.getMonth()) + date.getDate();
    var Enter_Time = date.getHours() + ('' + date.getMinutes());
    const sql = 'INSERT INTO Product_Category (name, sort_number, Enter_User_Id, Enter_Date, Enter_Time) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [name, next_sort_number, Enter_User_Id, Enter_Date, Enter_Time], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ id: result.insertId, message: 'Category created' });
    });
}

exports.UpdateCategory = (req, res) => {
    const { id } = req.params;
    const { name, sort_number, Modify_User_Id, Modify_Date, Modify_Time } = req.body;
    const sql = 'UPDATE Product_Category SET name = ?, sort_number = ?, Modify_User_Id = ?, Modify_Date = ?, Modify_Time = ? WHERE Id = ?';
    db.query(sql, [name, sort_number, Modify_User_Id, Modify_Date, Modify_Time, id], (err) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Category updated' });
    });
}

exports.DeleteCategory = (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM Product_Category WHERE Id = ?', [id], (err) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Category deleted' });
    });
};

exports.SelectAllSubCategory = (req, res) => {
    const { categoryId } = req.params;
    db.query('SELECT * FROM Product_Sub_Category WHERE Category_Id = ? ORDER BY sort_number', [categoryId], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
};

exports.CreateSubCategory = async (req, res) => {
    const categoryId  = req.params.categoryId;
    const { name } = req.body;
    var Enter_User_Id;
    var Enter_Date = '';
    var Enter_Time = '';

    var date = get_curent_date();
    Enter_Date = date.date_str;
    Enter_Time = date.time_str;
    var next_sort_number = await getSubCategoryMaxSortNoByCategoryId(categoryId) + 1;
    const sql = 'INSERT INTO Product_Sub_Category (Category_Id, name, sort_number, Enter_User_Id, Enter_Date, Enter_Time) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [categoryId, name, next_sort_number, Enter_User_Id, Enter_Date, Enter_Time], (err, result) => {
        console.log(err);
        if (err) return res.status(500).send(err);
        res.json({ id: result.insertId, message: 'Subcategory created' });
    });
};

exports.UpdateSubCategory = (req, res) => {
    const categoryId  = req.params.categoryId;
    const subCategoryId  = req.params.id;
    const { name } = req.body;
    var date = get_curent_date();
    var Modify_Date = date.date_str;
    var Modify_Time = date.time_str;
    const sql = 'UPDATE Product_Sub_Category SET name = ?, Modify_Date = ?, Modify_Time = ? WHERE sub_id = ? AND Category_Id = ?';
    db.query(sql, [name, Modify_Date, Modify_Time, subCategoryId, categoryId], (err) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Subcategory updated' });
    });
};

exports.DeleteAllSubCategory =(req, res) => {
    const categoryId  = req.params.categoryId;
    const subCategoryId  = req.params.id;
    db.query('DELETE FROM Product_Sub_Category WHERE sub_id = ? AND Category_Id = ?', [subCategoryId, categoryId], (err) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Subcategory deleted' });
    });
};

function getCategoryMaxSortNo() {
    return new Promise((resolve, reject) => {
        db.query(
            'SELECT MAX(sort_number) AS max_sort_number FROM Product_Category',
            [],
            (err, result) => {
                if (err) {
                    console.error('Error fetching max max_sort_number:', err);
                    reject(err);
                    return;
                }
                const maxSortNo = result[0]?.max_sort_number ?? 0;
                console.log(maxSortNo);
                resolve(maxSortNo);
            }
        );
    });
}

function getSubCategoryMaxSortNoByCategoryId(categoryId) {
    return new Promise((resolve, reject) => {
        db.query(
            'SELECT MAX(sort_number) AS max_sort_number FROM Product_Sub_Category WHERE Category_Id = ?',
            [categoryId - 0],
            (err, result) => {
                if (err) {
                    console.error('Error fetching max max_sort_number:', err);
                    reject(err);
                    return;
                }
                const maxSortNo = result[0]?.max_sort_number ?? 0;
                console.log(maxSortNo);
                resolve(maxSortNo);
            }
        );
    });
}

function getMaxSortNo() {
    return new Promise((resolve, reject) => {
        db.query(
            'SELECT MAX(sort_number) AS max_sort_number FROM Product_Sub_Category WHERE Category_Id = ?',
            [categoryId - 0],
            (err, result) => {
                if (err) {
                    console.error('Error fetching max max_sort_number:', err);
                    reject(err);
                    return;
                }
                const maxSortNo = result[0]?.max_sort_number ?? 0;
                console.log(maxSortNo);
                resolve(maxSortNo);
            }
        );
    });
}


function getSubCategoriByCategoryId(categoryId) {
    return new Promise((resolve, reject) => {
        db.query(
            'SELECT * FROM Product_Sub_Category WHERE Category_Id = ?',
            [categoryId - 0],
            (err, result) => {
                if (err) {
                    console.error('Error fetching :', err);
                    reject(err);
                    return;
                }
                console.log(result);
                resolve(result);
            }
        );
    });
}

function get_curent_date(){
    var date = new Date();
    var date_str = date.getFullYear() + ('' + date.getMonth()) + date.getDate();
    var time_str = date.getHours() + ('' + date.getMinutes());
    return {date_str, time_str};
}