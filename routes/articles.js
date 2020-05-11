var express = require('express');
var router = express.Router();
var Article = require("../models/article");
var Comment = require("../models/comment");
var Tag = require("../models/tag");
var User = require("../models/user")
// var commentRouter = require("./comments");

/* GET home page. */
router.get('/', function(req, res, next) {
    Article.find({}, (err, articles) =>{
        if(err)
            return next(err);
        if(req.session.userId){
            User.findById(req.session.userId, (err, user) => {
                if(err)
                    return next(err);
                return res.render('articles', {user: user, isUser: true, title: 'Alt-Pages' });
            }) 
        }
        else{
            req.flash('Error', 'Please login to continue')
            res.locals.message = req.flash();
            return res.render('login'); 
        }
    });
});


router.get('/list', function(req, res, next) {
    // Article
    // .findById(id)
    // .populate('comments', "content author")
    // .exec((err, article) =>{   //can add filter, projections and skip
    //     res.render("viewArticle", {article});
    Article.find({})
        .populate('author')
        .exec((err, articles) =>{
        if(err)
            return next(err);
        if(req.session.userId){
            User.findById(req.session.userId, (err, user) => {
                if(err)
                    return next(err);
                return res.render('allArticle', {articles: articles, user: user, isUser: true});
            }) 
        }
        else{
            req.flash('Error', 'Please login to continue')
            res.locals.message = req.flash();
            return res.render('login');  
        }
        
    });
});

//add article
router.get('/new', function(req, res, next) {

    if(req.session.userId){
        User.findById(req.session.userId, (err, user) => {
            if(err)
                return next(err);
            return res.render("addArticle", {user: user, isUser: true});
        }) 
    }
    else{
        req.flash('Error', 'Please login to continue')
        res.locals.message = req.flash();
        return res.render('login');  
    }
    
});

router.post('/', function(req, res, next) {
    req.body.tags = req.body.tags.split(', ');
    req.body.author = req.session.userId;
    let tagArr = req.body.tags;
    console.log(req.body);
    Article.create(req.body, (err, data) => {
        if(err) return next(err);
        tagArr.forEach(tagname =>{
            Tag.findOne({tagname},(err,tag)=> {
                if(err) return next(err);
                if(!tag) {
                    Tag.create({tagname,articles:data.id},(err,createdTag)=> {
                        if(err) return next(err);
                    })
                }
                else {
                    Tag.findOneAndUpdate({tagname},{$push:{articles:data.id}},(err,updatedTag) => {
                        if(err) return next(err);

                    })
                }
            })
        })
        if(err) return next(err);
        User.findByIdAndUpdate(req.session.userId, {$push: {articles: data.id}}, (err, user) =>{
            if(err)
                return next(err);
            return res.redirect('/articles');
        });
        
    
    });
});


//view article

router.get('/:id', function(req, res, next) {
    // console.log('view');
    let id = req.params.id;
    // Article.findById(id, (err, article) =>{
    //     if(err)
    //         return next(err);
    //     Comment.find({articleId: id}, (err, comments) =>{
    //         if(err)
    //             return next(err);
    //         return res.render("viewArticle", {article, comments, tags});  
    //     });
    // });
    
    if(req.session.userId){
        User.findById(req.session.userId, (err, user) => {
            if(err)
                return next(err);
            Article
            .findById(id)
            .populate({path:"comments",populate:{
                path:"author"
            }})
            .populate('author')
            .exec((err, article) =>{   //can add filter, projections and skip
                return res.render("viewArticle", {article:article, user:user, isUser: true});
            }) 
        });
    }
    else{
        req.flash('Error', 'Please login to continue')
        res.locals.message = req.flash();
        return res.render('login');  
    }
});

//Add Comment

router.post('/:articleId/comments', (req, res, next) => {
    var id = req.params.articleId;

    // if(req.session.userId){
    //     User.findById(req.session.userId, (err, user) => {
    //         if(err)
    //             return next(err);
    //         return res.render("addArticle", {user: user, isUser: true});
    //     }) 
    // }
    // else{
    //     req.flash('Error', 'Please login to continue')
    //     res.locals.message = req.flash();
    //     return res.render('login');  
    // }


    req.body.articleId = req.params.articleId;
    req.body.author = req.session.userId;
    if(req.session.userId){
        User.findById(req.session.userId, (err, user) => {
            Comment.create(req.body, (err, newComment) => {
                if(err)
                    return next(err);
                Article.findByIdAndUpdate(id, {$push: {comments: newComment.id}}, (err, article) => {
                    res.redirect(`/articles/${id}`);
                });
                
            });
        });
    }
    else {
        req.flash('Error', 'Please login to continue')
        res.locals.message = req.flash();
        return res.render('login');  
    }
    console.log(req.body);
});


//Delete comment
router.get('/:articleId/comments/:commentId/delete', (req, res, next) =>{
    var articleId = req.params.articleId;
    var commentId = req.params.commentId;
    if(req.session.userId){
        User.findById(req.session.userId, (err, user) => {
            Comment.findByIdAndDelete(commentId, (err, comment) =>{
                // Article.findByIdAndUpdate(articleId, {$pull: { comments: { $in: [commentId] } } }, (err, article)=>{
                    if(err)
                        return next(err);
                    res.redirect(`/articles/${articleId}`);
                // });
            });
        });
    }
    else{
        req.flash('Error', 'Please login to continue')
        res.locals.message = req.flash();
        return res.render('login'); 
    } 

});


//Edit comment
//Get comment
router.get('/:articleId/comments/:commentId/edit', (req, res, next) =>{
    let articleId = req.params.articleId;
    let commentId = req.params.commentId;

    if(req.session.userId){
        User.findById(req.session.userId, (err, user) => {
            Article.findById(articleId, (err, article) =>{
                Comment.findById(commentId, (err, comment) =>{
                    if(err)
                        return next(err);
                    if(comment.author == req.session.userId)
                        return res.render("editComment", {article, comment, isUser: true, user: user});
                    else {
                        req.flash('Error', 'Please login to continue')
                        res.locals.message = req.flash();
                        return res.redirect(`/articles/${articleId}`); 
                    }

                });
                
            });
        });

    } else {
        req.flash('Error', 'Please login to continue')
        res.locals.message = req.flash();
        return res.render('login');  
    }
});


//Post updated content
router.post('/:articleId/comments/:commentId/edit', (req, res, next) =>{
    let articleId = req.params.articleId;
    let commentId = req.params.commentId;
    console.log('Here updating comment');
    console.log(commentId, articleId);
    req.body.articleId = articleId;
    if(req.session.userId){
        User.findById(req.session.userId, (err, user) => {
            Comment.findByIdAndUpdate(commentId, req.body, (err, comment) =>{
                if(err)
                    return next(err);
                res.redirect(`/articles/${articleId}`);
            });
        });
    }
    else {
        req.flash('Error', 'Please login to continue')
        res.locals.message = req.flash();
        return res.render('login');  
    }

});

//edit article

router.get('/:id/edit', function(req, res, next) {
    let id = req.params.id;
    if(req.session.userId){
        User.findById(req.session.userId, (err, user) => {
            Article.findById(id, (err, article) =>{
                if(err)
                    return next(err);
                
                return res.render("editArticle", {article, user: user, isUser: true});
            });
        });
    }
    else {
        req.flash('Error', 'Please login to continue')
        res.locals.message = req.flash();
        return res.render('login');  
    }
});
    

router.post('/:id', function(req, res, next) {
    let id = req.params.id;
    req.body.tags = req.body.tags.split(', ');
    let newTags = req.body.tags;
    if(req.session.userId){
        User.findById(req.session.userId, (err, user) => {
            Article.findByIdAndUpdate(id, req.body,  {new: true, runValidators: true},(err, data) => {
                if(err) 
                    return next(err);
                let oldTags = data.tags;
                //remove newtags from old tags
                oldTags = oldTags.filter((elem) => {
                    return !newTags.includes(elem);
                })

                oldTags.forEach(tagname =>{
                    Tag.findOne({tagname}, (err, tag) =>{
                        if(err)
                            return next(err);
                        if(!tag){

                        }
                        else{
                            Tag.findOneAndUpdate({tagname},{$pull:{articles:data.id}},{new:true}, (err,updatedTag) => {
                                if(err) 
                                    return next(err);
                                if(updatedTag.articles.length == 0) {
                                    Tag.findOneAndDelete({tagname}, (err, deletedTag)=>{
                                        if(err)
                                            return next(err); 
                                    });
                                }
                            })
                        }
                    });
                });

                newTags.forEach(tagname =>{
                    Tag.findOne({tagname},(err,tag)=> {
                        if(err) return next(err);
                        //console.log(tag.articles);
                        if(!tag) {
                            Tag.create({tagname,articles:data.id},(err,createdTag)=> {
                                if(err) return next(err);
                            })
                        }
                        else {
                            Tag.findOneAndUpdate({tagname},{$addToSet:{articles:data.id}},(err,updatedTag) => {
                                if(err) return next(err);

                            })
                        }
                    })
                })
                return res.redirect('/articles');
            });
        });
    }
    else {
        req.flash('Error', 'Please login to continue')
        res.locals.message = req.flash();
        return res.render('login');  
    }
});


//delete article
router.get('/:id/delete', function(req, res, next) {
    let id = req.params.id;
    if(req.session.userId){
        User.findById(req.session.userId, (err, user) => {
            Article.findByIdAndDelete(id, (err, article) =>{
                if(err)
                    return next(err);
                let oldTags = article.tags;
                

                oldTags.forEach(tagname =>{
                    Tag.findOne({tagname}, (err, tag) =>{
                        if(err)
                            return next(err);
                        if(!tag){

                        }
                        else{
                            Tag.findOneAndUpdate({tagname},{$pull:{articles:article.id}},{new:true}, (err,updatedTag) => {
                                if(err) 
                                    return next(err);
                                if(updatedTag.articles.length == 0) {
                                    Tag.findOneAndDelete({tagname}, (err, deletedTag)=>{
                                        if(err)
                                            return next(err); 
                                    });
                                }
                            })
                        }
                    });
                });
                res.redirect('/articles');
            });
        });
    }
    else {
        req.flash('Error', 'Please login to continue')
        res.locals.message = req.flash();
        return res.render('login'); 
    }
    
});


//like 
router.get('/:id/like', function(req, res, next) {
    let id = req.params.id;
    
    // req.body.likes = likeCount + 1;
    Article.findById(id, (err, article) =>{
        if(err)
            return next(err);
        console.log(article.likes);
        article.likes = article.likes + 1;
        Article.findByIdAndUpdate(id, article, (err, updatedArticle) =>{
            if(err)
                return next(err);
            res.redirect(`/articles/${article.id}`);
        });
    });
    
    
});


//dislike

router.get('/:id/dislike', function(req, res, next) {
    let id = req.params.id;
    
    Article.findById(id, (err, article) =>{
        if(err)
            return next(err);
        console.log(article.likes);
        if(article.likes > 0)
            article.likes = article.likes - 1;
        Article.findByIdAndUpdate(id, article, (err, updatedArticle) =>{
            if(err)
                return next(err);
            res.redirect(`/articles/${article.id}`);
        });
    });
    
    
});
module.exports = router;
