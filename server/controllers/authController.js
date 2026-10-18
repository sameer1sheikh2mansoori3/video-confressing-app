
export const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log(`Received signup request with username: ${username}, email: ${email}`);
    // Check if the user already exists
    // const existingUser = await User.findOne({ email });
    // if (existingUser) {    

    // }
    res.status(201).json({ message: 'User registered successfully' });
}
catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
  }
  catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;     
  }
  catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;    
  }
  catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};  