const multer = require('multer');
const path = require('path');

// multer 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '/public/uploads/'); // 파일을 저장할 경로
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // 파일 이름 설정
    }
});

// multer 인스턴스 생성
const upload = multer({ storage: storage });

// export
module.exports = upload;