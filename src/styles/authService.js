import axios from 'axios';

export const loginWithGoogle = async (credential) => {
  const res = await axios.post('backendmongo-production.up.railway.app', {
    credential
  });
  return res.data;
};