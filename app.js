const express = require("express");
const fs = require("fs");
const morgan = require("morgan");

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use((req, res, next) => {
  console.log("Hello from the middleware");
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/users.json`)
);

const getAllUsers = (req, res) => {
  res.status(200).json({
    status: "success",
    requestedAt: req.requestTime,
    results: users.length,
    data: {
      users
    },
  });
};

const createUser = (req, res) => {
  const newId = users[users.length - 1].id + 1;
  const newUser = Object.assign({ id: newId }, req.body);

  users.push(newUser);
  console.log(newUser);

  fs.writeFile(
    `${__dirname}/dev-data/data/users.json`,
    JSON.stringify(users),
    (err) => {
      res.status(201).json({
        status: "success",
        data: {
          user: newUser
        },
      });
    }
  );
};

const getUser = (req, res) => {
  var params = req.params;
  var id = params["id"];

  var user = users.find(u => u._id == id);

  if (!user) {
    return res.status(404).json({
      status: "fail",
      message: "Invalid ID",
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      user
    },
  });
};

const deleteUser = (req, res) => {
  var params = req.params;
  var id = params["id"];

  var user = users.find(u => u._id == id);

  if (!user) {
    return res.status(404).json({
      status: "fail",
      message: "Invalid ID",
    });
  }

  res.status(204).json({
    status: "success",
    data: {
      message: "Deleted",
    },
  });
};

const updateUser = (req, res) => {
  var params = req.params;
  var id = params["id"];

  var user = users.find(u => u._id == id);

  if (!user) {
    return res.status(404).json({
      status: "fail",
      message: "Invalid ID",
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      message: "Updated",
    },
  });
};

const userRouter = express.Router();
app.use("/api/v1/users", userRouter);

userRouter
  .route("/")
  .get(getAllUsers)
  .post(createUser);

userRouter
  .route("/:id")
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

app.listen(27001, () => {
  console.log("App is running on port 27001");
});