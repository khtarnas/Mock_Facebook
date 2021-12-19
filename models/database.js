var AWS = require('aws-sdk');
AWS.config.update({region:'us-east-1'});
var db = new AWS.DynamoDB();

/**
 * A function to look up a user
 *
 * (Implementation Complete!)
 */
var myDB_lookupUser = function(username, password, callback) {
	console.log('Looking up: ' + username); 

	// Create params
  	var params = {
      KeyConditions: {
        username: {
          ComparisonOperator: 'EQ',
          AttributeValueList: [ { S: username } ]
        }
      },
      TableName: "users",
      AttributesToGet: [ 'password', 'firstname', 'lastname', 'email', 'affiliation', 'birthday', 'interests', 'online' ]				
  	};

	//query using params
	db.query(params, function(err, data) {
    	if (err || data.Items.length == 0) {
    			console.log("WHAT");
    			console.log(err);
      		callback(err, null);
    	} else {
      		callback(err, data.Items[0]);
    	}
  	});
}

/**
 * A function to add a user
 *
 * (Implementation Incomplete! -- TODO)
 */
var myDB_addUser = function(username, password, firstname, lastname, email, affiliation, birthday, interests, callback) {
	console.log('Adding user: ' + username); 
	
	var online = true;
	// user look up user to ensure we are not adding an already added username
	myDB_lookupUser(username, password, function(err, data) {
		if (err) {
      		callback(err, null);
    	} else if (data) { // If a user was found
			callback("ACCOUNT CREATION FAILED: A user with that username was found", null);
		} else { // No error, but no user found
	 		// Add the user, params;
			var params = {
		      Item: {
		      	username: { S: username },
		        password: { S: password },
				firstname: { S: firstname },
				lastname: { S: lastname },
				email: { S: email },
				affiliation: { S: affiliation },
				birthday: { S: birthday },
				interests: { SS: interests },
				online: { BOOL: online }
		      },
		      TableName: "users",
  			};

			// Put the user and their information in the table and return
		  	db.putItem(params, function(err, data){
		    	if (err) {
		      		callback(err, null);
		      		console.log("wiufhsdhfis");
		      		console.log(err);

		    	} else {
		      		callback(null, "success");
				}
		  });
		}
	});
}

/**
 * A function to update the given components of the user
 *
 * (Implementation Complete!)
 */
var myDB_updateUser = function(username, old_password, email, new_password, affiliation, interests, callback) {
	console.log('Updating components of User: ' + username); 
	
	// Create conditional params
	var params = {
	    TableName: "users",
	    Key: {
	        "username": { S: username }
	    },
	    UpdateExpression: "set #em = :em, #nw = :nw, #af = :af, #in = :in",
	    ConditionExpression: "password = :pw",
	    ExpressionAttributeValues: {
	        ":pw": { S: old_password },
			":em": { S: email },
			":nw": { S: new_password },
			":af": { S: affiliation },
			":in": { SS: interests }
	    },
		ExpressionAttributeNames: {
		    "#em": "email",
			"#nw": "password",
			"#af": "affiliation",
			"#in": "interests",
		  }
	};
	
	// Update params
	db.updateItem(params, function(err, data) {
	    if (err) {
	        callback(err, null);
	    } else {
	        callback(null, "success");
	    }
	});
}

/**
 * A function to update the online component of the user
 *
 * (Implementation Complete!)
 */
var myDB_changeOnline = function(username, password, online, callback) {
	console.log('User (' + username + ') online status being changed.'); 
	
	// Create conditional params
	var params = {
	    TableName: "users",
	    Key: {
	        "username": { S: username }
	    },
	    UpdateExpression: "set #on = :o",
	    ConditionExpression: "password = :pw",
	    ExpressionAttributeValues: {
	        ":pw": { S: password },
			":o": { BOOL: online }
	    },
		ExpressionAttributeNames: {
		    "#on": "online"
		  }
	};
	
	// Update params
	db.updateItem(params, function(err, data) {
	    if (err) {
	        callback(err, null);
	    } else {
	        callback(null, "success");
	    }
	});
}

/**
 * A function to update the online component of the user
 *
 * (Implementation Incomplete! -- TODO full implementation)
 */
var myDB_findFriends = function(username, callback) {
	console.log('Finding friends of ' + username); 
	
	// Create params
  	var params = {
      KeyConditions: {
        username: {
          ComparisonOperator: 'EQ',
          AttributeValueList: [ { S: username } ]
        }
      },
      TableName: "friends",
      AttributesToGet: [ 'friends' ]				
  	};

	//query using params
	db.query(params, function(err, data) {
    	if (err || data.Items.length == 0) {
      		callback(err, null);
    	} else {
      		callback(err, data.Items[0]);
    	}
  	});
}

var myDB_findUsersAndFriends = function(username, callback) {
	console.log('Finding users and friends of ' + username); 
	
  	// set the number of users you're looking for
	number_of_users = 30;
	
	// params and scan
	var params = {
    	Limit: number_of_users,
    	TableName: "users",
		FilterExpression: '#usrnm <> :usr',
        ExpressionAttributeValues: {
        	':usr': { "S": username }
        },
		ExpressionAttributeNames: {
		    "#usrnm": "username"
		}
  	};

	db.scan(params, function(err, data) {
		if (err) {
			console.log(err);
			callback(null, err, null);
		} else {
			
			// find friends within this callback function
			
			// Create params
		  	var friend_params = {
		      KeyConditions: {
		        username: {
		          ComparisonOperator: 'EQ',
		          AttributeValueList: [ { S: username } ]
		        }
		      },
		      TableName: "friends",
		      AttributesToGet: [ 'friends' ]				
		  	};
		
			//query for friends using params
			db.query(friend_params, function(err, friend_data) {
		    	if (err || friend_data.Items.length == 0) {
		      		callback(data.Items, err, null);
		    	} else {
					callback(data.Items, err, friend_data.Items[0]);
		    	}
		  	});
		}
	});
}

var myDB_sendFriendRequest = function(sender, receiver, callback) {
	console.log('Sending friend request from ' + sender + ' to ' + receiver); 
	
	// Create params
	var params = {
	    TableName: "friendship_requests",
	    Key: {
	        "receiver_username": { S: receiver }
	    },
	    UpdateExpression: "ADD #su :sndr",
	    ExpressionAttributeValues: {
	        ":sndr": {
			    "SS": [ sender ]
			}
	    },
		ExpressionAttributeNames: {
		    "#su": "sender_usernames"
		  }
	};
	
	// Update params
	db.updateItem(params, function(err, data) {
	    if (err) {
	        callback(err, null);
	    } else {
	        callback(null, "success");
	    }
	});
}

var myDB_removeFromFriends = function(current, removing, callback) {
	console.log('Removing ' + removing + ' from ' + current+ "'s friend list."); 
	
	// Create params
	var params = {
	    TableName: "friends",
	    Key: {
	        "username": { S: current }
	    },
	    UpdateExpression: "DELETE #fr :user",
	    ExpressionAttributeValues: {
	        ":user": {
			    "SS": [ removing ]
			}
	    },
		ExpressionAttributeNames: {
		    "#fr": "friends"
		  }
	};
	
	// Update params
	db.updateItem(params, function(err, data) {
	    if (err) {
	        callback(err, null);
	    } else {
	        callback(null, "success");
	    }
	});
}

var myDB_getFriendRequests = function(username, callback) {
	console.log('Finding friends requests of ' + username); 
	
	// Create params
  	var params = {
      KeyConditions: {
        receiver_username: {
          ComparisonOperator: 'EQ',
          AttributeValueList: [ { S: username } ]
        }
      },
      TableName: "friendship_requests",
      AttributesToGet: [ 'sender_usernames' ]				
  	};

	//query using params
	db.query(params, function(err, data) {
    	if (err || data.Items.length == 0) {
      		callback(err, null);
    	} else {
			console.log(data.Items[0]);
      		callback(err, data.Items[0]);
    	}
  	});
}

myDB_removeFriendRequest = function(current, removing, callback) {
	console.log('Removing ' + removing + ' from ' + current+ "'s friend request list."); 
	
	// Create params
	var params = {
	    TableName: "friendship_requests",
	    Key: {
	        "receiver_username": { S: current }
	    },
	    UpdateExpression: "DELETE #fr :user",
	    ExpressionAttributeValues: {
	        ":user": {
			    "SS": [ removing ]
			}
	    },
		ExpressionAttributeNames: {
		    "#fr": "sender_usernames"
		  }
	};
	
	// Update params
	db.updateItem(params, function(err, data) {
	    if (err) {
	        callback(err, null);
	    } else {
	        callback(null, "success");
	    }
	});
}

myDB_acceptFriendRequest = function(current, accepting, callback) {
	console.log("User " + current + " accepting user " + accepting);
	
	// Create params
	var params = {
	    TableName: "friends",
	    Key: {
	        "username": { S: current }
	    },
	    UpdateExpression: "ADD #fr :user",
	    ExpressionAttributeValues: {
	        ":user": {
			    "SS": [ accepting ]
			}
	    },
		ExpressionAttributeNames: {
		    "#fr": "friends"
		  }
	};
	
	// Remove friend request and add the friend
	myDB_removeFriendRequest(current, accepting, function(err, data) {
		if (err) {
			callback(err, null);
		} else {
			db.updateItem(params, function(err, data) {
			    if (err) {
			        callback(err, null);
			    } else {
				
					// create params (the friendship is mutual, so add it to the other person's list now)
					var params = {
					    TableName: "friends",
					    Key: {
					        "username": { S: accepting }
					    },
					    UpdateExpression: "ADD #fr :user",
					    ExpressionAttributeValues: {
					        ":user": {
							    "SS": [ current ]
							}
					    },
						ExpressionAttributeNames: {
						    "#fr": "friends"
						  }
					};
					
					db.updateItem(params, function(err, data) {
					    if (err) {
					        callback(err, null);
					    } else {
					        callback(null, "success");
						}
					});
			    }
			});
		}
	})
}

var myDB_matchUserStem = function(stem, callback) {
	
	// set the number of users you're looking for
	number_of_matches = 5;
	
	// params and scan
	var params = {
    	Limit: number_of_matches,
    	TableName: "users",
		FilterExpression: 'contains(#usrnm, :stem)',
        ExpressionAttributeValues: {
        	':stem': { "S": stem }
        },
		ExpressionAttributeNames: {
		    "#usrnm": "username"
		}
  	};

	db.scan(params, function(err, data) {
    	if (err || data.Items.length == 0) {
      		callback(err, null);
    	} else {
      		callback(err, data.Items[0]);
    	}
  	});
}

/**
 * 
 * X17: Below here has been added since merge
 * 
 */

var myDB_getUserWallPosts = function(username, callback) {
	console.log("Getting posts on " + username + "'s wall");

	// Create parameters of query
	var params = {
		TableName: "posts",
		KeyConditions: {
			user_wall: {
				ComparisonOperator: 'EQ',
				AttributeValueList: [ { S: username }]
			}
		}, 
		ScanIndexForward: false,    // true = ascending, false = descending
	} // todo; do we need to set the attributes to get

	//query using given parameters
	db.query(params, function(err, data) {
    	if (err || data.Items.length == 0) {
      		callback(err, null);
    	} else {
      		callback(err, data.Items);
    	}
  	});
}

var myDB_deletePost = function(user, datetime, callback) {
	console.log("Removing post that was posted at " + datetime + " on " + user + "'s page.");

	var params = {
    TableName: "posts",
    Key:{
        "user_wall": {S: user},
        "datetime": {S: datetime}
    }
	};

	db.deleteItem(params, function(err, data) {
	    if (err) {
	        callback(err, null);
	    } else {
	        callback(null, "success");
	    }
	});
}

var myDB_createPost = function(userwhosewall, poster, content, datetime, comments, callback) {
	console.log("Creating post that was posted at " + datetime + " on " + userwhosewall + "'s page by " + poster + ".");

	// params + put item
	var params = {
    Item: {
	    user_wall: { S: userwhosewall },
	    poster: { S: poster },
	    datetime: { S: datetime },
			post_content: { S: content },
			comments: { L: [] },
    },
    TableName: "posts",
		};

	db.putItem(params, function(err, data){
  	if (err) {
  		console.log(err);
  		callback(err, null);
  	} else {
  		callback(null, "success");
		}
  });
}

var myDB_createComment = function(userwhosewall, post_datetime, commenter, content, datetime, callback) {
	console.log("Creating comment that was commented at " + datetime + " by " + commenter + ".");

	// params + update item
	var params = {
	    TableName: "posts",
	    Key: {
	        "user_wall": { S: userwhosewall },
	        "datetime": { S: post_datetime },
	    },
	    UpdateExpression: "set #cmts = list_append(if_not_exists(#cmts, :empty), :cmt)",
	    ExpressionAttributeValues: {
	      ":cmt": { 
	      	"L" : [ {
				    "M": {
				    	"commenter": { "S" : commenter },
				    	"comment_content": { "S" : content },
				    	"comment_datetime": { "S" : datetime },
				    }
				  } ]
				},
				":empty": { 
	      	"L" : []
				}
	    },
		ExpressionAttributeNames: {
		    "#cmts": "comments"
		  }
	};

  db.updateItem(params, function(err, data){
    if (err) {
    	console.log(err);
  		callback(err, null);
  	} else {
  		callback(null, "success");	
		}
  });
}

var myDB_deleteComment = function(userwhosewall, post_datetime, index, callback) {
	console.log("Deleting comment at position " + index +
		" on post that was posted at " + post_datetime + " on " + userwhosewall + "'s wall.");

	// params + update item
	var params = {
    TableName: "posts",
    Key: {
        "user_wall": { S: userwhosewall },
        "datetime": { S: post_datetime },
    },
	  UpdateExpression: "REMOVE #cmts[" + index + "]",
		ExpressionAttributeNames: {
	    "#cmts": "comments"
	  }
	};

  db.updateItem(params, function(err, data){
    if (err) {
    	console.log(err);
  		callback(err, null);
  	} else {
  		callback(null, "success");	
		}
  });
}

var myDB_getUserHomepagePosts = function(user, callback) {
	console.log("Getting all posts from friends of " + user + ".");

	// First get all the friends of the user
	myDB_findFriends(user, function(err, data) {
		if (err) {
			console.log(err);
			callback(err, null);

		// if there was no error, then get posts associated with these friends
		} else {

			// get list of users we want to get posts from
			friends = data.friends.SS;
			friends.push(user);

			// for each friend add it to a map (mapped by an indexed key) and add its key to a list
			var friend_mapping = {};
			var friend_keys = [];

			for (var i = 0; i < friends.length; i++) {
				var temp = ":frd" + i;
			  friend_mapping[temp] = { "S" : friends[i] };
			  friend_keys.push(temp);
			}

			var params = {
		    TableName : "posts",
		    FilterExpression : "#pstr IN (" + friend_keys.toString() + ")",
		    ExpressionAttributeValues : friend_mapping,
		    ExpressionAttributeNames: {
			    "#pstr": "poster"
			  }
			};

			// scan and return results
			db.scan(params, function(err, data) {
				if (err) {
		    	console.log(err);
		  		callback(err, null);
		  	} else {
		  		callback(null, data.Items);	
				}
			});
		} 
	});
}

/* We define an object with one field for each method. For instance, below we have
   a 'lookup' field, which is set to the myDB_lookup function. In routes.js, we can
   then invoke db.lookup(...), and that call will be routed to myDB_lookup(...). */

var database = {
	lookupUser: myDB_lookupUser,
	addUser: myDB_addUser,
	updateUser: myDB_updateUser,
	changeOnline: myDB_changeOnline,
	findFriends: myDB_findFriends,
	findUsersAndFriends: myDB_findUsersAndFriends,
	sendFriendRequest: myDB_sendFriendRequest,
	removeFromFriends: myDB_removeFromFriends,
	getFriendRequests: myDB_getFriendRequests,
	acceptFriendRequest: myDB_acceptFriendRequest,
	removeFriendRequest: myDB_removeFriendRequest,
	matchUserStem: myDB_matchUserStem,

/**
 * 
 * X17: Below here has been added since merge
 * 
 */
 getUserWallPosts: myDB_getUserWallPosts,
 deletePost: myDB_deletePost,
 createPost: myDB_createPost,
 createComment: myDB_createComment,
 deleteComment: myDB_deleteComment,
 getUserHomepagePosts: myDB_getUserHomepagePosts,

};

module.exports = database;
                                        