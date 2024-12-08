var express = require('express');
const db = require('../../config/db');

exports.SelectAllUser = (req, res) => {
    const query = `
        SELECT 
            U.Id,
            U.Name,
            U.Nic_Name,
            U.Enter_Date,
            AGN.Name as Auth_Group_Name,
            AGN.Id as Auth_Group_Id,
            COUNT(P.Id) as Product_Count
        FROM USER U
        LEFT JOIN AUTH_GROUP_NAME AGN ON U.AUTH_GROUP_ID = AGN.Id
        LEFT JOIN Product P ON U.Id = P.user_id
        GROUP BY 
            U.Id,
            U.Name,
            U.Nic_Name,
            U.Enter_Date,
            AGN.Name,
            AGN.Id
        ORDER BY U.Enter_Date DESC
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('사용자 목록 조회 실패:', err.message);
            return res.status(500).json({error: '사용자 목록 조회에 실패했습니다'});
        }
        res.json(results);
    });
};

exports.GetAuthGroups = (req, res) => {
    const query = 'SELECT Id, Name FROM AUTH_GROUP_NAME ORDER BY Name';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('권한 그룹 목록 조회 실패:', err.message);
            return res.status(500).json({error: '권한 그룹 목록 조회에 실패했습니다'});
        }
        res.json(results);
    });
};

exports.UpdateUser = (req, res) => {
    const { id } = req.params;
    const { name, nicName } = req.body;
    
    if (!id || !name || !nicName) {
        return res.status(400).json({error: '필수 입력값이 누락되었습니다'});
    }

    const date = new Date();
    const modifyDate = date.getFullYear() + String(date.getMonth() + 1).padStart(2, '0') + String(date.getDate()).padStart(2, '0');
    const modifyTime = String(date.getHours()).padStart(2, '0') + String(date.getMinutes()).padStart(2, '0');

    const query = `
        UPDATE USER 
        SET 
            Name = ?,
            Nic_Name = ?,
            Modify_Date = ?,
            Modify_Time = ?,
            Modify_User_Id = 'SYSTEM'
        WHERE Id = ?
    `;

    db.query(query, [name, nicName, modifyDate, modifyTime, id], (err, result) => {
        if (err) {
            console.error('사용자 정보 수정 실패:', err.message);
            return res.status(500).json({error: '사용자 정보 수정에 실패했습니다'});
        }

        res.json({
            message: '사용자 정보가 수정되었습니다',
            userId: id
        });
    });
};

exports.DeleteUser = (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({error: '사용자 ID가 필요합니다'});
    }

    const query = 'DELETE FROM USER WHERE Id = ?';

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('사용자 삭제 실패:', err.message);
            return res.status(500).json({error: '사용자 삭제에 실패했습니다'});
        }

        res.json({
            message: '사용자가 삭제되었습니다',
            userId: id
        });
    });
};

exports.UpdateUserAuthGroup = (req, res) => {
    const { userId, authGroupId } = req.body;
    
    if (!userId) {
        return res.status(400).json({error: '사용자 ID가 필요합니다'});
    }

    const date = new Date();
    const modifyDate = date.getFullYear() + String(date.getMonth() + 1).padStart(2, '0') + String(date.getDate()).padStart(2, '0');
    const modifyTime = String(date.getHours()).padStart(2, '0') + String(date.getMinutes()).padStart(2, '0');

    const query = `
        UPDATE USER 
        SET 
            AUTH_GROUP_ID = ?,
            Modify_Date = ?,
            Modify_Time = ?,
            Modify_User_Id = 'SYSTEM'
        WHERE Id = ?
    `;

    db.query(query, [authGroupId, modifyDate, modifyTime, userId], (err, result) => {
        if (err) {
            console.error('사용자 권한 수정 실패:', err.message);
            return res.status(500).json({error: '사용자 권한 수정에 실패했습니다'});
        }

        const logQuery = `
            INSERT INTO LOG_history (
                user_id, 
                log, 
                log_code,
                Enter_User_Id,
                Enter_Date,
                Enter_Time
            ) VALUES (?, ?, ?, ?, ?, ?)
        `;

        const logMessage = `사용자 ${userId}의 권한 그룹이 ${authGroupId || 'NULL'}로 변경되었습니다`;
        
        db.query(logQuery, [
            userId,
            logMessage,
            2, 
            'SYSTEM',
            modifyDate,
            modifyTime
        ], (logErr) => {
            if (logErr) {
                console.error('로그 기록 실패:', logErr.message);
            }
        });

        res.json({ 
            message: '사용자 권한이 업데이트되었습니다.',
            userId,
            newAuthGroupId: authGroupId
        });
    });
};