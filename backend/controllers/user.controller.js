import bcrypt from "bcryptjs";
import { User } from "../models/user.model.js";
import cloudinary from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import { Post } from "../models/post.model.js";
import getDataUri from "../utils/dataUri.js";

export const signUp = async (req, res) => {
  try {
    const { userName, email, password } = req.body;
    if (!userName || !email || !password)
      return res.status(401).json({
        message: "Something is missing, please check!",
        Success: false,
      });
    const user = await User.findOne({ email });
    if (user)
      return res.status(401).json({
        message: "Try with different email",
        success: false,
      });
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      userName,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    return res.status(201).json({
      success: true,
      user: newUser,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(401).json({
        success: false,
        message: "Some fields are missing",
      });

    let user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "First make a account to login",
      });
    }

    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password",
      });
    }
    user = {
      _id: user._id,
      username: user.userName,
      email: user.email,
      profilePicture: user.profilePicture,
      bio: user.bio,
      followers: user.followers,
      following: user.following,
      posts: user.posts,
    };
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    return res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 1 * 24 * 60 * 60 * 1000,
      })
      .json({
        message: `Welcomeback ${user.username}`,
        success: "true",
        user,
      });
  } catch (error) {
    console.log(error);
  }
};

export const logout = async (req, res) => {
  try {
    res
      .cookie("token", "", {
        maxAge: 0,
      })
      .json({
        message: "Logout successfully",
        success: true,
      });
  } catch (error) {
    console.log(error.message);
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    let user = await User.findById(userId)
      .select("-password")
      .populate({ path: "posts", createdAt: -1 })
      .populate({ path: "bookmarks" });
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log(error.message);
  }
};

export const editProfile = async (req, res) => {
  try {
    const userId = req.id;
    // console.log(req);

    const { bio, gender } = req.body;
    const profilePicture = req.file;
    let cloudResponse;

    if (profilePicture) {
      const fileUri = getDataUri(profilePicture);
      cloudResponse = await cloudinary.uploader.upload(fileUri);
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User not found",
        success: false,
      });
    }

    if (bio) user.bio = bio;
    if (gender) user.gender = gender;
    if (profilePicture) user.profilePicture = cloudResponse.secure_url;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated",
      user,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const SuggestedUsers = await User.find({ _id: { $ne: req.id } }).select(
      "-password"
    );

    if (!SuggestedUsers)
      return res.status(400).json({
        message: "Currently do not have any users",
      });
    console.log(SuggestedUsers);
    return res.status(200).json({
      success: true,
      users: SuggestedUsers,
    });
  } catch (error) {
    console.log(error.message);
  }
};

export const followOrUnfollow = async (req, res) => {
  try {
    const followKrneWala = req.id;

    const jiskoFollowKrunga = req.params.id;

    if (followKrneWala === jiskoFollowKrunga)
      return res.staus(401).json({
        success: false,
        message: "You cannot follow/unfollow yourself",
      });
    const user = await User.findById(followKrneWala);
    const targetUser = await User.findById(jiskoFollowKrunga);

    if (!user || !targetUser)
      return res.staus(401).json({
        success: false,
        message: "User not found",
      });

    // now mai check kruna ki follow krna h ki nahi
    const isFollowing = user.following.includes(jiskoFollowKrunga);

    if (isFollowing) {
      // unfollow logic
      await Promise.all([
        User.updateOne(
          { _id: followKrneWala },
          {
            $pull: {
              following: jiskoFollowKrunga,
            },
          }
        ),
        User.updateOne(
          { _id: jiskoFollowKrunga },
          {
            $pull: {
              followers: followKrneWala,
            },
          }
        ),
      ]);
      return res.status(200).json({
        message: "Unfollowed Successfully",
        Success: true,
      });
    } else {
      // follow logic
      await Promise.all([
        User.updateOne(
          { _id: followKrneWala },
          {
            $push: {
              following: jiskoFollowKrunga,
            },
          }
        ),
        User.updateOne(
          { _id: jiskoFollowKrunga },
          {
            $push: {
              followers: followKrneWala,
            },
          }
        ),
      ]);

      return res.status(200).json({
        message: "followed Successfully",
        Success: true,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};
