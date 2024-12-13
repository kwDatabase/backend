const multer = require('multer');
const path = require('path');

const fs = require('fs');

// 파일 저장 경로
const uploadPath = path.join(__dirname, '../../public/uploads/');

// uploads 디렉토리가 존재하지 않으면 생성
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

// multer 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath); // 올바른 파일을 저장할 경로

    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // 파일 이름 설정
    }
});

// multer 인스턴스 생성
const upload = multer({ storage: storage });

// export
module.exports = upload;