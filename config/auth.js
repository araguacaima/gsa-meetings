// config/auth.js
const googleAuthWeb = require('./client_secret_web.json');

// expose our config directly to our application using module.exports
module.exports = {
    "facebookAuth":{
        "clientID":"your-secret-clientID-here",
        "clientSecret":"your-client-secret-here",
        "callbackURL":"http://localhost:8080/auth/facebook/callback",
        "profileURL":"https://graph.facebook.com/v2.5/me?fields=first_name,last_name,email",
        "profileFields":[
            "id",
            "email",
            "name"
        ]
    },
    "twitterAuth":{
        "consumerKey":"your-consumer-key-here",
        "consumerSecret":"your-client-secret-here",
        "callbackURL":"http://localhost:8080/auth/twitter/callback"
    },
    "googleAuth":{
        "clientID":"529304702279-ss3ogfatd25q9e5s8ujvnd1shna577i8.apps.googleusercontent.com",
        "clientSecret":"_qT0H5kmGshodjqBUvpyokc3",
        "callbackURL":"http://localhost:8080/auth/google/callback",
        "developerKey": "AIzaSyDccPr88ivo4f9s5n5sKgY0wKgSohnLx48"
    },
    'googleAuth2': googleAuthWeb,
    "secrets":{
        "passport":"394thw948tf9348rud2349u8cfc94"
    },
    "commons" : {
        //"store" : true
    }
};
