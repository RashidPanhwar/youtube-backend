import jwt from 'jsonwebtoken'
import {User} from '../models/user.model.js'
import { ApiErrors } from '../utils/apiErrors.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const verifyJWT = asyncHandler(async (req, res, next) => {

    try {
        const token = req.cookies?.access_token || req.header("Authorization")?.replace("Bearer ", "");
    
        if(!token) {
            throw new ApiErrors(401, "UnAuthorized Request");
        }
    
        const decodedUser = jwt.verify(token, process.env.ACCESS_TOKEN_SECRATE);
    
        const user = await User.findById(decodedUser?._id).select("-password -access_token");
    
        if(!user) {
            throw new ApiErrors(401, "Invalid Access Token");
        }
    
        req.user = user
        next()
    } catch (error) {
        throw new ApiErrors(401, error?.message || "Invalid Access Token")
    }

})