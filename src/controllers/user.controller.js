import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiErrors } from "../utils/apiErrors.js";
import {User} from '../models/user.model.js'
import { uploadFileOnCLoud } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

    // const existingUser = await User.findOne({
    //     $or: [{username}, email]
    // })

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

export {userRegister}