//setup Dependencies
var connect = require('connect')
    , express = require('express')
    , io = require('socket.io')
    , port = (process.env.PORT || 8081)
    , ipaddr = (process.env.IP || "0.0.0.0");
var twitterAPI = require('node-twitter-api');
var twitter = new twitterAPI({
    consumerKey: 'IUzTvHzTo32POgUeqOpNg',
    consumerSecret: 'rCR5qZuG2cXyZenmwopHrMfLhDcmX6kPz9qrRY1cA',
    callback: 'http://google.com'
});
var accessToken="24363434-7QmtgjZmU0xuu3OXVUC4QBUC4rkihLkyhWF7FD7V9";
var accessSecret="yigTevGhKJFF5Wf5fCzmk1Kjj9tx5xS25idGBJUFwRE";
//Setup Express
var server = express.createServer();
server.configure(function(){
    server.set('views', __dirname + '/views');
    server.set('view options', { layout: false });
    server.use(connect.bodyParser());
    server.use(express.cookieParser());
    server.use(express.session({ secret: "shhhhhhhhh!"}));
    server.use(connect.static(__dirname + '/static'));
    server.use(server.router);
});

//setup the errors
server.error(function(err, req, res, next){
    if (err instanceof NotFound) {
        res.render('404.jade', { locals: { 
                  title : '404 - Not Found'
                 ,description: ''
                 ,author: ''
                },status: 404 });
    } else {
        res.render('500.jade', { locals: { 
                  title : 'The Server Encountered an Error'
                 ,description: ''
                 ,author: ''
                 ,error: err 
                },status: 500 });
    }
});
server.listen(port,ipaddr);

//Setup Socket.IO
var io = io.listen(server);
io.sockets.on('connection', function(socket){
  console.log('Client Connected');
  socket.on('message', function(data){
    socket.broadcast.emit('server_message',data);
    socket.emit('server_message',data);
  });
  socket.on('disconnect', function(){
    console.log('Client Disconnected.');
  });
});


///////////////////////////////////////////
//              Routes                   //
///////////////////////////////////////////

/////// ADD ALL YOUR ROUTES HERE  /////////

server.get('/', function(req,res){
  res.render('index.jade', {
    locals : { 
              title : 'Hunt Twitter Favourites'
             ,description: 'Twitter Favourites'
             ,author: 'Hugh Stephens'
            }
  });
});

server.post('/submit',function(req,res) {
   console.log(req.body);
    var params = {screen_name: req.body.user, count:20};
    twitter.favorites("list",params,accessToken,accessSecret,function(error,data){
        if(error) {
            console.log('fail!');
            res.send(error);
        } else {
//            console.log(data);
        	res.setHeader('Content-disposition', 'attachment; filename=tweets.csv');
            res.writeHead(200, {
                'Content-Type': 'text/csv'
            });
            var s = 'Created_At,Text,Username,Name,Location,Description,profileURL,Followers,Following,Tweets,Favourites,Retweets\n';
        	data.forEach(function(row){
        		console.log(row);
        		s+= row.created_at+',"'+row.text+'","'+row.user.screen_name+'","'+row.user.name+'","'+row.user.location+'","'+
        				row.user.description+'","'+row.user.url+'","'+row.user.followers_count+'","'+row.user.friends_count+'","'+
        				row.user.statuses_count+'","'+row.favorite_count+'","'+row.retweet_count+'"\n';
        	});
        	res.end(s);	
        }
    })
});


//A Route for Creating a 500 Error (Useful to keep around)
server.get('/500', function(req, res){
    throw new Error('This is a 500 Error');
});

//The 404 Route (ALWAYS Keep this as the last route)
server.get('/*', function(req, res){
    throw new NotFound;
});

function NotFound(msg){
    this.name = 'NotFound';
    Error.call(this, msg);
    Error.captureStackTrace(this, arguments.callee);
}


console.log('Listening on http://0.0.0.0:' + port );
