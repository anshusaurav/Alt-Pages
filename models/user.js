const mongoose = require("mongoose");
var bcrypt = require("bcrypt");
var Schema = mongoose.Schema;

var userSchema = new Schema({
    name:{
        type: String, 
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
    },
    password: {
        type: String,
        required: true,
    },
    articles: [{
        type: Schema.Types.ObjectId,
        ref: "Article",
    }],
    comments: [{
        type: Schema.Types.ObjectId,
        ref: "Comment",
    }],

    likedArticles: [{
        type: Schema.Types.ObjectId,
        ref: "Article",
    }],
    
},{timestamps: true});

//Defining schema
//Dont use arrow function since we cant use this inside arrow function
userSchema.pre('save', async function(next){
    console.log(this, 'Presave hook');
    if(this.password && this.isModified('password')) {
        //Use async mode of bcrypt is preferred
        this.password = await bcrypt.hash(this.password, 10);
        console.log(this.password);
    }
    next();
});

userSchema.methods.verifyPassword = async function(pwd) {
    const match = await bcrypt.compare(pwd, this.password); 
    console.log(match);
    if(match)
        return true;    
    else 
        return false;
}

module.exports = mongoose.model("User", userSchema);