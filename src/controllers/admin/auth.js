var express = require('express');
const db = require('../../config/db');

exports.SelectAllAuth = (req, res) => {
    db.query("SELECT Id, Name FROM AUTH ORDER BY Name", (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
};

exports.SelectAllAuthGroups = (req, res) => {
    const query = `
        SELECT 
            AGN.Id,
            AGN.Name,
            COALESCE(
                JSON_ARRAYAGG(
                    IF(A.Id IS NOT NULL,
                        JSON_OBJECT(
                            'Id', A.Id,
                            'Name', A.Name
                        ),
                        NULL
                    )
                ),
                '[]'
            ) as Auths
        FROM AUTH_GROUP_NAME AGN
        LEFT JOIN AUTH_GROUP AG ON AGN.Id = AG.GROUP_ID
        LEFT JOIN AUTH A ON AG.AUTH_ID = A.Id
        GROUP BY AGN.Id, AGN.Name
        ORDER BY AGN.Name
    `;

    db.query(query, (err, results) => {
        if (err) return res.status(500).send(err);
        
        const formattedResults = results.map(group => {
            let auths = [];
            try {
                auths = JSON.parse(group.Auths).filter(auth => auth !== null);
            } catch (e) {
                console.error('JSON 파싱 에러:', e);
            }
            
            return {
                Id: group.Id,
                Name: group.Name,
                Auths: auths
            };
        });

        res.json(formattedResults);
    });
};

exports.CreateAuthGroup = (req, res) => {
    const { name, auths } = req.body;
    
    db.query('INSERT INTO AUTH_GROUP_NAME (Name) VALUES (?)', [name], (err, result) => {
        if (err) return res.status(500).send(err);
        
        const groupId = result.insertId;
        const date = new Date();
        const Enter_Date = date.getFullYear() + String(date.getMonth() + 1).padStart(2, '0') + String(date.getDate()).padStart(2, '0');
        const Enter_Time = String(date.getHours()).padStart(2, '0') + String(date.getMinutes()).padStart(2, '0');
        
        const values = auths.map(authId => [
            groupId,
            authId,
            'SYSTEM',
            Enter_Date,
            Enter_Time
        ]);
        
        const sql = 'INSERT INTO AUTH_GROUP (GROUP_ID, AUTH_ID, Enter_User_Id, Enter_Date, Enter_Time) VALUES ?';
        
        db.query(sql, [values], (err) => {
            if (err) return res.status(500).send(err);
            res.json({ message: '권한 그룹이 생성되었습니다.', groupId });
        });
    });
};

exports.UpdateAuthGroup = (req, res) => {
    const { id } = req.params;
    const { name, auths } = req.body;
    
    db.beginTransaction(async (err) => {
        if (err) return res.status(500).send(err);

        try {
            await new Promise((resolve, reject) => {
                db.query('UPDATE AUTH_GROUP_NAME SET Name = ? WHERE Id = ?', [name, id], (err) => {
                    if (err) reject(err);
                    resolve();
                });
            });

            await new Promise((resolve, reject) => {
                db.query('DELETE FROM AUTH_GROUP WHERE GROUP_ID = ?', [id], (err) => {
                    if (err) reject(err);
                    resolve();
                });
            });

            if (auths && auths.length > 0) {
                const date = new Date();
                const Enter_Date = date.getFullYear() + String(date.getMonth() + 1).padStart(2, '0') + String(date.getDate()).padStart(2, '0');
                const Enter_Time = String(date.getHours()).padStart(2, '0') + String(date.getMinutes()).padStart(2, '0');

                const values = auths.map(authId => [
                    id,
                    authId,
                    'SYSTEM',
                    Enter_Date,
                    Enter_Time
                ]);

                await new Promise((resolve, reject) => {
                    db.query('INSERT INTO AUTH_GROUP (GROUP_ID, AUTH_ID, Enter_User_Id, Enter_Date, Enter_Time) VALUES ?', [values], (err) => {
                        if (err) reject(err);
                        resolve();
                    });
                });
            }

            db.commit((err) => {
                if (err) {
                    return db.rollback(() => {
                        res.status(500).send(err);
                    });
                }
                res.json({ message: '권한 그룹이 수정되었습니다.' });
            });

        } catch (error) {
            return db.rollback(() => {
                res.status(500).send(error);
            });
        }
    });
};

exports.DeleteAuthGroup = (req, res) => {
    const { id } = req.params;
    
    db.query('DELETE FROM AUTH_GROUP_NAME WHERE Id = ?', [id], (err) => {
        if (err) return res.status(500).send(err);
        res.json({ message: '권한 그룹이 삭제되었습니다.' });
    });
};
