const express = require("express");
const router = express.Router();
const cors = require('cors');

// ✅ 허용할 도메인 목록
const allowedOrigins = ["https://sotong.com", "https://www.sotong.com"];

// ✅ CORS 미들웨어 설정 (Preflight 문제 해결)
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true); // 허용된 도메인이면 요청 허용
      } else {
        callback(new Error("CORS 정책에 의해 차단됨"));
      }
    },
    credentials: true, // ✅ 쿠키 및 인증 정보 포함 가능
    methods: ["GET", "POST", "OPTIONS"], // ✅ OPTIONS 추가
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200, // ✅ Preflight 요청 문제 해결
  })
);

// ✅ JSON 및 URL-encoded 미들웨어 적용
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ PostgreSQL 연결 설정
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

router.post("/", async (req, res) => {
  console.log("📥 요청 바디:", req.body);

  const { tomato_key } = req.body;

  if (!tomato_key) {
    console.error("❌ tomato_key 값이 없음!");
    return res.status(400).json({ error: "tomato_key 값이 필요합니다.", received_body: req.body });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM inquiry_board WHERE tomato_key = $1",
      [tomato_key]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "데이터 없음" });
    }

    res.json(result.rows);
  } catch (err) {
    console.error("❌ 데이터 조회 실패:", err.message);
    res.status(500).json({ error: "서버 오류", details: err.message });
  }
});

module.exports = router;
