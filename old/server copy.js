require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
const port = 3006;

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

// ✅ Preflight 요청(OPTIONS) 직접 처리
app.options("*", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.sendStatus(200);
});

// 🔍 특정 tomato_key 값으로 데이터 조회 API
app.post("/records", async (req, res) => {
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

// 🚀 서버 실행
app.listen(port, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${port}`);
});


