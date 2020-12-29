const Mongodb = require("mongodb");
const MongoClient = Mongodb.MongoClient;
const my_db = "Mada";
const url = `mongodb://localhost:27017/${my_db}`;
const Users = "Users";
const Updates = "Updates";
const TemporaryShifts = "TemporaryShifts";
const RequestShifts = "RequestShifts";
const changesRequestCollection = "changesRequest";
const Logs = 'Logs';
const OldShifts = 'OldShifts';
const Registration = 'Registration';
const jwt = require("jsonwebtoken");
const secret = "1234(-:";
var nodemailer = require("nodemailer");
const authentication = "1234(-:";;
const fs = require('fs');

// ******************************************************************

function getUpdate(req, res) {
  console.log("users get update is accessed");
  MongoClient.connect(
    url,
    { useNewUrlParser: true, useUnifiedTopology: true },
    function (err, db) {
      if (err) {
        res.sendStatus(500);
        return;
      }
      var dbo = db.db(my_db);
      dbo
        .collection(Updates)
        .find({})
        .toArray(function (err, result) {
          if (err) {
            res.sendStatus(500);
            return;
          }
          res.send(result);
        });
    }
  );
}

function userUpdateData(req, res){
// console.log("fffffffff");
}

function getUserData(req, res) {
  console.log("getUserData is accessed");
  MongoClient.connect(
    url,
    { useNewUrlParser: true, useUnifiedTopology: true },
    function (err, db) {
      if (err) {
        console.log(err);
        return res.sendStatus(500);
      }
      var dbo = db.db(my_db);
      dbo
        .collection(Users)
        .findOne({ email: req.params.email }, function (err, result) {
          if (err) {
            console.log(err);
            return res.sendStatus(500);
          }
          // console.log(result.name);
          res.send(result);
        });
    }
  );
}

function thisEmailExistInThisCollection(emailToCheck, collectionToCheck) {
  let response1 = undefined;
  MongoClient.connect(
    url,
    { useNewUrlParser: true, useUnifiedTopology: true },
    function (err, db) {
      if (err) {
        console.log(err);
        return res.sendStatus(500);
      }
      var dbo = db.db(my_db);
      const queryUser = { email: emailToCheck };
      dbo
        .collection(collectionToCheck)
        .findOne(queryUser, function (err, userFound) {
          if (err) {
            console.log(err);
            return res.sendStatus(500);
          }
          if (userFound) {
            // console.log(userFound);
            console.log("i'm here");
            return userFound;
          }
        });
    }
  );
}

function changesRequest(req, res) {
  // here i have to add the function of this operator ###

  MongoClient.connect(
    url,
    { useNewUrlParser: true, useUnifiedTopology: true },
    function (err, db) {
      if (err) {
        console.log(err);
        return res.sendStatus(500);
      }
      var dbo = db.db(my_db);
      const queryUser = { email: req.body.volunteerEmail };
      dbo
        .collection(changesRequestCollection)
        .findOne(queryUser, function (err, userFound) {
          if (err) {
            console.log(err);
            return res.sendStatus(500);
          }
          if (userFound) {
            // console.log(userFound);
            console.log("there is an request of this user");
          } else {
            MongoClient.connect(
              url,
              { useNewUrlParser: true, useUnifiedTopology: true },
              function (err, db) {
                if (err) {
                  console.log(err);
                  return res.sendStatus(500);
                }
                var dbo = db.db(my_db);
                const queryUpdate = {
                  volunteerType: req.body.volunteerType,
                  email: req.body.volunteerEmail,
                  firstName : req.body.volunteerFirstName,
                  lastName : req.body.volunteerLastName,
                }; /*req.body*/
                queryUpdate.createdAt = new Date();
                dbo
                  .collection(changesRequestCollection)
                  .insertOne(queryUpdate, function (err, user) {
                    if (err) {
                      console.log(err);
                      return res.sendStatus(500);
                    }
                    res.sendStatus(201);
                  });
              }
            );
          }
        });
    }
  );
}

function update(req, res) {
  console.log("admin update is accessed");
  MongoClient.connect(
    url,
    { useNewUrlParser: true, useUnifiedTopology: true },
    function (err, db) {
      if (err) {
        console.log(err);
        return res.sendStatus(500);
      }
      var dbo = db.db(my_db);
      const queryUpdate = req.body;
      queryUpdate.createdAt = new Date();
      dbo.collection(Updates).insertOne(queryUpdate, function (err, user) {
        if (err) {
          console.log(err);
          return res.sendStatus(500);
        }
        res.sendStatus(201);
        // return res.sendStatus(404);
      });
    }
  );
}

function login(req, res) {
  console.log("users login is accessed");
  MongoClient.connect(
    url,
    { useNewUrlParser: true, useUnifiedTopology: true },
    function (err, db) {
      if (err) {
        console.log(err);
        return res.sendStatus(500);
      }
      var dbo = db.db(my_db);
      const queryUser = req.body;
      dbo.collection(Users).findOne(queryUser, function (err, user) {
        if (err) {
          console.log(err);
          return res.sendStatus(500);
        }
        if (user) {
          if (
            user.status === "awaitingApproval" ||
            user.status === "blocked"
          ) {
            return res.sendStatus(500);
          } else {
            return res
              .status(200)
              .send({ Token: CreateToken(user), 
              userData: {
              _id: user._id,
              role: user.role,
              email:user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              volunteerType: user.volunteerType,
              birthday: user.birthday}  });
          }
        }
        return res.sendStatus(404);
      });
    }
  );
}

function register(req, res) {
  MongoClient.connect(
    url,
    { useNewUrlParser: true, useUnifiedTopology: true },
    function (err, db) {
      if (err) {
        console.log(err);
        return res.sendStatus(500);
      }
      const dbo = db.db(my_db);
      const queryUser = req.body;
      dbo
        .collection(Users)
        .findOne({ email: queryUser.email }, function (err, userFound) {
          if (err) {
            console.log(err);
            return res.sendStatus(500);
          }
          if (userFound) {
            return res.status(200).send({ Status: "400", Results:  userFound._id});
          }
            dbo
            .collection(Registration)
            .findOne({ email: queryUser.email }, function (err, userFound) {
              if (err) {
                console.log(err);
                return res.sendStatus(500);
              }
              if (userFound) {
                registerAuthentication_sendEmail(queryUser.email)
                return res.status(200).send({ Status: 400, Results: 'כבר נרשם'});
              }
          queryUser.createdAt = new Date();
          dbo
            .collection(Registration)
            .insertOne(queryUser, function (err, result) {
              if (err) {
                console.log(err);
                return res.sendStatus(500);
              }
              registerAuthentication_sendEmail(queryUser.email)
              return res.status(200).send({ Status: "201", Results: 'ההרשמה בוצעה בהצלחה' });
            });
        });
      })
    }
  );
}

module.exports.register = register;
module.exports.login = login;
module.exports.update = update;
module.exports.getUpdate = getUpdate;
module.exports.getUserData = getUserData;
module.exports.changesRequest = changesRequest;
module.exports.userUpdateData = userUpdateData;

module.exports.weeklyTask = weeklyTask;
function weeklyTask() {
  deleteAllCollection(Registration) 
simple() 
}
function simple  () {
  MongoClient.connect( url,{ useNewUrlParser: true, useUnifiedTopology: true },
    function (err, db) {
      if (err) { console.log(err); }
          const dbo = db.db(my_db);
          dbo.collection(OldShifts).findOne({}, {sort:{$natural:-1}}, function (err, lastShifts) {
            if (err) { console.log(err); }
            let id = Number;
            if (lastShifts === null){id = 1000 }
            else {id = lastShifts.id +1}
          dbo.collection(TemporaryShifts).findOne({}, function (err, obj) {
              if (err) { console.log(err); }
              if (obj !== null){
                obj.id = id;
                dbo.collection(OldShifts).insertOne(obj, function (err, result) {
                  if (err) { console.log(err); }
                  deleteAllCollection(TemporaryShifts) 
                });

               }
            });
          });
    });
}

function deleteAllCollection (Collection) {
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, db) {
      if (err) {
        return;
    }
      var dbo = db.db(my_db);
      dbo.collection(Collection).deleteMany({}, function(err, obj) {
        if (err) {
          return;
      }
      if (obj.deletedCount == 0){
           return;
      }
      });
    });
  }

function CreateToken(user) {
  const validTimeSec = 480 * 60;
  const expirationDate = Date.now() / 1000 + validTimeSec;
  const token = jwt.sign({ userID: user.email, exp: expirationDate }, secret);
  return token;
}

function CreateAuthentication(email) {
  // const validTimeSec = 120 * 60;
  const validTimeSec = 15 * 60;
  const expirationDate = Date.now() / 1000 + validTimeSec;
  const token = jwt.sign({ userID: email, exp: expirationDate }, authentication);
  return token;
}

module.exports.sendEmailResetPassword = sendEmailResetPassword;
function sendEmailResetPassword(req, res) {
  const link = `${req.body.email}/${CreateAuthentication(req.body.email)}`,
  subject = 'איפוס סיסמא לאתר משמרות מד"א',
  html = `<span>הקישור תקף לזמן מוגבל</span> <a href='http://localhost:3000/PasswordReset/${link}'>לחץ כאן</a> <span>לאיפוס הסיסמא</span> `;
  sendEmail(req.body.email,subject,html)
  res.send('ok')
}

function registerAuthentication_sendEmail(email) {
  const link = `${email}/${CreateAuthentication(email)}`,
  subject = "נא אמת את כתובת המייל שלך",
  html = `<a href='http://localhost:3000/Authentication/${link}'>לחץ כאן לאימות המייל</a>`;
  sendEmail(email,subject,html)
}
module.exports.register_sendEmail = register_sendEmail;
function register_sendEmail(req) {
  registerAuthentication_sendEmail(req.body.email)
}

module.exports.sendEmailFree = sendEmailFree;
function sendEmailFree(req,res) {
  sendEmail(req.body.email,req.body.subject,req.body.html)
  res.send('ok')
}

sendEmail = (email,Subject,Html) => {
  console.log("gmail is accessed");
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "user@gmail.com",
      pass: "pass",
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
  var mailOptions = {
    from: "user@gmail.com",
    to: email,
    subject: Subject,
    html: Html,
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};


module.exports.sendShiftsByEmail = sendShiftsByEmail;
listText = (messageList) => {
    return messageList.map((message, index) => {
      return  `<li key=${index}>${message}</li>` 
    })
}
function sendShiftsByEmail(req, res){
  var base64Data = req.body.dataURL.replace(/^data:image\/png;base64,/, "");
  fs.writeFile('./folderShifts/imgShifts.png', base64Data, 'base64', function(err) {
      if(err){
         console.log(err); 
       }
let list='';
 if (req.body.Html.list.length > 0){ list = `<ul> ${this.listText(req.body.Html.list)} </ul>`}
const html = {header:req.body.Html.header,list:list}
      //  try{
       sendEmailWithFile(req.body.email,'טבלת משמרות שבועית',html,'טבלת משמרות.png','./folderShifts/imgShifts.png')
      // } catch(err){
      //   console.log(err);
      //   sendEmailWithFile('%%%%%%@gmail)......
      // }
  }) 
}


sendEmailWithFile = (email,Subject,Html,filename,path) => {
  console.log("gmail is accessed"); 
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "user@gmail.com",
      pass: "pass",
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
  var mailOptions = {
    from: "user@gmail.com",
    to: email,
    subject: Subject,
    html: `<div><h2> ${Html.header}</h2> ${Html.list} </div> <img src="cid:fff123"/>`,
attachments :[
  { // use URL as an attachment
    filename: filename,
    path: path,
    cid: 'fff123'
  },  { // use URL as an attachment
    filename: filename,
    path: path,
  }]
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};


module.exports.insertUser = insertUser;

function insertUser(req, res) {
  MongoClient.connect(
    url,
    { useNewUrlParser: true, useUnifiedTopology: true },
    function (err, db) {
      if (err) {
        console.log(err);
        return res.sendStatus(500);
      }
      const dbo = db.db(my_db);
      const query = req.body;
      dbo.collection(Registration).findOne(query, function (err, result) {
        if (err) {
          res.sendStatus(500);
          return;
        }
        if (result === null){
          return res
              .status(200)
              .send({ Status: "404", Results: "מצטערים אך תוקף הקישור פג" });
        }
      let  queryUser = result
      dbo  
        .collection(Users)
        .findOne({ email: queryUser.email }, function (err, userFound) {
          if (err) {
            console.log(err);
            return res.sendStatus(500);
          }
          if (userFound) {
            return  res.status(200).send({ Status: "400", Results: 'האימות כבר בוצע בהצלחה' });  
          }
       delete queryUser.createdAt
       delete queryUser.authentication
       delete queryUser._id
       queryUser.status = "awaitingApproval"  
          dbo.collection(Users).insertOne(queryUser, function (err, result) {
            if (err) {
              console.log(err);
              return res.sendStatus(500);
            }
            usersRegisterSuccess_sendEmail(queryUser.email)
            return res.status(200).send({ Status: "201", Results: 'האימות בוצע בהצלחה' });
          });
        });
      });
    }
  ); 
}

function usersRegisterSuccess_sendEmail(email) {
  subject = "המייל שלך אומת!",
  html = `<h2> הרישום בוצע במצלחה! </h2> <p>   כעת כל הפרטים עוברים למנהל ע"מ לאשר את הרישום לאחר האישור תקבל/י מייל ותוכל/י להיכנס לאתר </p>`,
  sendEmail(email,subject,html)
  // res.send("עדכון");
}

module.exports.createLogs = createLogs;
  function createLogs (req, res) {
  simpleCreateOrGetOne(res, req.body, Logs, 'insertOne')
   }

module.exports.getTemporaryShifts = getTemporaryShifts;
  function getTemporaryShifts (req, res) {
  simpleCreateOrGetOne(res,{} , TemporaryShifts, 'findOne')
   }


module.exports.createTemporaryShifts = createTemporaryShifts;
function createTemporaryShifts (req, res) {
  simpleCreateOrGetOne(res, req.body, TemporaryShifts, 'insertOne')
}

module.exports.updateTemporaryShifts = updateTemporaryShifts;
function updateTemporaryShifts (req, res) {
 let _id = {"_id": new Mongodb.ObjectId(req.params.id) }
//  console.log(_id);
  simpleupdate( res, { $set: req.body }, TemporaryShifts, 'updateOne', _id)
}

module.exports.updateOldShifts = updateOldShifts;
function updateOldShifts (req, res) {
 let _id = {"_id": new Mongodb.ObjectId(req.params.id) }
  simpleupdate( res, { $set: req.body }, OldShifts, 'updateOne', _id)
}

function simpleCreateOrGetOne  (res, newObj, collection, action, fun) {
    MongoClient.connect( url,{ useNewUrlParser: true, useUnifiedTopology: true },
      function (err, db) {
        if (err) {
          console.log(err); 
          return res.sendStatus(500);
        }
            const dbo = db.db(my_db);
            dbo.collection(collection)[action](newObj, function (err, result) {
                if (err) {
                  console.log(err);
                  return res.sendStatus(500);
                }
                // console.log(result);
                if (action === 'findOne'){
                return res.status(200).send(result)}
                else {return res.status(201).send('נוסף בהצלחה') }
                // res.sendStatus(201);
              });
      });
} 

module.exports.createRequestShifts = createRequestShifts;
function createRequestShifts (req, res) {
  simpleCreateOrGetOne(res, req.body, RequestShifts, 'insertOne')
}
module.exports.updateRequestShifts = updateRequestShifts;
function updateRequestShifts (req, res) {
 let _id = {"_id": new Mongodb.ObjectId(req.params.id) }
//  console.log(_id);
  simpleupdate( res, { $set: req.body }, RequestShifts, 'updateOne', _id)
}

// createmanager
module.exports.createmanager = createmanager;
function createmanager (req, res) {
  simpleCreateOrGetOne(res, req.body, Users, 'insertOne')
}
// updateUsers
module.exports.updateUsers = updateUsers;
function updateUsers (req, res) {
  let _id = {"_id": new Mongodb.ObjectId(req.params.id) }
  // console.log(_id);
   simpleupdate( res, { $set: req.body }, Users, 'updateOne', _id)
 }
simpleupdate = (res, newObj, collection, action, my_id) =>{
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, db) {
      if (err) {
        res.sendStatus(500);
        return;
    }
      const dbo = db.db(my_db);
      dbo.collection(collection)[action](my_id, newObj, function(err, update) {
        if (err) {
          return res.send({ Status: "500" , Results: "אירע שגיאה - לא עודכן"});
      }
      if (update.matchedCount < 1){
        return res.send({ Status: "404" , Results: "אירע שגיאה -  לא עודכן"});
      }
      res.send({ Status: "200" , Results: "השינויים עודכנו בהצלחה!"});
      db.close();   
      });
    }); 
} 
module.exports.getRequestShifts = getRequestShifts;
  function getRequestShifts (req, res) {
  simpleCreateOrGetOne(res, {email:req.params.email} , RequestShifts, 'findOne')
   }
   
   module.exports.verificationPlusUser = verificationPlusUser;
   function verificationPlusUser (req, res) {
   simpleCreateOrGetOne(res, {email:req.params.email} , Users, 'findOne')
    }

   module.exports.getAllShiftAssignmentRequests = getAllShiftAssignmentRequests;
   function getAllShiftAssignmentRequests (req, res) {
     simpleGetAll(res, RequestShifts)}
  
     module.exports.getAllUsers = getAllUsers;
  function getAllUsers (req, res) {
    simpleGetAll(res, Users)}

    module.exports.getAllRequestChanges = getAllRequestChanges;
    function getAllRequestChanges (req, res) {
      simpleGetAll(res, changesRequestCollection)}

      module.exports.oldShifts = oldShifts;
      function oldShifts (req, res) {
        simpleGetAllSort(res, OldShifts)}
        simpleGetAllSort = (res, collection) => {
          MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, db) {
              if (err) {
                  res.sendStatus(500);
                  return;
              }
              var dbo = db.db(my_db);
        dbo.collection(collection).find({}, {sort:{$natural:-1}}).limit(50).toArray(function(err, Shifts) {
          if (err) {
                  res.sendStatus(500);
                  return;
                }
                res.send(Shifts);
                db.close();
              }); 
            });
        }

      simpleGetAll = (res, collection) => {
  MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, db) {
      if (err) {
          res.sendStatus(500);
          return;
      }
      var dbo = db.db(my_db);
     dbo.collection(collection).find({}).toArray(function(err, Users) {
        if (err) {
          res.sendStatus(500);
          return;
        }
        res.send(Users);
        db.close();
      }); 
    });
}

  module.exports.getVolunteerHours = getVolunteerHours;
  function getVolunteerHours (req, res) {
    simpleFind(res, OldShifts,{weeklyHors:{$elemMatch: {email:req.params.email}} })}

simpleFind = (res, collection, obj) => {
  MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, db) {
      if (err) {
          res.sendStatus(500);
          return;
      }
      var dbo = db.db(my_db);
     dbo.collection(collection).find(obj).toArray(function(err, Users) {
        if (err) {
          res.sendStatus(500);
          return;
        }
        res.send(Users);
        db.close();
      }); 
    });
}


module.exports.deleteUser = deleteUser;
function deleteUser (req, res) {
 let _id = {"_id": new Mongodb.ObjectId(req.params.id) }
 simpleDelete( res, Users, _id)
}

module.exports.deleteChangesRequest = deleteChangesRequest;
function deleteChangesRequest (req, res) {
 let _id = {"_id": new Mongodb.ObjectId(req.params.id) }
 console.log(_id);
 simpleDelete( res, changesRequestCollection, _id)
}
simpleDelete = (res, collection, my_id) => {
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, db) {
      if (err) {
        res.sendStatus(500);
        return;
    }
      var dbo = db.db(my_db);
      dbo.collection(collection).deleteOne(my_id, function(err, obj) {
        if (err) {
          res.sendStatus(500);
          return;
      }
      if (obj.deletedCount == 0){
        res.sendStatus(404);
          return;
      }
        // console.log(obj);
        res.sendStatus(200)
        db.close();
      });
    });
}