import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    text:{
        type:String,
        required: true
    },
    author:{
        type: mongoose.Schema.Types.ObjectId,
        req: 'User',
        required: true,
    },
    post:{
        type: mongoose.Schema.Types.ObjectId,
        req: 'Post',
        required: 'true'
    }
})

export const Comment = mongoose.model('Comment', commentSchema);