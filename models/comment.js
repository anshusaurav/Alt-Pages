const mongoose = require("mongoose");
var Schema = mongoose.Schema;


var commentSchema = new Schema({
    
    content: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    articleId: {
        type: Schema.Types.ObjectId,
        ref: "Article",
        required: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
},{timestamps: true});

var Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;
