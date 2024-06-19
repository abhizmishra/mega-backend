import { asyncHandler } from '../utils/asynchandler.js'
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from 'json-web-token'

import mongoose from 'mongoose';


const registerUser = asyncHandler(async (req, res) => {
  //get user details from frontend
  //validation - not empty
  //check if user already exists: username,email
  //check for images,check for avatar
  //upload them to cloudinary ,avatar
  //create user object - create entry in db
  //remove password and refresh token field from response
  //check for user creation
  //return res

  const { fullName, email, username, password } = req.body;
  //console.log("email:",email);
  if (
    [fullName, email, username, password].some((field) => field.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }
  const existedUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }
  console.log(req.files);
  // if (existedUser) {
  //   if (existedUser.email === email) {
  //     throw new ApiError(409, "User with email already exists");
  //   } else if (existedUser.username === username) {
  //     throw new ApiError(410, "Username already exists");
  //   }
  // }

  const avatarLocalPath = req.files?.avatar[0].path;
  //-- there was a bug in this code javascript logic error
  //const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }
  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar is required");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Failed to upload avatar to cloudinary");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registring the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registerd Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  //req body -> data 
  //username or email
  //check if user exist or not
  //if exist then match the username or email with password
  //if match then generate access and refresh token and send it back to user
  //send cookie

  const { email, username, password } = req.body;
  console.log(email);
  if (!username && !email) {
    throw new ApiError(400, "username or email is required");
  }
  // Here is an alternative of above code based on logic discussed in video:
  // if (!(username || email)) {
  //     throw new ApiError(400, "username or email is required")

  // }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (!user) {
    throw new ApiError(404,"User does not exist")
  }
  const isPasswordValid = await user.isPasswordCorrect(password)
  if (!isPasswordValid) {
    throw new ApiError(404,"Invalid user credentials")
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)
  
  const loggedInUser = await User.findById(user.id).select(
    "-password -refreshToken"
  );
//Options are designed for cookies
  const options = {
    httpOnly: true,
    secure:true
  }



  return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user:loggedInUser,accessToken,refreshToken
        },
        "User logged in successfully"
    )
  )
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id, {
      $unset: {
        refreshToken:1
      }
  },
    {
      new:true
    }
  )
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
  .json(new ApiResponse(200,{},"User logged Out"))
})

export { registerUser, loginUser };