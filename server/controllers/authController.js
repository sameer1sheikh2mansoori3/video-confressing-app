
import User from '../modals/userModel.js';
import StatusCodes from '../utils/statusCodes.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import sendEmail from '../utils/sendEmail.js';
export const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    // console.log(`Received signup request with username: ${username}, email: ${email}`);
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {    
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'User already exists' });
    }else{
        const user = await User.create(req.body);
        return res.status(StatusCodes.CREATED).json({ message: 'User registered successfully', user });
    }
}
catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Server error' , messageDescriptions: error.message });
  }
};

export const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    // 1. Validation
    if (!email || !password) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Email and password required' });
    }

    // 2. Normalize email
    email = email.toLowerCase().trim();

    // 3. Password ko explicitly fetch karo
    const user = await User.findOne({ email }).select('+password');

    // 4. Debug log — password NEVER
    console.log('Login attempt:', email);

    // 5. User nahi mila
    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid credentials' });
    }

    // 6. Password match karo
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid credentials' });
    }

    // 7. Token banao
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 8. Response — password hatao (toJSON already handles)
    res.status(StatusCodes.OK).json({
      message: 'Login successful',
      token,
      user,
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
  }
};


export const forgotPassword = async (req, res) => {
  try {
    console.log("these are the details of the request body", );
    const { email } = req.body;

    if (!email) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // SECURITY: agar user na mile bhi, same response do
    // Warna attacker pata kar lega ki kaunsa email registered hai
    if (!user) {
      return res.status(StatusCodes.OK).json({
        message: 'If that email exists, a reset link has been sent',
      });
    }

    // 1. Random raw token (yeh email me jayega)
    const rawToken = crypto.randomBytes(32).toString('hex');

    // 2. DB me HASH store karo (raw nahi)
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    // 3. Expiry — 15 minute
    user.passwordResetExpires = Date.now() + 15 * 60 * 1000;

    // ⚠️ save() nahi, save({ validateBeforeSave: false })
    // kyunki password field required hai aur user ne change nahi kiya
    await user.save({ validateBeforeSave: false });

    // 4. Email me plain token ke saath link bhejo
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;

    const html = `
      <h2>Password Reset Request</h2>
      <p>Hi ${user.name || user.username},</p>
      <p>Click below to reset your password. Link expires in <b>15 minutes</b>.</p>
      <a href="${resetUrl}"
         style="display:inline-block;padding:10px 20px;background:#4f46e5;color:#fff;
                text-decoration:none;border-radius:6px;">
        Reset Password
      </a>
      <p>Or paste this link in browser:</p>
      <p>${resetUrl}</p>
      <p>If you didn't request this, ignore this email.</p>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: 'Password Reset (valid for 15 min)',
        html,
      });
    } catch (mailErr) {
      // Email fail hua toh token reset kar do — warna DB me useless token pada rahega
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      console.error('Email send failed:', mailErr.message);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Could not send email. Try again later.',
      });
    }

    return res.status(StatusCodes.OK).json({
      message: 'If that email exists, a reset link has been sent',
    });
  } catch (error) {
    console.error('forgotPassword error:', error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'New password is required' });
    }

    if (newPassword.length < 6) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Password must be at least 6 characters' });
    }

    // 1. Hash the incoming raw token from URL to match the stored hash in DB
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // 2. Find user where token matches and expiry time has not passed
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Password reset link is invalid or has expired',
      });
    }

    // 3. Update password and clear reset fields (pre-save hook will hash the password)
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    // 4. Generate new JWT token so user is automatically logged in
    const authToken = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(StatusCodes.OK).json({
      message: 'Password reset successful',
      token: authToken,
    });
  } catch (error) {
    console.error('resetPassword error:', error.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Server error',
      error: error.message,
    });
  }
};  