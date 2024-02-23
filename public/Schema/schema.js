import { text } from "express";
import { Schema, mongoose } from "mongoose";

const user = {
    username: String,
    password: String,
    date: {
        type: Date,
        default: Date.now()
    },
    elo: Number,
    profile: String,
}

const userSchema = new Schema(user)

const User = mongoose.model('User', userSchema)

export default User