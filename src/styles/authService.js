import axios from 'axios';

export const loginWithGoogle = async (credential) => {
  const res = await axios.post('http://localhost:5000/api/auth/google', {
    credential
  });
  return res.data;
};