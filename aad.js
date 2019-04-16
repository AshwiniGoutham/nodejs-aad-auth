var express = require('express');
var cookieParser = require('cookie-parser');
var session = require('cookie-session');
var crypto = require('crypto');
var config = require('./config');

var AuthenticationContext = require('adal-node').AuthenticationContext;
var app = express();

var templateAuthzUrl = 'https://login.microsoftonline.com/' + config.creds.tenant + '/oauth2/authorize?response_type=code&client_id=<client_id>&redirect_uri=<redirect_uri>&state=<state>';
var authorityUrl = config.creds.authorityHostUrl + '/' + config.creds.tenant;

app.use(cookieParser('a deep secret'));
app.use(session({ secret: config.creds.clientSecret }));

app.get('/', function (req, res) {
    res.redirect('authlogin');
});

// Clients get redirected here in order to create an OAuth authorize url and redirect them to AAD.
// There they will authenticate and give their consent to allow this app access to
// some resource they own.
app.get('/authlogin', function (req, res) {
    crypto.randomBytes(48, function (ex, buf) {
        var token = buf.toString('base64').replace(/\//g, '_').replace(/\+/g, '-');
        console.log("token:" + token);
        res.cookie('authstate', token);
        var authorizationUrl = createAuthorizationUrl(token);
        console.log("authorizationUrl:" + authorizationUrl);
        res.redirect(authorizationUrl);
    });
});

function createAuthorizationUrl(state) {
    var authorizationUrl = templateAuthzUrl.replace('<client_id>', config.creds.clientID);
    authorizationUrl = authorizationUrl.replace('<redirect_uri>', config.creds.redirectUrl);
    authorizationUrl = authorizationUrl.replace('<state>', state);
    console.log(authorizationUrl);
    return authorizationUrl;
}

// After consent is granted AAD redirects here.  The ADAL library is invoked via the
// AuthenticationContext and retrieves an access token that can be used to access the
// user owned resource.
app.get('/getrev', function (req, res) {
    res.send("Successfull !!");
    // if (req.cookies.authstate !== req.query.state) {
    //     res.send('error: state does not match');
    //   }
    //   var authenticationContext = new AuthenticationContext(authorityUrl);
    //   authenticationContext.acquireTokenWithAuthorizationCode(req.query.code, config.creds.redirectUrl, "", config.creds.clientId, config.creds.clientSecret, function(err, response) {
    //     var message = '';
    //     if (err) {
    //       message = 'error: ' + err.message + '\n';
    //     }
    //     message += 'response: ' + JSON.stringify(response);
    
    //     if (err) {
    //       res.send(message);
    //       return;
    //     }
    
    //     // Later, if the access token is expired it can be refreshed.
    //     authenticationContext.acquireTokenWithRefreshToken(response.refreshToken, sampleParameters.clientId, sampleParameters.clientSecret, resource, function(refreshErr, refreshResponse) {
    //       if (refreshErr) {
    //         message += 'refreshError: ' + refreshErr.message + '\n';
    //       }
    //       message += 'refreshResponse: ' + JSON.stringify(refreshResponse);
    
    //       res.send("Successfull !!"); 
    //     }); 
    //   });
});

app.listen(3000);
console.log('listening on 3000');
