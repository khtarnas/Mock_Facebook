/* Initializing the database and setting settings. */

var AWS = require('aws-sdk');
AWS.config.update({region:'us-east-1'});
var db = new AWS.DynamoDB();
var async = require('async');

/* The function below checks whether a table with the above name exists, and if not,
   it creates such a table with a hashkey called 'keyword', which is a string. 
   Notice that we don't have to specify the additional columns in the schema; 
   we can just add them later. (DynamoDB is not a relational database!) */

var initTable = function(tableName, keywordName, callback) {
  db.listTables(function(err, data) {
    if (err)  {
      console.log(err, err.stack);
      callback('Error when listing tables: '+err, null);
    } else {
      console.log("Connected to AWS DynamoDB");
          
      var tables = data.TableNames.toString().split(",");
      console.log("Tables in DynamoDB: " + tables);
      if (tables.indexOf(tableName) == -1) {
        console.log("Creating new table '"+tableName+"'");

        var params = {
            AttributeDefinitions: 
              [ 
                {
                  AttributeName: keywordName,
                  AttributeType: 'S'
                }
              ],
            KeySchema: 
              [ 
                {
                  AttributeName: keywordName,
                  KeyType: 'HASH'
                }
              ],
            ProvisionedThroughput: { 
              ReadCapacityUnits: 20,       // DANGER: Don't increase this too much; stay within the free tier!
              WriteCapacityUnits: 20       // DANGER: Don't increase this too much; stay within the free tier!
            },
            TableName: tableName
        };

        db.createTable(params, function(err, data) {
          if (err) {
            console.log(err)
            callback('Error while creating table ' + tableName + ': ' + err, null);
          }
          else {
            console.log("Table is being created; waiting for 20 seconds...");
            setTimeout(function() {
              console.log("Success");
              callback(null, 'Success');
            }, 20000);
          }
        });
      } else {
        console.log("Table "+tableName+" already exists");
        callback(null, 'Success');
      }
    }
  });
}

/**
 * 
 * Below here was added Version X17
 *  (just this one function)
 */

/* The function below checks whether a table with the above name exists, and if not,
   it creates such a table with a hashkey called 'keyword', which is a string. 
   Notice that we don't have to specify the additional columns in the schema; 
   we can just add them later. (DynamoDB is not a relational database!) 

   + This one takes in a sortKey as well! */
var initTableWithSortKey = function(tableName, keywordName, sortKey, callback) {
  db.listTables(function(err, data) {
    if (err)  {
      console.log(err, err.stack);
      callback('Error when listing tables: '+err, null);
    } else {
      console.log("Connected to AWS DynamoDB");
          
      var tables = data.TableNames.toString().split(",");
      console.log("Tables in DynamoDB: " + tables);
      if (tables.indexOf(tableName) == -1) {
        console.log("Creating new table '"+tableName+"'");

        var params = {
            AttributeDefinitions: 
              [ 
                {
                  AttributeName: keywordName,
                  AttributeType: 'S'
                },
                { AttributeName: sortKey,
                  AttributeType: 'S'
                }
              ],
            KeySchema: 
              [ 
                {
                  AttributeName: keywordName,
                  KeyType: 'HASH'
                },
                {
                  AttributeName: sortKey,
                  KeyType: 'RANGE'
                }
              ],
            ProvisionedThroughput: { 
              ReadCapacityUnits: 20,       // DANGER: Don't increase this too much; stay within the free tier!
              WriteCapacityUnits: 20       // DANGER: Don't increase this too much; stay within the free tier!
            },
            TableName: tableName
        };

        db.createTable(params, function(err, data) {
          if (err) {
            console.log(err)
            callback('Error while creating table ' + tableName + ': ' + err, null);
          }
          else {
            console.log("Table is being created; waiting for 20 seconds...");
            setTimeout(function() {
              console.log("Success");
              callback(null, 'Success');
            }, 20000);
          }
        });
      } else {
        console.log("Table "+tableName+" already exists");
        callback(null, 'Success');
      }
    }
  });
}

/* This function puts an item into the table. Use it by inputting the given tables name,
and three lists of equal length one with the column names ("titles"), one with the 
associated values of the item to be added to the table ("values"), and one with the
associated DynamoDB dataTypes ("types"). Don't forget to also add a callback function.
Examples of using this function are below.*/

var putIntoTable = function(tableName, titles, values, types, callback) {
	
	// Create a dictionary of items from the given inputs
  	var items = {};
	if (titles.length != values.length || titles.length != types.length || values.length != types.length ) {
		throw "Make sure that your inputs are valid (i.e. three lists of equal length).";
	}
	for (var i = 0; i < titles.length; i++) {
		var temp = {};
		temp[types[i]] = values[i];
		items[titles[i]] =  temp;
	}
	
	// Create the parameters from items
	var params = {
      Item: items,
      TableName: tableName,
      ReturnValues: 'NONE'
  };

	// Put the item into the table
  db.putItem(params, function(err, data){
    if (err)
      callback(err)
    else
      callback(null, 'Success')
  });
}

/* This is the code that actually runs first when you run this file with Node.
   It calls initTable and then, once that finishes, it uploads all the words
   in parallel and waits for all the uploads to complete (async.forEach). 

   To create a new table and add the items you want follow the structure of 
   the already created tables below. */

// User table
var userDBname = "users";
var userKeyword = "username";
var userColumns = [userKeyword, "password", "firstname", "lastname", "email", "affiliation", "birthday", "interests", "online"];
var userItems = [ ["joey123", "H7nj*kl12", "Joseph", "Smith", "jsmith@upenn.edu", "None", "2001-07-23", ["food", "soccer", "video games"], false],
["sammy", "b1g0n3", "Samantha", "Jorja", "sj@upenn.edu", "Music Industry", "1998-01-13", ["swimming", "boats"], false],
["monk", "bananas4u", "Monkey", "Luffy", "luffy@upenn.edu", "One Piece", "1999-11-02", ["pirates", "kings", "rubber"], false],
["mario", "peach4u", "Mario", "Mario", "mario@gmail.com", "Mario Party", "1989-03-10", ["peach", "bowser", "plumbing"], false],
["mario2", "daisey>peach", "Luigi", "mario", "mario2@gmail.com", "Mario Party", "1991-05-05", ["daisey", "plumbing", "mario"], false],
["barneyrules", "waitforit", "Barney", "Stinston", "barns@law.org", "HIMYM", "1984-02-29", ["girls", "bars", "suits"], false],
["khtarnas", "passward", "Hokua", "Tarnas", "khtarnas@sas.upenn.edu", "Penn", "2000-12-20", ["nets212", "music", "sleep"], false],
["ryanhs", "123pass", "Ryan", "Hsing-Smith", "ryanhs@seas.upenn.edu", "Penn", "2001-01-13", ["nets212"], false],
["donghee1", "dogsname", "Dong Hee", "Kim", "donghee1@seas.upenn.edu", "Penn", "1999-04-13", ["nets212"], false],
["ketanm", "idk", "Ketan", "Mandava", "ketanm@seas.upenn.edu", "Penn", "2000-10-30", ["net212"], false],

["liam123", "password", "Liam", "Paul", "paul@upenn.edu", "Penn", "1999-11-02", ["pirates", "kings", "rubber"], false],
["noah123", "password", "Noah", "Hayes", "hayes@upenn.edu", "Penn", "1999-11-02", ["pirates", "kings", "rubber"], false],
["oliver123", "password", "Oliver", "McBride", "mcbride@upenn.edu", "Penn", "1999-11-02", ["pirates", "kings", "rubber"], false],
["lucas123", "password", "Lucas", "Welch", "welch@upenn.edu", "Penn", "1999-11-02", ["pirates", "kings", "rubber"], false],
["olivia123", "password", "Olivia", "Ball", "olivia@upenn.edu", "Penn", "1999-11-02", ["pirates", "kings", "rubber"], false],
["emma123", "password", "Emma", "Moreno", "moreno@upenn.edu", "Penn", "1999-11-02", ["pirates", "kings", "rubber"], false],
["sophia123", "password", "Sophia", "Ray", "ray@upenn.edu", "Penn", "1999-11-02", ["pirates", "kings", "rubber"], false],
["pennguy1", "password", "Jeremy", "Perry", "perry@upenn.edu", "Penn", "1999-11-02", ["pirates", "kings", "rubber"], false],
["pennguy2", "password", "Jackson", "Goddard", "goddard@upenn.edu", "Penn", "1999-11-02", ["pirates", "kings", "rubber"], false],
["notpennguy3", "password", "Jefferson", "McCarthy", "mccarthy@upenn.edu", "Drexel", "1999-11-02", ["pirates", "kings", "rubber"], false],
["lucypenn", "password", "Jemma", "Ryan", "ryan@upenn.edu", "Penn", "1999-11-02", ["pirates", "kings", "rubber"], false],
["darcydrexel", "password", "Darcy", "Mendoza", "mendoza@drexel.edu", "Drexel", "1999-11-02", ["pirates", "kings", "rubber"], false],
["oliver321", "password", "Olivander", "Richards", "richards@upenn.edu", "Penn", "1999-11-02", ["pirates", "kings", "rubber"], false],
["elaineS", "password", "Elaine", "Robbins", "robbins@upenn.edu", "Penn", "1999-11-02", ["pirates", "kings", "rubber"], false],
["jerryS", "password", "Jerry", "Malone", "malone@upenn.edu", "Penn", "1999-11-02", ["pirates", "kings", "rubber"], false],
["frodoB", "password", "Frodo", "Baggins", "baggins@lotr.edu", "LOTR", "1999-11-02", ["potatoes"], false],
["samG", "password", "Samwise", "Gamgee", "gamgee@lotr.edu", "LOTR", "1999-11-02", ["potatoes"], false],
["pippinT", "password", "Pippin", "Took", "took@lotr.edu", "LOTR", "1999-11-02", ["potatoes"], false],
["merryB", "password", "Merry", "Brandybuck", "brandybuck@lotr.edu", "LOTR", "1999-11-02", ["potatoes"], false]
];
var userDataTypes = ["S", "S", "S", "S", "S", "S", "S", "SS", "BOOL"];

initTable(userDBname, userKeyword, function(err, data) {
  if (err)
    console.log("Error while initializing table: " + err);
  else {
    async.forEach(userItems, function (item, callback) {
      console.log("Uploading: " + item[0]);
      putIntoTable(userDBname, userColumns, item, userDataTypes, function(err, data) {
        if (err)
          console.log("Oops, error when adding " + item[0] + ": " + err);
      });
    }, function() { console.log("Upload complete")});
  }
});

// Friendship table
var friendshipDBname = "friends";
var friendshipKeyword = "username";
var friendshipColumns = [friendshipKeyword, "friends"];
var friendshipItems = [ 

// Friend Network #1
["joey123", [ "sammy", "monk" ] ],
["sammy", [ "joey123", "mario2" ] ],
["monk", [ "joey123", "khtarnas" ] ],
["mario", [ "ketanm" ] ],
["mario2", [ "sammy", "donghee1", "ryanhs" ] ],
["khtarnas", [ "ketanm", "donghee1", "ryanhs", "monk" ] ],
["ryanhs", [ "khtarnas", "ketanm", "donghee1", "mario2" ] ],
["donghee1", [ "ryanhs", "khtarnas", "ketanm", "mario2" ] ],
["ketanm", [ "donghee1", "ryanhs", "khtarnas", "mario" ] ],

// Friend Network #2
["liam123", ["noah123", "oliver123", "lucas123", "olivia123", "emma123", "sophia123"]],
["lucas123", ["noah123", "liam123", "pennguy1", "pennguy2", "notpennguy3"]],
["pennguy1", ["lucas123"]],
["pennguy2", ["lucas123"]],
["notpennguy3", ["lucas123", "lucypenn"]],
["noah123", ["liam123", "lucas123", "lucypenn", "darcydrexel"]],
["lucypenn", ["notpennguy3", "noah123"]],
["darcydrexel", ["noah123"]],
["sophia123", ["liam123"]],
["emma123", ["liam123"]],
["olivia123", ["liam123", "jerryS", "elaineS"]],
["jerryS", ["olivia123", "elaineS", "frodoB"]],
["elaineS", ["olivia123", "jerryS", "frodoB"]],
["oliver123", ["liam123", "oliver321"]],
["oliver321", ["oliver123", "frodoB"]],
["frodoB", ["oliver321", "elaineS", "jerryS", "samG", "pippinT", "merryB"]],
["samG", ["frodoB", "pippinT", "merryB"]],
["pippinT", ["frodoB", "samG", "merryB"]],
["merryB", ["frodoB", "pippinT", "samG"]]

];
var friendshipDataTypes = ["S", "SS"];

initTable(friendshipDBname, friendshipKeyword, function(err, data) {
  if (err)
    console.log("Error while initializing table: " + err);
  else {
    async.forEach(friendshipItems, function (item, callback) {
      console.log("Uploading: " + item[0]);
      putIntoTable(friendshipDBname, friendshipColumns, item, friendshipDataTypes, function(err, data) {
        if (err)
          console.log("Oops, error when adding " + item[0] + ": " + err);
      });
    }, function() { console.log("Upload complete")});
  }
});

// Friendship request table
var frequestDBname = "friendship_requests";
var frequestKeyword = "receiver_username";
var frequestColumns = [frequestKeyword, "sender_usernames"];
var frequestItems = [ ["joey123", [ "barneyrules", "ketanm" ] ],
["monk", [ "barneyrules", "donghee1" ] ],
["mario", [ "barnyerules" ] ],
["barneyrules", ["khtarnas"] ],
["ryanhs", [ "mario", "monk" ] ],
["donghee1", [ "mario", "barneyrules" ] ] ];
var frequestDataTypes = ["S", "SS"];

initTable(frequestDBname, frequestKeyword, function(err, data) {
  if (err)
    console.log("Error while initializing table: " + err);
  else {
    async.forEach(frequestItems, function (item, callback) {
      console.log("Uploading: " + item[0]);
      putIntoTable(frequestDBname, frequestColumns, item, frequestDataTypes, function(err, data) {
        if (err)
          console.log("Oops, error when adding " + item[0] + ": " + err);
      });
    }, function() { console.log("Upload complete")});
  }
});

/**
 * 
 * Below here was added Version X17
 * 
 */

 // Posts table
var postDBname = "posts";
var postKeyword = "user_wall";
var postColumns = [postKeyword, "datetime", "poster", "post_content", "comments"];
var postItems = [ ["ryanhs", "Sun Dec 19 2021 01:03:34 GMT-0500 (Eastern Standard Time)", "khtarnas", "Hi.", [] ],
["monk", "Sat Dec 18 2021 08:56:17 GMT-0500 (Eastern Standard Time)", "monk", "This is my wall!", [] ],
["monk", "Fri Dec 16 2021 05:21:17 GMT-0500 (Eastern Standard Time)", "khtarnas", "What's this??", [] ],
["monk", "Fri Dec 17 2021 08:26:17 GMT-0500 (Eastern Standard Time)", "ryanhs", "Posting!!!", [] ],
["monk", "Sat Dec 18 2021 02:19:17 GMT-0500 (Eastern Standard Time)", "ketanm", "oh jeez.", [] ],
["monk", "Sun Dec 19 2021 11:57:54 GMT-0500 (Eastern Standard Time)", "donghee1", ".", [] ] 
];
var postDataTypes = [ "S", "S", "S", "S", "L" ]

initTableWithSortKey(postDBname, postKeyword, postColumns[1], function(err, data) {
  if (err)
    console.log("Error while initializing table: " + err);
  else {
    async.forEach(postItems, function (item, callback) {
      console.log("Uploading: " + item[0]);
      putIntoTable(postDBname, postColumns, item, postDataTypes, function(err, data) {
        if (err)
          console.log("Oops, error when adding " + item[0] + ": " + err);
      });
    }, function() { console.log("Upload complete")});
  }
});

/**
To create a new table and fill it with example item(s):

1. copy and paste any of the above
2. change the comment-label so we know what table its for
3. change all the variables (DBname through dataTypes) to what they should be
	a. DBname = name of this table
	b. keyword = the keyword that the table will index on
	c. columns = all the column headers (the first should always be "keyword")
	d. items = a list of lists that should each be the same length as "columns" and have all the corresponding information
	e. dataTypes = the DynamoDB data types associated with each column (e.g. S, N, SS, BOOL, etc.)*/
