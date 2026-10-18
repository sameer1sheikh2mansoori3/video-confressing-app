
import User from '../modals/userModel.js';
import StatusCodes from '../utils/statusCodes.js';
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
    const { email, password} = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid credentials' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid credentials' });
    }
    res.status(StatusCodes.OK).json({ message: 'Login successful' });

  }
  catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Server error' , error: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;    
    if (!email) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Email is required' });
    }   
    else{
        const user = await User.findOne({ email }); 
        if(!user){
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' });
        }else{
            // TODO: Generate a password reset token and send it via email (not implemented here)
            return res.status(StatusCodes.OK).json({ message: 'Password reset link sent to email' });
        } 
    } 
  }
  catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Server error' , error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;    
  }
  catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Server error' , messageDescription: error.message });
  }
};  