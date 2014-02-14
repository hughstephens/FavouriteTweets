//setup Dependencies
var connect = require('connect')
    , express = require('express')
    , io = require('socket.io')
    , port = (process.env.PORT || 8081)
    , ipaddr = (process.env.IP || "0.0.0.0");;
var twitterAPI = require('node-twitter-api');
var twitter = new twitterAPI({
    consumerKey: 'IUzTvHzTo32POgUeqOpNg',
    consumerSecret: 'rCR5qZuG2cXyZenmwopHrMfLhDcmX6kPz9qrRY1cA',
    callback: 'http://google.com'
});
var jsoncsv=require('jsoncsv');
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
    var params = {screen_name: req.body.user, count:200};
    twitter.favorites("list",params,accessToken,accessSecret,function(error,data){
        if(error) {
            console.log('fail!');
            res.send(error);
        } else {
            res.send(data);
            var data2=JSON.parse(data);
// TODO SAVE ONLY THESE FIELDS AS A FLAT FILE
//            var created_at = data2.created_at,
//                text = data2.text,
//                username = data2.user.screen_name,
//                realname = data2.user.name,
//                location = data2.user.location,
//                userdesc = data2.user.description,
//                userURL = data2.user.url,
//                followers = data2.user.followers_count,
//                following = data2.user.friends_count,
//                tweets = data2.user.statuses_count,
//                favCount = data2.favorite_count,
//                rtCount = data2.retweet_count;
//            var content = {created_at: created_at, text: text, username:username,realname:realname,location:location,userdesc:userdesc,userURL:userURL,followers:followers,following:following,tweets:tweets,favCount:favCount,rtCount:rtCount};
// TODO SOMETHING THAT SAVES 'CONTENT' AS A CSV AND SENDS TO RESPONSE AS A FILE
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
