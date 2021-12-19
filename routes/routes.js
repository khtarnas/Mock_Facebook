var db = require('../models/database.js');

/** 
 * Send to the main login page 
 * or redirect to the userpage if there is a current session.
 *
 * (Implementation Complete!)
 */
var getMain = function(req, res) {
	// If there is no current session, send to login page, else send to restaurants
	if (!req.session.username) {
  		res.render('login.ejs', {errMessage: req.session.errMesage});
		req.session.errMessage = null;
	} else {
		req.session.errMessage = "You cannot access the login page when logged in...";
		res.redirect('/userpage');
	}
};

/**
 * Checks whether or not the given information is acceptable for a login.
 * If it is, then it will create a session containing:
 *  - username
 *  - password
 *  - firstname
 *  - lastname
 *
 * (Implementation Incomplete: need to update online value -- TODO)
 */
var checkLogin = function(req, res) {
	// Set all our variables
	var username = req.body.username;
	var password = req.body.password;

 	// Handle the cases when the username or password are missing
 	if (!req.body.username && !req.body.password) {
		if (!req.session.username || !req.session.password) {
	  		res.render('login.ejs', {errMessage: "LOGIN FAILED: No username or password was entered..."});
		} else {
			res.redirect('/userpage');
		}
 	} else if (!req.body.username) {
		if (!req.session.username || !req.session.password) {
	  		res.render('login.ejs', {errMessage: "LOGIN FAILED: No username was entered..."});
		} else {
			res.redirect('/userpage', );
		}
 	} else if (!req.body.password) {
		if (!req.session.username || !req.session.password) {
			res.render('login.ejs', {errMessage: "LOGIN FAILED: No password was entered..."});
		} else {
			res.redirect('/userpage');
		}
	} else {
	  	// Look up the corresponding information and handle cases within that
	  	db.lookupUser(username, password, function(err, data) {
			if (err) {
				
				// If there is no current session, send to login page, else send to restaurants
				if (!req.session.username || !req.session.password) {
			  		res.render('login.ejs', {errMessage: err});
				} else {
					req.session.errMessage = err;
					res.redirect('/userpage');
				}
	    	} else if (data) {
		 		if (data.password.S === password) {
			
					// If the password matches, add all session variables and send to restaurants
					req.session.username = req.body.username;
					req.session.password = req.body.password;
					req.session.firstname = data.firstname.S;
					req.session.lastname = data.lastname.S;
					req.session.email = data.email.S;
					req.session.affiliation = data.affiliation.S;
					req.session.birthday = data.birthday.S;
					req.session.interests = data.interests.SS;	
					
					// Update the online value 	
					//TODO
					res.redirect('/userpage');
					
		  		} else {
					// If there is no current session, send to login page, else send to restaurants
					if (!req.session.username || !req.session.password) {
				  		res.render('login.ejs', {errMessage: "LOGIN FAILED: The password was incorrect..."});
					} else {
						res.redirect('/userpage');
					}
				}
	    	} else {
				// If there is no current session, send to login page, else send to restaurants
				if (!req.session.username || !req.session.password) {
			  		res.render('login.ejs', {errMessage: "LOGIN FAILED: No such username exists..."});
				} else {
					res.redirect('/userpage');
				}
	    	}
	  	});
	}
};

/**
 * Send to Sign up page
 * or redirect to the userpage if there is a current session.
 *
 * (Implementation Complete!)
 */
var signUp = function(req, res) {
	// If there is no current session, send to login page, else send to restaurants
	if (!req.session.username || !req.session.password) {
  		res.render('signup.ejs', {errMessage: null});
	} else {
		req.session.errMessage = "You cannot access the create account page when logged in...";
		res.redirect('/userpage');
	}
};

/**
 * Adds given information if it is in the right format
 * (including updating the online information)
 *
 * (Implementation Complete! -- TODO: adding online component)
 */
var createAccount =  function(req, res) {
	
	// Handle the cases when the username, password or fullname are missing
 	if (!req.body.username || !req.body.password || !req.body.firstname || !req.body.lastname ||
			!req.body.email || !req.body.affiliation || !req.body.birthday || 
			!req.body.interests) {
		res.render('signup.ejs', {errMessage: "LOGIN FAILED: At least one of required fields was missing..."});
 	} else {
	
		// Split interets into SS and ensure there are at least 2
		var interests = req.body.interests.split(",");
		if (interests.length < 2) {
			res.render('signup.ejs', {errMessage: "LOGIN FAILED: You must declare at least two interests..."});
		} else {
		
			// Add user and handle cases stemming from that
			db.addUser(req.body.username, req.body.password, req.body.firstname, req.body.lastname,
						req.body.email, req.body.affiliation, req.body.birthday, interests, function(err, data) {
				if (err) {
		      		res.render('signup.ejs', {errMessage: err});
		    	} else {
					// Add the session variables and redirect to restaurants
					req.session.username = req.body.username;
					req.session.password = req.body.password;
					req.session.firstname = req.body.firstname;
					req.session.lastname = req.body.lastname;
					req.session.email = req.body.email;
					req.session.affiliation = req.body.affiliation;
					req.session.birthday = req.body.birthday;
					req.session.interests = req.body.interests;	
					res.redirect('/userpage');
			   	}
			});
		}
	}
}

/**
 * Adds given information if it is in the right format
 * (including updating the online information)
 *
 * (Implementation Complete! -- TODO: adding online component)
 */
var userPage = function(req, res) {
	if (req.session.username) {
		res.render('userpage.ejs', {errMessage: req.session.errMessage, username: req.session.username,
						firstname: req.session.firstname, lastname: req.session.lastname});
	} else {
		res.render('login.ejs', {errMessage: "Cannot access the user page when not logged in..."})
	}
	
}

/**
 * Destroys the session and changes the online component.
 *
 * (Implementation Complete!)
 */
var logout = function(req, res) {
	
	// Update the "online" value of the user
	console.log(req.session.username);
	db.changeOnline(req.session.username, req.session.password, false, function(err, data) {
		if (err) {
			req.session.errMessage = err;
      		res.redirect('/userpage');
    	} else {
	
			// Once the session is destroy, return to the login page
			res.render('login.ejs', {errMessage: null})
			
			// Destroy the current session
			req.session.destroy();
	   	}
	});
}

/**
 * Updates the function given the new values to be updated
 *
 * (Implementation Incomplete! -- TODO: implement)
 */
var updateAccount = function(req, res) {
	
	if (req.body.old_password !== req.session.password) {
		req.session.errMessage = "ERROR: Incorrect password entered...";
      	res.redirect('/userpage');
	}
	
	// If some non-needed value is not entered, don't reset it
	if (!req.body.new_email) {
		req.body.new_email = req.session.email;
	}
	if (!req.body.new_password) {
		req.body.new_password = req.session.password;
	}
	if (!req.body.new_affiliation) {
		req.body.new_affiliation = req.session.affiliation;
	}
	
	// if interests given, separate out 
	var interests;
	if (!req.body.new_interests) {
		interests = req.session.interests;
	} else {
		interests = req.body.new_interests.split(",");
		if (interests.length < 2) {
			req.session.errMessage = "ERROR: You must declare at least two interests...";
			res.redirect('/userpage');
		}
	}
	
	// Update user and handle cases stemming from that
	db.updateUser(req.session.username, req.body.old_password, req.body.new_email,
		req.body.new_password, req.body.new_affiliation, interests, function(err, data) {
		if (err) {
			console.log(err);
			req.session.errMessage = err;
      		res.redirect('/userpage');
    	} else {
			// Add the session variables and redirect to restaurants
			req.session.email = req.body.new_email;
			req.session.password = req.body.new_password;
			req.session.affiliation = req.body.new_affiliation;
			req.session.interests = req.body.new_interests;	
			req.session.errMessage = null;
			res.redirect('/userpage');
	   	}
	});
}

var users = function (req, res) { 
	
	// if there is no session, send to login page
	if (!req.session.username) {
		res.redirect('/');
	} else {
	
		// get the current user
		username = req.session.username;
		
		// find the friends of this user
		db.findUsersAndFriends(username, function(data, err, friendsData) {
			
			// if there is no data found, just make empty lists
			if (err) {
				console.log(err);
				req.session.errMessage = err;
	      		res.redirect('/userpage'); 
			
			// if no data at all
	    	} else if (!data) {
				res.render('all_users.ejs', {errMessage: 'There are no users...', users: [], friends: []});
				
			// if we got data, but we don't have friend data
			} else if (!friendsData) {
				console.log(data);
				res.render('all_users.ejs', {errMessage: null, users: data, friends: []});
			} else {
				
				// if we got all our data!!
				if (friendsData.friends) {
					
					//remove friends from user set and add them to a friends list (so we have all our needed info)
					var friend_names = friendsData.friends.SS;
					var friends = [];
					
					// go through all users
					for (var i = data.length - 1; i >= 0; i--) {
						
						// compare to all friends
						for (var j = 0; j < friend_names.length; j++) {
							if (data[i].username.S === friend_names[j]) {
								
								// add to friends and remove from users
								friends.push(data[i]);
								data.splice(i, 1);
								
								// break
								break;
							}
						}
					}
					res.render('all_users.ejs', {errMessage: null, users: data, friends: friends});
				} else {
					res.render('all_users.ejs', {errMessage: null, users: data, friends: []});
				}
			}
		});
	}
}

var requestFriend = function (req, res) {
	
	// get usernames
	console.log("we made it");
	sender_username = req.session.username;
	receiver_username = req.body.username;
	
	// add the friend request
	db.sendFriendRequest(sender_username, receiver_username, function(err, data) {
		if (err) {
			console.log(err);
			data = {
				success: false,
				message: err
			};
      		res.send(JSON.stringify(data));
    	} else {
			console.log("hullo");
			data = {
				success: true,
				message: data
			};
			res.send(JSON.stringify(data));
	   	}
	});
}

var removeFriend = function (req, res) {
	
	// get usernames
	curr_username = req.session.username;
	removing = req.body.username;
	
	// add the friend request
	db.removeFromFriends(curr_username, removing, function(err, data) {
		if (err) {
			console.log(err);
			data = {
				success: false,
				message: err
			};
      		res.send(JSON.stringify(data));
    	} else {
			data = {
				success: true,
				message: data
			};
			res.send(JSON.stringify(data));
	   	}
	});
}

var friendRequests = function(req, res) {
	
	if (req.session.username) {
		
		// get username
		username = req.session.username;
		
		// add the friend request
		db.getFriendRequests(username, function(err, data) {
			if (err) {
				req.session.errMessage = err;
				res.redirect('/userpage');
	    	} else if (data) {
				if (data.sender_usernames) {
					res.render('friend_requests.ejs', {errMessage: null, requests: data.sender_usernames.SS})
				} else {
					res.render('friend_requests.ejs', {errMessage: null, requests: []})
				}
		   	} else {
				res.render('friend_requests.ejs', {errMessage: null, requests: []})
			}
		});
	} else {
		req.session.errMessage = "ERROR: must be signed in to view the friend requests page";
		res.redirect('/');
	}
	
}

var acceptFriend = function(req, res) {
	
	// get needed users
	var curr = req.session.username;
	var accepting = req.body.username;
	
	// call db function to accept this user
	db.acceptFriendRequest(curr, accepting, function(err, data) {
		if (err) {
			console.log(err);
			data = {
				success: false,
				message: err
			};
      		res.send(JSON.stringify(data));
    	} else {
			data = {
				success: true,
				message: data
			};
			res.send(JSON.stringify(data));
	   	}
	});
}

var denyFriend = function(req, res) {
	
	// get needed users
	var curr = req.session.username;
	var accepting = req.body.username;
	
	// call db function to accept this user
	db.removeFriendRequest(curr, accepting, function(err, data) {
		if (err) {
			console.log(err);
			data = {
				success: false,
				message: err
			};
      		res.send(JSON.stringify(data));
    	} else {
			data = {
				success: true,
				message: data
			};
			res.send(JSON.stringify(data));
	   	}
	});
}

var getMatchingUsers = function(req, res) {
	var userstem = req.body.user_stem;
	
	db.matchUserStem(userstem, function(err, data) {
		if (err) {
			res.send(JSON.stringify({message: err, users: null}));
			
		// if there is data
    	} else if (data) {
			console.log(data);
			res.send(JSON.stringify({message: null, users: data}));
			
		// if there are no matching users
	   	} else {
			res.send(JSON.stringify({message: "There are no users matching that search...", users: null}));
		}
	});
}

/**
 * 
 * X17: Below here has been added since merge
 * 
 */

 var getUserWall = function(req, res) {
 	var user = req.params.username;

 	// check if user is logged in (not neccesarily to the same user as this wall)
 	if (req.session.username) {
	 	db.getUserWallPosts(user, function(err, data) {
	 		if (err) {
	 			req.session.errMessage = "ERROR" + err;
	 			res.redirect('/userpage');
	 		} else if (data) {
	 			res.render('walls.ejs', {errMessage: null, posts: data, user: user});
	 		} else {
	 			res.render('walls.ejs', {errMessage: null, posts: [], user: user});
	 		}
	 	});

	 // Redirect if not logged in;
	 } else {
	 	req.session.errMessage = "ERROR: cannot access user wall while not logged in!";
	 	res.redirect('/');
	 }
 }

var deletePost = function(req, res) {

	// get required parameters
	var userwhosewall = req.body.username;
	var datetime = req.body.datetime;
	console.log(datetime);

	if (req.session.username) {

		db.deletePost(userwhosewall, datetime, function(err, data) {
			if (err) {
				console.log(err);
				req.session.errMessage = "ERROR: " + err;
				res.redirect('wall/' + userwhosewall);
				// data = {
				// 	success: false,
				// 	message: err
				// };
	   //    		res.send(JSON.stringify(data));
	    	} else {
	    		console.log('Post was succesfully deleted!');
				res.redirect('wall/' + userwhosewall);
				// data = {
				// 	success: true,
				// 	message: data
				// };
				// res.send(JSON.stringify(data));
		   	}
		});

	// if not logged in
	} else {
		req.session.errMessage = "ERROR: cannot delete post when not logged in";
		res.redirect('/');
	}
}

var createPost = function(req, res) {

	// get required parameters
	var userwhosewall = req.body.user;
	var poster = req.session.username;
	var content = req.body.content;
	var datetime = new Date();
	datetime = datetime.toString();
	var comments = [];

	if (req.session.username) {

		db.createPost(userwhosewall, poster, content, datetime, comments, function(err, data) {
			if (err) {
				console.log(err);
				req.session.errMessage = "ERROR: " + err;
				res.redirect('wall/' + userwhosewall);
	    	} else {
	    		console.log('Posted was succesfully added');
				res.redirect('wall/' + userwhosewall);
		   	}
		});

	// if not logged in
	} else {
		req.session.errMessage = "ERROR: cannot delete post when not logged in";
		res.redirect('/');
	}
}

var createComment = function(req, res) {

	// get required parameters
	var userwhosewall = req.body.user;
	var post_datetime = req.body.datetime;
	var commenter = req.session.username;
	var content = req.body.content;
	var new_datetime = new Date();
	datetime = new_datetime.toString();

	if (req.session.username) {

		db.createComment(userwhosewall, post_datetime, commenter, content, datetime, function(err, data) {
			if (err) {
				console.log(err);
				req.session.errMessage = "ERROR: " + err;
				res.redirect('wall/' + userwhosewall);
				// console.log(err);
				// data = {
				// 	success: false,
				// 	message: err
				// };
	   //    		res.send(JSON.stringify(data));
	    	} else {
	    		console.log('Comment was succesfully added');
				res.redirect('wall/' + userwhosewall);
				// data = {
				// 	success: true,
				// 	message: data
				// };
	   //    		res.send(JSON.stringify(data));
		   	}
		});

	// if not logged in
	} else {
		req.session.errMessage = "ERROR: cannot comment when not logged in";
		res.redirect('/');
	}
}

var deleteComment = function(req, res) {

	// get required parameters
	var userwhosewall = req.body.user;
	var post_datetime = req.body.datetime;
	var index = req.body.index;

	if (req.session.username) {

		db.deleteComment(userwhosewall, post_datetime, index, function(err, data) {
			if (err) {
				console.log(err);
				req.session.errMessage = "ERROR: " + err;
				res.redirect('wall/' + userwhosewall);
				// console.log(err);
				// data = {
				// 	success: false,
				// 	message: err
				// };
	   //    		res.send(JSON.stringify(data));
	    	} else {
	    		console.log('Comment was succesfully deleted');
				res.redirect('wall/' + userwhosewall);
				// data = {
				// 	success: true,
				// 	message: data
				// };
	   //    		res.send(JSON.stringify(data));
		   	}
		});

	// if not logged in
	} else {
		req.session.errMessage = "ERROR: cannot delete comment when not logged in";
		res.redirect('/');
	}
}

 var getHomepage = function(req, res) {

 	// get user from session username
 	var user = req.session.username

 	// check if user is logged in (not neccesarily to the same user as this wall)
 	if (req.session.username) {
	 	db.getUserHomepagePosts(user, function(err, data) {
	 		if (err) {
	 			req.session.errMessage = "ERROR" + err;
	 			res.redirect('/userpage');
	 		} else if (data) {
	 			res.render('homepage.ejs', {errMessage: null, posts: mergeSortTimes(data), user: user});
	 		} else {
	 			res.render('homepage.ejs', {errMessage: null, posts: [], user: user});
	 		}
	 	});

	 // Redirect if not logged in;
	 } else {
	 	req.session.errMessage = "ERROR: cannot access user wall while not logged in!";
	 	res.redirect('/');
	 }
 }

 var getUserWallPosts = function(req, res) {
 	var user = req.params.username;

 	db.getUserWallPosts(user, function(err, data) {
 		if (err) {
 			console.log(err);
			data = {
				message: err,
				posts: null
			};
      		res.send(JSON.stringify(data));
 		} else if (data) {
 			data = {
				message: null,
				posts: data
			};
      		res.send(JSON.stringify(data));
 		} else {
 			data = {
				message: null, 
				posts: data
			};
      		res.send(JSON.stringify(data));
 		}
 	});
 }

 var getHomepagePosts = function(req, res) {

 	// get user from session username
 	var user = req.session.username

 	db.getUserHomepagePosts(user, function(err, data) {
 		if (err) {
 			console.log(err);
			data = {
				message: err,
				posts: null
			};
      		res.send(JSON.stringify(data));
 		} else if (data) {
 			data = {
				message: null,
				posts: mergeSortTimes(data)
			};
      		res.send(JSON.stringify(data));
 		} else {
 			data = {
				message: null, 
				posts: data
			};
      		res.send(JSON.stringify(data));
 		}
 	});
 }

function mergeSortTimes(times) {

	// Base Case
	if (times.length == 1 || times.length == 0) {
		return times;
	}

	// Recursive Step
	var first_half = times.slice(0, Math.floor(times.length/2)); //from start to half
	var second_half = times.slice(Math.floor(times.length/2)); //from half to end

	// get sorted row
	first_half = mergeSortTimes(first_half);
	second_half = mergeSortTimes(second_half);

	var sorted = []
	var first_ptr = 0;
	var second_ptr = 0;

	while (first_ptr < first_half.length && second_ptr < second_half.length) {

		// if first ptr is GREATER than second ptr
		if (Date.parse(first_half[first_ptr].datetime.S) > Date.parse(second_half[second_ptr].datetime.S)) {

			// push element and increment pointer
			sorted.push(first_half[first_ptr]);
			first_ptr++

			// if ptr is now one less than length, add rest of other array to sorted
			if (first_ptr == first_half.length) {
				sorted = sorted.concat(second_half.slice(second_ptr));
			}
		} else {

			// push element and increment pointer
			sorted.push(second_half[second_ptr]);
			second_ptr++

			// if ptr is now one less than length, add rest of other array to sorted
			if (second_ptr == second_half.length) {
				sorted = sorted.concat(first_half.slice(first_ptr));
			}
		}
	}

	return sorted;
}

/*
 * Route name definitions go below here:
 */
var routes = { 
	get_main: getMain,
 	check_login: checkLogin,
 	sign_up: signUp,
  	create_account: createAccount,
	user_page: userPage,
	logout: logout,
	update_account: updateAccount,
	users: users,
	request_friend: requestFriend,
	remove_friend: removeFriend,
	friend_requests: friendRequests,
	accept_friend: acceptFriend,
	deny_friend: denyFriend,
	get_matching_users: getMatchingUsers,

/**
 * 
 * X17: Below here has been added since merge
 * 
 */

	get_user_wall: getUserWall,
	delete_post: deletePost,
	create_post: createPost,
	create_comment: createComment,
	delete_comment: deleteComment,
	get_homepage: getHomepage,
	get_user_wallposts: getUserWallPosts,
	get_homepage_posts: getHomepagePosts,
};

module.exports = routes;
