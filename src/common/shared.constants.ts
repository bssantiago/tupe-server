const TRANSPORT = {
    service: 'gmail',
    auth: {
        user: 'url.shortener.info@gmail.com',
        pass: 'shorten1234'
    }
};
const MAILOPTIONS = {
    from: 'bssantiago@gmail.com',
    to: '',
    subject: 'url-shortener',
    html: ''
};
const APPDOMAIN = 'http://localhost:4200/#/user/setpass';
const ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
const BASE = ALPHABET.length;

export { TRANSPORT, MAILOPTIONS, APPDOMAIN, ALPHABET, BASE };
