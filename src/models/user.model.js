import mongoose, {Schema} from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowerCase: true,
            trim: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowerCase: true,
            trim: true,
        },
        full_name: {
            type: String,
            required: true,
        },
        avatar: {
            type: String,
            required: true,
        },
        cover_image: {
            type: String,
        },
        watch_history: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Video'
            }
        ],
        password: {
            type: String,
            required: true
        },
        refresh_token: {
            type: String
        },

    }, 
    {timestamps: true}
);


userSchema.pre("save", async function(next){
    if(!this.isModified(this.password)) return

    this.password = bcrypt.hash(this.password, 10)
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

export const User = mongoose.model("User", userSchema)