var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res){
  console.log(req.session);
  // Get an array of flash messages by passing the key to req.flash()
  res.render('index', { title: req.flash('info') });
});

router.get('/flash', function(req, res){
  console.log('HERE');
  // Set a flash message by passing the key, followed by the value, to req.flash().
  //req.flash('info', 'Flash is back!');
  res.redirect('/');
});
module.exports = router;
