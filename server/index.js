console.log("app is loading");
const express = require("express");
const cron = require('node-cron');
const mongoex = require("./mongodb_ex");
const app = express();
const jwtVerifier = require("express-jwt");
const utils = require("./production_utils");
const authentication = "1234(-:";
app.use(express.json({limit: '50mb'}));

cron.schedule('0 0 * * 3', function() {
  console.log('running a task every week');
  mongoex.weeklyTask()
});
 
app.post('/sendShiftsByEmail', (req, res) => {
  mongoex.sendShiftsByEmail(req, res);
})


app.post("/register/insertUser", (req, res) => {
    console.log("/register/insertUser root is accessed");
    mongoex.register(req, res);
  });

app.post("/register/sendEmailAuthentication", (req, res) => {
  console.log("/register/sendEmailAuthentication root is accessed");
  mongoex.register_sendEmail(req, res);
});


app.post("/createLogs", (req, res) => { 
    mongoex.createLogs(req, res); });

app.post("/users/insertUser", jwtVerifier({ secret: authentication, algorithms: ["HS256"] }),
  (req, res) => { console.log("/users/insertUser root is accessed");
    mongoex.insertUser(req, res); });

app.get('/verificationPlusUser/:email', jwtVerifier({ secret: authentication, algorithms: ["HS256"] }), (req , res)=>{
    mongoex.verificationPlusUser( req , res)
    })

app.post("/users/sendEmailResetPassword", (req, res) => {
       console.log("users/sendEmailResetPassword root is accessed");
      mongoex.sendEmailResetPassword(req, res); });
    
// app.delete('/register/:id' ,jwtVerifier({secret:secret, algorithms: ['HS256']}), (req , res) =>{
//   mongoex.deletePeople( req , res)
// })

app.post("/users/login", (req, res) => {
  console.log("/users/login root is accessed");
  mongoex.login(req, res);
});

app.get('/getVolunteerHours/:email', (req , res)=>{
  mongoex.getVolunteerHours( req , res)
  })
   
app.get('/oldShifts', (req , res)=>{
  mongoex.oldShifts( req , res)
  })

app.get('/getRequestShifts/:email', (req , res)=>{
  mongoex.getRequestShifts( req , res)
})

app.post('/createRequestShifts', (req , res)=>{
  mongoex.createRequestShifts( req , res)
})

app.put('/updateRequestShifts/:id', (req , res)=>{
  mongoex.updateRequestShifts( req , res)
})

// app.delete('/deleteRequestShifts/:id', (req , res)=>{
//   mongoex.deleteRequestShifts( req , res)
// })

app.post('/sendEmailFree', (req , res)=>{
  mongoex.sendEmailFree( req , res)
})

app.get('/getAllShiftAssignmentRequests', (req , res)=>{
  mongoex.getAllShiftAssignmentRequests( req , res)
})

app.get('/getAllUsers', (req , res)=>{
  mongoex.getAllUsers( req , res)
})

app.put('/updateUser/:id', (req , res)=>{
  mongoex.updateUsers( req , res)
})

app.delete('/deleteUser/:id', (req , res)=>{
  mongoex.deleteUser( req , res)
})

app.delete('/deleteChangesRequest/:id', (req , res)=>{
  mongoex.deleteChangesRequest( req , res)
})


app.post('/users/manager', (req , res)=>{
  mongoex.createmanager( req , res)
})

app.get('/getAllRequestChanges', (req , res)=>{
  mongoex.getAllRequestChanges( req , res)
})

app.get('/getTemporaryShifts', (req , res)=>{
  mongoex.getTemporaryShifts( req , res)
})

app.post('/createTemporaryShifts', (req , res)=>{
  mongoex.createTemporaryShifts( req , res)
})

// app.put('/TemporaryShifts/:id', (req , res)=>{
//   mongoex.TemporaryShifts( req , res)
// })

app.put('/updateTemporaryShifts/:id', (req , res)=>{
  mongoex.updateTemporaryShifts( req , res)
})

app.put('/updateOldShifts/:id', (req , res)=>{
  mongoex.updateOldShifts( req , res)
})
// updates to the volunteers from admin
// post new update
app.post("/admin/update", (req, res) => {
  console.log("/admin/update root is accessed");
  mongoex.update(req, res);
});

// User updates his data .
app.post("/user/updateHisData", (req, res) => {
  console.log("/user/updateHisData root is accessed");
  mongoex.userUpdateData(req, res);
});




// get updates from database to show them
app.get("/users/updates", (req, res) => {
  console.log("/users/update root is accessed");
  mongoex.getUpdate(req, res);
});
// getUserData is an endpoint to get user data
app.get("/getUserData/:email", (req, res) => {
  console.log(`/getUserData/:email  is accessed ${req.params.email}`);
  mongoex.getUserData(req, res);
});

// changes Request . when user send request of changes
app.post("/changesRequest", (req, res) => {
  console.log(`/changesRequest  is accessed `);
  mongoex.changesRequest(req, res);
})

utils.handleProduction(express, app);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
