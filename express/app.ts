import cors from "cors";
import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import bodyParser from "body-parser";

require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

let db: any;
const PORT = process.env.PORT;
const url = process.env.MONGO_URI as string;

new MongoClient(url)
  .connect()
  .then((client) => {
    app.listen(PORT, () => {
      console.log("실행중", { PORT });
    });
    console.log("DB연결성공");
    db = client.db("forum");
  })
  .catch((err) => {
    console.error("DB 연결 에러:", err);
  });

app.get("/api/list", async (req, res) => {
  try {
    const result = await db.collection("post").find().toArray();
    res.json(result);
  } catch (error) {
    console.log(error);
  }
});
app.delete("/api/list/:id", async (req, res) => {
  const postId = req.params.id;

  try {
    const result = await db
      .collection("post")
      .deleteOne({ _id: new ObjectId(postId) });
    if (result.deletedCount === 1) {
      res.status(200).send("삭제 완료");
    } else {
      res.status(404).send("삭제할 데이터를 찾지 못했습니다.");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("삭제 중 에러 발생");
  }
});
app.post("/api/list", async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    // req.body가 비어있거나 빈 객체인 경우
    throw new Error("빈 값");
  }
  try {
    await db
      .collection("post")
      .insertOne({ title: req.body.title, content: req.body.content });
    res.status(200).send("완료");
  } catch (error) {
    console.log(error);
  }
});

app.get("/api/list/:page", async (req, res) => {
  let pageIndex = req.params.page;
  if (Number(pageIndex) === 0) {
    try {
      const result = await db.collection("post").find().limit(5).toArray();
      res.json(result);
    } catch (error) {
      console.log(error);
    }
  } else {
    console.log(pageIndex);
    try {
      const result = await db
        .collection("post")
        .find()
        .skip(Number(pageIndex) * 5)
        .limit(Number(pageIndex) * 5)
        .toArray();
      res.json(result);
    } catch (error) {
      console.log(error);
    }
  }
});

app.post("/api/join", async (req, res) => {
  try {
    await db.collection("user").insertOne({
      email: req.body.email,
      password: req.body.pwd,
    });
    res.status(200).send("성공");
  } catch (error) {
    console.log(error);
    return error;
  }
});
