var express = require('express');
var router = express.Router();
var Article = require("../models/article");
var Comment = require("../models/comment");
var Tag = require("../models/tag");
var User = require("../models/user");
/* GET home page. */
router.get('/', function(req, res){
  console.log('HERE');
  console.log(req.session);
  // Get an array of flash messages by passing the key to req.flash()
  Tag.find({}, (err, tags) =>{
    if(err)
        return next(err);
    if(req.session.userId){
      let user = User.findById(req.session.userId)
      return res.render('index', {tags}, {user});
    }
    else
    return res.render('index', {tags});
});
  // '5eb7b52be952a2054c602740',
});

router.get('/flash', function(req, res){
 
  // Set a flash message by passing the key, followed by the value, to req.flash().
  //req.flash('info', 'Flash is back!');
  res.redirect('/');
});
module.exports = router;
