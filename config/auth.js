// expose our config directly to our application using module.exports
module.exports = {
    facebookAuth: {
        clientID: "your-secret-clientID-here",
        clientSecret: "your-client-secret-here",
        callbackURL: "http://localhost:8080/auth/facebook/callback",
        profileURL: "https://graph.facebook.com/v2.5/me?fields=first_name,last_name,email",
        profileFields: [
            "id",
            "email",
            "name"
        ]
    },
    twitterAuth: {
        consumerKey: "your-consumer-key-here",
        consumerSecret: "your-client-secret-here",
        callbackURL: "http://localhost:8080/auth/twitter/callback"
    },
    googleAuth: {
        developer_key: "AIzaSyDccPr88ivo4f9s5n5sKgY0wKgSohnLx48",
        client_id: "529304702279-ss3ogfatd25q9e5s8ujvnd1shna577i8.apps.googleusercontent.com",
        project_id: "gsaapps-187315",
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://accounts.google.com/o/oauth2/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_secret: "_qT0H5kmGshodjqBUvpyokc3",
        redirect_uris: [
            "http://localhost:3000/auth/google/callback",
            "http://localhost:8080/auth/google/callback"
        ],
        home: "http://localhost:8080",
        javascript_origins: [
            "http://localhost:8080"
        ],
        scopes: [
            'https://www.googleapis.com/auth/calendar.readonly',
            'https://www.googleapis.com/auth/plus.login'
        ]
    },
    secrets: {
        passport: "394thw948tf9348rud2349u8cfc94"
    },
    commons: {
        //"store" : true
    },
    jiraAuth: {
        base_url: "https://globalitprocess.bbva.com",
        request_token_uri: "/plugins/servlet/oauth/request-token",
        access_token_uri: "/plugins/servlet/oauth/access-token",
        redirect_uri: "http://localhost:8080/auth/jira/callback",
        authorize_uri: "/plugins/servlet/oauth/authorize",
        algorithm: "RSA-SHA1",
        key: "mykey",
        api_version: "1.0",
        cert_file_name: "alex.ppk"
    },
    trelloAuth: {
        request_token_uri: "https://trello.com/1/OAuthGetRequestToken",
        access_token_uri: "https://trello.com/1/OAuthGetAccessToken",
        authorize_uri: "https://trello.com/1/OAuthAuthorizeToken",
        app_name: "GSA-Tools",
        redirect_uri: "http://localhost:8080/auth/trello/callback",
        key: "252a684bbe907946a0f0d699309c78a3",
        secret: "af376e7b186a0e65b3d3cf859e47fa822d2ab35fc6a1ba3a701ee9aced78b00a"
    }
};
