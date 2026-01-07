import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiErrors } from "../utils/apiErrors.js";
import {User} from '../models/user.model.js'
import { uploadFileOnCLoud } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from 'jsonwebtoken';

const generateAccessTokenAndRefreshToken = async (userId) => {
    const user = await User.findById(userId);
    const access_token = user.generateAccessToken()
    const refresh_token = user.generateRefreshToken();

    user.refresh_token = refresh_token
    user.save({validateBeforeSave: false});


    return {access_token, refresh_token}
}

const userRegister = asyncHandler( async (req, res) => {
    // Get details from user
    // Validation - not apply
    // Check if user already exist - username email
    //  Check for images - cover image can be skip
    //  Upload images to cloudinary - speacily avatar
    // Create user object - create entry in database
    // Remove pasword and refresh token from object
    // Check for user creation
    //  return response

    const {username, email, full_name, password} = req.body
    
    if(
        [username, email, full_name, password].some((item) => item.trim() === '')
    ) {
        throw new ApiErrors(400, "All Fields are required")
    }


    const existingEmail = await User.findOne({email});
    const existingUsername = await User.findOne({username});

    console.log("email ", existingEmail)

    if(existingEmail) {
        throw new ApiErrors(400, "Email Already Registered")
    }
    if(existingUsername) {
        throw new ApiErrors(409, "Username Already Registered")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.cover_image[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.cover_image) && req.files.cover_image.length > 0) {
        coverImageLocalPath = req.files.cover_image[0].path
    }

    if(!avatarLocalPath) {
        throw new ApiErrors(400, "Profile Image Required");
    }

    const avatar = await uploadFileOnCLoud(avatarLocalPath);
    const cover_image = await uploadFileOnCLoud(coverImageLocalPath);

    if(!avatar) {
        throw new ApiErrors(400, "Profile Path Required");
    }

    const user = await User.create({
        username: username.toLowerCase(),
        email,
        full_name,
        avatar: avatar.url,
        cover_image: cover_image?.url || "",
        password,
    })

    const createdUser = await User.findById(user?._id).select(
        "-password -refresh_token"
    )

    if(!createdUser) {
        throw new ApiErrors(500, "Something went wrong while creating user");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Created Succefully")
    )

    
})

const loginUser = asyncHandler(async (req, res) => {
    // req body -> data
    // check for username or email 
    // find user 
    // validate password 
    // generate access and refresh token 
    // send in cookie 
    // resnd response 

    const {email, password} = req.body;
    if(!email) {
        throw new ApiErrors(400, "Email is required")
    }

    const user = await User.findOne({email});
    if(!user) {
        throw new ApiErrors(404, "User Does not exist");
    }

    const isPAsswordValid = await user.isPasswordCorrect(password)

    if(!isPAsswordValid) {
        throw new ApiErrors(404, "Password Incorrect");
    }

    const {access_token, refresh_token} = await generateAccessTokenAndRefreshToken(user._id);
    const logedInUser = await User.findById(user._id).select("-password -refresh_token");

    const options = {
        httpOnly: true,
        secure: true
    }


    return res
    .status(200)
    .cookie("access_token", access_token, options)
    .cookie("refresh_token", refresh_token, options)
    .json(
        new ApiResponse(
            200,
            {
                user: logedInUser, access_token, refresh_token
            },
            'User LogedIn Successfully'
        )
    )



    
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req?.user?._id,
        {
            refresh_token: undefined 
        },
        {
            new: true
        }
    );

    const options = {
        httpOnly: true,
        secure: true
    };

    return res.status(200)
    .clearCookie("access_token", options)
    .clearCookie("refresh_token", options)
    .json(new ApiResponse(200, "User Loged out"));
})

const refreshToken = asyncHandler(async (req, res) => {
    const inComingRefreshToken = req.cookies?.refresh_token || req.body?.refresh_token;

    if(!inComingRefreshToken) {
        throw new ApiErrors(401, "UnAuthorized Request");
    }

    const decodedRefreshToken = jwt.verify(inComingRefreshToken, process.env.REFRESH_TOKEN_SECRATE);

    const user = await User.findById(decodedRefreshToken?._id);

    if(!user) {
        throw new ApiErrors(401, "Invalid Refresh Token");
    }

    if(inComingRefreshToken !== user.refresh_token) {
        throw new ApiErrors(401, "Refresh Token is Expire");
    }

    const {access_token, newRefreshToken} = await generateAccessTokenAndRefreshToken(user._id)

    const options = {
        httpOnly: true,
        secure: true 
    }

    return res
    .status(200)
    .cookie("access_token", access_token, options)
    .cookie("refresh_token", newRefreshToken, options)
    .res(
        new ApiResponse(
            200,
            {access_token, refresh_token: newRefreshToken},
            "Access Token Refreshed"
        )
    )
})

export {
    userRegister,
    loginUser,
    logoutUser,
    refreshToken
}