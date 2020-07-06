var express = require('express'); //express 모듈요청
var app = express(); //app을 express 프레임워크로 킴
const ejs = require("ejs"); //ejs 모듈 요청

var http = require('http');
var path = require('path');
var static = require('serve-static');

var mysql = require('mysql');

const bodyPaser = require('body-parser');//POST로 받기위해 body-parser 요청
const bodyParser = require("body-parser");

app.set("view engine","ejs"); //app에 view engine을 설치. ejs를 템플릿으로
app.use(express.static(__dirname+'/')); //view 폴더 경로는 프로젝트 폴더.(__dirname이 폴더위치)
// app.use(express.static('public'));
// app.use(static(path.join(__dirname, '/')));

app.use(express.urlencoded({extended:false})); //url인코딩 안함
app.use(express.json());//JSON 타입으로 파싱하게 설정

app.set('port', process.env.PORT || 8080);

///////////////////////////////////////////////////////////////////// 

app.get('/',function(req,res){
    res.render('index',{});
});
app.get('/search',function(req,res){
    var request = req.query.searchKey;
    // console.log(request);
    res.render('search',{request});
});
app.get('/mypage',function(req,res){
    res.render('mypage',{});
});
app.get('/join',function(req,res){
    res.render('join',{});
});

//<!------------------- 로그인 ------------------->//
app.get('/login',function(req,res){
    res.render('login',{});
});
app.post('/login',function(req,res){
    res.send("이 곳에서 로그인정보값을 DB에 저장하시면됩니다.");
});


app.get('/board',function(req,res){
    res.render('board',{});
});
app.get('/test',function(req,res){
    res.render('test',{});
});
app.get('/test1',function(req,res){
    res.render('test1',{});
});
app.post('/join2',function(req,res){
    var result = req.body
    // console.log(result);
    res.render('join2',{result});
});
app.post('/submit',function(req,res){
    var request = req.body;
    var t = typeof(request.major)
    // console.log(request);
    console.log(t);

    // console.log(request.major[val1);
    res.send(request);
});








http.createServer(app).listen(app.get('port'),function(){
    console.log('server start...' + app.get('port'));
});//서버로 구동하는 것