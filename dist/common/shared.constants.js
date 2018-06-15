"use strict";
const TRANSPORT = {
    service: 'gmail',
    auth: {
        user: 'url.shortener.info@gmail.com',
        pass: 'shorten1234'
    }
};
exports.TRANSPORT = TRANSPORT;
const MAILOPTIONS = {
    from: 'bssantiago@gmail.com',
    to: '',
    subject: 'url-shortener',
    html: ''
};
exports.MAILOPTIONS = MAILOPTIONS;
const APPDOMAIN = 'http://localhost:4200/#/user/setpass';
exports.APPDOMAIN = APPDOMAIN;
const ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
exports.ALPHABET = ALPHABET;
const BASE = ALPHABET.length;
exports.BASE = BASE;
//# sourceMappingURL=shared.constants.js.map