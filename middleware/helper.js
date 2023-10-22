const crypto = require('crypto');
const ENC_KEY = "A60A5770FE5E7AB200BA9CFC94E4E8B0"
const IV = "1234567887654321";



function encrypt(encrypted) {
    const cipher = crypto.createCipheriv('aes-256-cbc', ENC_KEY, IV);
    let encryptedData = cipher.update(JSON.stringify(encrypted), 'utf8', 'base64');
    encryptedData += cipher.final('base64');
    return encryptedData
}

function decryption(data) {
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENC_KEY, IV);
    let decryptedData = decipher.update(data, 'base64', 'utf8');
    decryptedData += decipher.final('utf8');
    return decryptedData;
}


module.exports = {
    encrypt,
    decryption
}