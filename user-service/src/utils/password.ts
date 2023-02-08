import bcrypt from 'bcrypt';
const saltRounds = 10;
export const generateHash = async (text: string) => new Promise<string>((resolve, reject) => {
  bcrypt.genSalt(saltRounds, function (err, salt) {
    if (err) return reject(err)
    bcrypt.hash(text, salt, function (err, hash) {
      if (err) return reject(err)
      resolve(hash)
    });
  });
})

export const checkHash = async (text: string, hash: string,) => new Promise<boolean>((resolve, reject) => {
  bcrypt.compare(text, hash, function (err, result) {
    if (err) return reject(err);
    resolve(result)
  });
})
