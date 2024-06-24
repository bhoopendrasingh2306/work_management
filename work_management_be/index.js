const express = require("express");
const cors = require("cors");
const multer = require("multer");
require("./db/config");
const users = require("./db/users");
// const images = require("./db/images");
const todo = require("./db/todo");
const notes = require("./db/notes");
const app = express();
const validator = require("validator");
const passwordValidator = require("password-validator");
const cloudinary = require("./utils/cloudinary");
// const profileUpload = require("./utils/cloudinary/")

const jwt = require("jsonwebtoken");
const jwtKey = "e-comm";

app.use(express.json());
app.use(cors());

//signup

app.post("/signup", async (req, resp) => {
  const schema = new passwordValidator();
  schema
    .is()
    .min(8) // Minimum length 8
    .is()
    .max(100) // Maximum length 100
    .has()
    .uppercase() // Must have uppercase letters
    .has()
    .lowercase() // Must have lowercase letters
    .has()
    .digits() // Must have digits
    .has()
    .not()
    .spaces();
  try {
    const { name, email, password } = req.body;
    const result = {
      name: name,
      email: email,
      password: password,
    };
    let Token;

    if (!validator.isEmail(email)) {
      return resp.status(400).json({ error: "Invalid email address" });
    }
    //password validation check
    const isValid = schema.validate(password);
    if (!isValid) {
      return resp.status(400).json({ message: "Password is not valid" });
    }
    let userCheck = await users.findOne({ email: email });
    console.log("uZER chack:", userCheck);
    if (userCheck) {
      return resp.status(400).json({ message: "user already exists" });
    } else {
      // this jwt token will be generated when we signup
      jwt.sign({ result }, jwtKey, { expiresIn: "2h" }, (err, token) => {
        if (err) {
          resp.send({ result: "something went wrong or token expired" });
        }else{
          Token = token;
        }
      });
    }
    let valu = new users(req.body);
    let data = await valu.save();
    data = data.toObject();
    resp.status(200).send({ data, auth: Token });

  } catch (err) {
    console.log("end Err", err);
    resp.status(400).json({ err: "something went wrongg" });
  }
});

app.post("/login", async (req, resp) => {
  console.log("login api", req.body);
  if (req.body.email && req.body.password) {
    // user stores output return by the database
    let user = await users.findOne(req.body).select("-password");
    if (user) {
      // this jwt token is generated while login expiresin defines time after which token will be expired
      jwt.sign({ user }, jwtKey, { expiresIn: "2h" }, (err, token) => {
        if (err) {
          resp.send({ result: "something went wrong or token expired" });
        } else {
          resp.status(200).send({ user, auth: token });
        }
      });
    } else {
      resp.send({ result: "No user found!" });
    }
  } else {
    resp.send({ result: "No user found!" });
  }
});

function verifyToken(req, resp, next) {
  let token = req.headers["authorization"];
  if (token) {
    token = token.split(" ")[1];
    jwt.verify(token, jwtKey, (err, valid) => {
      if (err) {
        resp.status(401).send({ result: "please add valid token" });
      } else {
        req.user = valid.user;
        console.log("validity:", valid);
        next();
      }
    });
  } else {
    resp.status(403).send({ result: "please add token with header" });
  }
  console.log("middleware called", token);
}

app.get("/profile/:id", async (req, resp) => {

  
  let userProfile = await users.findOne({ _id: req.params.id },{}, {lean: true});

  if (userProfile) {

    resp.status(200).send(userProfile);
  } else {
    resp.status(400).send({ result: "No user found" });
  }
});

var uploader = multer({
  storage:multer.diskStorage({}),
  limits: {fileSize:5000000}
})

app.put("/profile/:id",uploader.single("file") ,async (req, resp) => {   
  try{
    const upload = await cloudinary.uploadFile(req.file.path);
    const result = await users.updateOne({_id:req.params.id},{img_url:upload.secure_url})
    resp.send({success:true,msg: 'file uploaded successfully', url:upload.secure_url});
    
  }catch(error){
    resp.send({success:false, msg: error.message});
  }
});



// ============TODO APIS========

app.post("/todo/add",verifyToken, async (req, resp) => {
  let valu = new todo(req.body); //users specify the schema which is imported above from db folder
  let result = await valu.save();
  result = result.toObject();
  resp.status(200).send(result);
});

app.get("/todo/get/:id",async (req, resp) => {
  // console.log("sfdasl;fd",req.user._id)
  let result = await todo.find({ userId: req.params.id });
  if (result.length > 0) {
    resp.send(result);
  } else {
    resp.send({ result: "No data found" });
  }
});

app.delete("/todo/add/:id", async (req, resp) => {
  let result = await todo.deleteOne({ _id: req.params.id });
  resp.send(result);
});

app.put("/todo/add/:id", async (req, resp) => {
  //in this update method we pass two parameters in {} braces first for identifier or for identifying schema and the other{}braces contains $set :  any new value we want to give such as req.body (takes something written in the body)
  let result = await todo.updateOne(
    { _id: req.params.id },
    {
      $set: req.body,
    }
  );
  resp.send(result);
});

// Api for Notes ==================================================================================

//to add notes --- done
app.post("/notes/add",verifyToken, async (req, resp) => {
  let value = new notes(req.body);
  let result = await value.save();
  result = result.toObject();
  resp.send(result);
});

//to get notes list  --done
app.get("/get/notes/:id",async (req, resp) => {
  let result = await notes.find({ userId: req.params.id });
  resp.send(result);
});

//to update the notes --done
app.put("/notes/update/:id", async (req, resp) => {
  let result = await notes.updateOne(
    { _id: req.params.id },
    {
      $set: req.body,
    }
  );
  resp.send(result);
});

//prifill data to editor --done
app.get("/notes/update/:id", async (req, resp) => {
  let result = await notes.findOne({ _id: req.params.id });
  resp.send(result);
});

//delete notes
app.delete("/notes/delete/:id", async (req, resp) => {
  let result = await notes.deleteOne({ _id: req.params.id });
  resp.send(result);
});

app.listen(4000, () => {
  console.log("Port running on 4000");
});
