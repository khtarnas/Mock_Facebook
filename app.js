/* Some initialization boilerplate. Also, we include the code from
   routes/routes.js, so we can have access to the routes. Note that
   we get back the object that is defined at the end of routes.js,
   and that we use the fields of that object (e.g., routes.get_main)
   to access the routes. */

var express = require('express');
var routes = require('./routes/routes.js');
var sessions = require('express-session');
var app = express();
app.use(express.urlencoded());
app.use(sessions({secret: "loginSecret"}));

/* Below we install the routes. The first argument is the URL that we
   are routing, and the second argument is the handler function that
   should be invoked when someone opens that URL. Note the difference
   between app.get and app.post; normal web requests are GETs, but
   POST is often used when submitting web forms ('method="post"'). */

/*
 * Routes
 */
app.get('/', routes.get_main);
app.post('/checklogin', routes.check_login);
app.get('/signup', routes.sign_up);
app.post('/createaccount', routes.create_account);
app.get('/userpage', routes.user_page);
app.post('/logout', routes.logout);
app.post('/updateaccount', routes.update_account);
app.get('/users', routes.users);
app.post('/requestFriend', routes.request_friend);
app.post('/removeFriend', routes.remove_friend);
app.get('/friendrequests', routes.friend_requests);
app.post('/acceptfriend', routes.accept_friend);
app.post('/denyfriend', routes.deny_friend);
app.post('/getmatchingusers', routes.get_matching_users);

/**
 * 
 * X17: Below here has been added since merge
 * 
 */
app.get('/wall/:username', routes.get_user_wall);
app.post('/deletepost', routes.delete_post);
app.post('/createpost', routes.create_post);
app.post('/createcomment', routes.create_comment);
app.post('/deletecomment', routes.delete_comment);
app.get('/homepage', routes.get_homepage);
app.get('/wallposts/:username', routes.get_user_wallposts);
app.get('/homepageposts', routes.get_homepage_posts);
/* Run the server */

app.listen(8081); //8081 for localhost and 80 for hosting
