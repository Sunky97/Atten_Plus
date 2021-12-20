const { Router } = require("express");
const { Challenge } = require("../models");
const multer = require("multer");
var fs = require("fs");
var path = require("path");
require("dotenv/config");
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./routes/data/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now());
  },
});
const upload = multer({ storage: storage });

const router = Router();

router.get("/", async (req, res, next) => {
  res.render("createPage");
});


router.post("/", upload.single("uploaded_file"), async (req, res, next) => {
  const {
    title,
    description,
    exercise_check,
    life_check,
    emotion_check,
    competency_check,
    hobby_check,
    startdate,
    enddate,
  } = req.body;
  const category_arr = [
    exercise_check,
    life_check,
    emotion_check,
    competency_check,
    hobby_check,
  ];
  const img = {
    data: fs.readFileSync(
      path.join(__dirname + "/data/uploads/" + req.file.filename)
    ),
    contentType: "image/png",
  };

  let category = "";
  for (let i = 0; i < 5; i++) {
    if (category_arr[i] !== undefined) {
      category = category_arr[i];
    }
  }
  try {
    const post = await Challenge.create({
      img,
      title,
      description,
      category,
      startdate,
      enddate,
    });
    res.redirect("/");
  } catch (err) {
    next(err);
  }
});


router.get("/:shortId", async (req, res, next) => {
  const { shortId } = req.params;
  const challenge = await Challenge.findOne({
    shortId,
  });

  res.send(challenge);
});

router.post("/:shortId", async (req, res, next) => {
  const { shortId } = req.params;
  const { title, description, category, startdate, enddate } = req.body;

  try {
    await Challenge.updateOne(
      { shortId },
      {
        title,
        description,
        category,
        startdate,
        enddate,
      }
    );
    res.redirect(`/posts/${shortId}`);
  } catch (err) {
    next(err);
  }
});

router.delete("/:shortId", async (req, res, next) => {
  const { shortId } = req.params;
  await Challenge.deleteOne({ shortId });
  res.send("OK");
});
module.exports = router;
