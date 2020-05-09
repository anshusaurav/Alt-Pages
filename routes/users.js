var express = require('express');
var router = express.Router();
var User = require("../models/user");

/* GET users listing. */
router.get('/', function(req, res, next) {

  if(req.session && req.session.userId) {
    req.flash('Success', 'Login successful')
      res.locals.message = req.flash();
    res.render('users');
  }
  else {
    req.flash('Error', 'Please log in')
    res.locals.message = req.flash();
    return res.render('login');
  }
});

router.get('/register', function(req, res, next){
  res.render('register');
});

router.post('/register', function(req, res, next){
  console.log(req.body);
  User.create(req.body, (err, createdUser) => {
    if(err)
      return next(err);
    console.log(createdUser, 'after save');
    req.flash('Success', 'Registeration successful')
    res.locals.message = req.flash();
    return res.render('login');
  });

})


router.get('/login', function(req, res, next){
  res.render('login');
});

router.post('/login', async function(req, res, next){
  console.log(req.body);
  var {email, password} = req.body;
  let user = await User.findOne({email});
  if(!user) {
    req.flash('Error', 'Email is not registered')
    res.locals.message = req.flash();
      return res.render('login');
  }
  else{
    const match = await user.verifyPassword(password);
    if(match) {
      console.log('Login Successful')
      req.session.userId = user.id;

      return res.redirect('/users');
    }
    else{
      console.log('Error', 'Invalid password. Please try again');
      req.flash('Error', 'Invalid password. Please try again')
      res.locals.message = req.flash();
      return res.render('login');
    }
  }
    
})
module.exports = router;
