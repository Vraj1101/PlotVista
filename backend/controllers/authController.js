const User = require("../models/User");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { sendOTP } = require("../utils/smsService");

// ======================================================
// REGISTER USER
// ======================================================

const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // VALIDATE INPUTS
    if (!name || !email || !password || !phone || !role) {
      return res.status(400).json({
        message: "All fields are required (name, email, password, phone, role)",
      });
    }

    if (!/^[A-Za-z\s]+$/.test(name.trim())) {
      return res.status(400).json({
        message: "Name can contain only letters and spaces",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({
        message: "Please enter a valid email address",
      });
    }

    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        message: "Phone number must be exactly 10 digits",
      });
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
      return res.status(400).json({
        message: "Password must contain uppercase, lowercase and a number",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    // CHECK IF SAME EMAIL + SAME ROLE EXISTS
    const userExists = await User.findOne({
      email,
    });

    if (userExists) {
      // If the existing account is not fully verified (requires both email and phone verification),
      // we delete it to allow starting a new registration process with updated details.
      if (!userExists.isVerified || !userExists.isPhoneVerified) {
        await User.deleteOne({ _id: userExists._id });
      } else {
        return res.status(400).json({
          message: `A ${role} account already exists with this email`,
        });
      }
    }

    // HASH PASSWORD

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    // CREATE USER

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const phoneOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const phoneOtpExpire = Date.now() + 10 * 60 * 1000;

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      isVerified: false,
      verificationToken,
      isPhoneVerified: false,
      phoneVerificationCode: phoneOtp,
      phoneVerificationExpire: phoneOtpExpire,
    });

    if (user) {
      const verificationUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/verify-email/${verificationToken}?email=${encodeURIComponent(user.email)}`;

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // Send OTP code via SMS (Twilio)
      await sendOTP(phone, phoneOtp);

      console.log("\n=========================================");
      console.log("DEVELOPMENT PHONE VERIFICATION OTP:");
      console.log(phoneOtp);
      console.log("=========================================\n");

      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: "Verify Your PlotVista Account",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
              <h2 style="color: #10b981; text-align: center;">Welcome to PlotVista!</h2>
              <p>Hello ${user.name},</p>
              <p>Thank you for registering. Please click the button below to verify your email address and activate your account:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Verify Email</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #06b6d4;"><a href="${verificationUrl}">${verificationUrl}</a></p>
              <p>If you did not create an account, please ignore this email.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 12px; color: #777; text-align: center;">PlotVista Land Network</p>
            </div>
          `,
        });

        res.status(201).json({
          message: "Registration successful! Please check your email and verify your phone number to activate your account.",
          email: user.email,
          devPhoneOtp: phoneOtp,
        });
      } catch (mailError) {
        console.error("Nodemailer SMTP Error:", mailError);
        console.log("\n=========================================");
        console.log("DEVELOPMENT VERIFICATION LINK:");
        console.log(verificationUrl);
        console.log("=========================================\n");

        res.status(201).json({
          message: `Registration successful! Please check your email and verify your phone number to activate your account.`,
          email: user.email,
          devVerificationUrl: verificationUrl,
          devPhoneOtp: phoneOtp,
        });
      }
    } else {
      res.status(400).json({
        message: "Invalid user data",
      });
    }
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// ======================================================
// LOGIN USER
// ======================================================

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // FIND ALL USERS WITH SAME EMAIL

    const users = await User.find({
      email,
    });

    // NO USER FOUND

    if (!users || users.length === 0) {
      return res.status(401).json({
        message: "No account found with this email",
      });
    }

    // CHECK PASSWORDS

    let matchedUser = null;

    for (const user of users) {
      const isMatch = await bcrypt.compare(password, user.password);

      if (isMatch) {
        matchedUser = user;

        break;
      }
    }

    // NO PASSWORD MATCHED

    if (!matchedUser) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }

    // CHECK VERIFICATION (LEGACY SUPPORT)
    if (matchedUser.isVerified === undefined) {
      matchedUser.isVerified = true;
      await matchedUser.save({ validateBeforeSave: false });
    }

    if (matchedUser.isVerified === false) {
      return res.status(401).json({
        message: "Please verify your email address before logging in.",
      });
    }

    // CHECK PHONE VERIFICATION (LEGACY SUPPORT)
    if (matchedUser.isPhoneVerified === undefined) {
      matchedUser.isPhoneVerified = true;
      await matchedUser.save({ validateBeforeSave: false });
    }

    if (matchedUser.isPhoneVerified === false) {
      // Regenerate OTP
      const phoneOtp = Math.floor(100000 + Math.random() * 900000).toString();
      matchedUser.phoneVerificationCode = phoneOtp;
      matchedUser.phoneVerificationExpire = Date.now() + 10 * 60 * 1000;
      await matchedUser.save({ validateBeforeSave: false });

      // Send OTP code via SMS (Twilio)
      await sendOTP(matchedUser.phone, phoneOtp);

      console.log("\n=========================================");
      console.log(`NEW PHONE OTP FOR ${matchedUser.phone} (${matchedUser.email}):`);
      console.log(phoneOtp);
      console.log("=========================================\n");

      return res.status(403).json({
        message: "Please verify your phone number to complete login.",
        requiresPhoneVerification: true,
        email: matchedUser.email,
        phone: matchedUser.phone,
        devPhoneOtp: phoneOtp,
      });
    }

    // CREATE TOKEN

    const token = jwt.sign(
      { id: matchedUser._id },
      process.env.JWT_SECRET || "supersecretkey123",
      {
        expiresIn: "30d",
      },
    );

    // SEND RESPONSE

    res.json({
      _id: matchedUser._id,

      name: matchedUser.name,

      email: matchedUser.email,

      phone: matchedUser.phone,

      role: matchedUser.role,

      token,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// ======================================================
// FORGOT PASSWORD
// ======================================================

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "No user found with this email",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    console.log("User before save:",user);
    await user.save({validateBeforeSave: false});

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "PlotVista Password Reset",
        html: `
          <h2>Password Reset Request</h2>

          <p>Click the link below to reset your password:</p>

          <a href="${resetUrl}">
            Reset Password
          </a>

          <p>This link expires in 15 minutes.</p>
        `,
      });

      res.json({
        message: "Password reset email sent successfully",
      });
    } catch (mailError) {
      console.error("Nodemailer SMTP Error:", mailError);
      console.log("\n=========================================");
      console.log("DEVELOPMENT RESET LINK:");
      console.log(resetUrl);
      console.log("=========================================\n");

      res.status(500).json({
        message: `SMTP Mail Error: ${mailError.message}. However, since you are running locally, you can reset your password using this link (also printed in the backend console logs): ${resetUrl}`,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ======================================================
// RESET PASSWORD
// ======================================================

const resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset token",
      });
    }

    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(req.body.password, salt);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    res.json({
      message: "Password reset successful",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ======================================================
// VERIFY EMAIL
// ======================================================

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const { email } = req.query;

    if (email) {
      const user = await User.findOne({ email });
      if (user && user.isVerified) {
        return res.json({
          message: "Email verified successfully! You can now log in.",
        });
      }
    }

    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired verification token",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;

    await user.save({ validateBeforeSave: false });

    res.json({
      message: "Email verified successfully! You can now log in.",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ======================================================
// VERIFY PHONE OTP
// ======================================================

const verifyPhone = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP code are required",
      });
    }

    const user = await User.findOne({
      email,
      phoneVerificationCode: otp,
      phoneVerificationExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired OTP code",
      });
    }

    user.isPhoneVerified = true;
    user.phoneVerificationCode = undefined;
    user.phoneVerificationExpire = undefined;

    await user.save({ validateBeforeSave: false });

    // Generate token if email is also verified so they can log in immediately
    let token = null;
    if (user.isVerified) {
      token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET || "supersecretkey123",
        {
          expiresIn: "30d",
        }
      );
    }

    res.json({
      message: "Phone number verified successfully!",
      isVerified: user.isVerified,
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ======================================================
// CHECK VERIFICATION STATUS
// ======================================================

const checkVerificationStatus = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let token = null;
    if (user.isVerified && user.isPhoneVerified) {
      token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET || "supersecretkey123",
        {
          expiresIn: "30d",
        }
      );
    }

    res.json({
      isVerified: user.isVerified || false,
      isPhoneVerified: user.isPhoneVerified || false,
      token,
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  verifyEmail,
  verifyPhone,
  checkVerificationStatus
};

