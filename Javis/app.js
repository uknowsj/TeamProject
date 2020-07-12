const express = require('express'); //express 모듈요청
const app = express(); //app을 express 프레임워크로 킴
const ejs = require("ejs"); //ejs 모듈 요청

var http = require('http');
var path = require('path');
var static = require('serve-static');

const session = require('express-session');//로그인 유지위해 express-session 이용

var mysql = require('mysql');

const bodyPaser = require('body-parser');//POST로 받기위해 body-parser 요청
const bodyParser = require("body-parser");

var userId;
app.set("view engine","ejs"); //app에 view engine을 설치. ejs를 템플릿으로
app.use(express.static(__dirname+'/')); //view 폴더 경로는 프로젝트 폴더.(__dirname이 폴더위치)
// app.use(express.static('public'));
// app.use(static(path.join(__dirname, '/')));

app.use(express.urlencoded({extended:false})); //url인코딩 안함
app.use(express.json());//JSON 타입으로 파싱하게 설정

app.set('port', process.env.PORT || 8080);

app.use(session({ //session 초기화
    secret: 'ambc@!vsmkv#!&*!#EDNAnsv#!$()_*#@',
    resave: false,
    saveUninitialized: true
}));

/////////////////////////// DB 연동 ///////////////////////////
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '0000',
    database : 'project',
    multipleStatements: true//다중쿼리
});
    
connection.connect();

/////////////////////////// 로그인&회원가입 ///////////////////////////
const users2 = [ //이용자 정보 객체배열로 저장
    {
        user_id: 'example_id',
        user_nickname: 'example_nick',
        user_pwd: '1q2w3e4r'
    }
]

const findUser = (user_id, user_pwd) => {// id와 password가 일치하는 유저 찾는 함수, 없으면 undefined 반환
    return users2.find( v => (v.user_id === user_id && v.user_pwd === user_pwd) );
}
const findUserIndex = (user_id, user_pwd) => {// 일치하는 유저의 index값(유니크) 반환
    return users2.findIndex( v => (v.user_id === user_id && v.user_pwd === user_pwd) );
}

//<!------------------- 로그인 ------------------->//
app.get('/login', (req, res) => {
    const sess = req.session; // 세션 객체에 접근
    var user_id;
    var user_nickname;
    var user_pwd;
    
    connection.query('SELECT * FROM user_info', function (error, results, fields) {
        if (error) {
            console.log(error);
        }
        //현재 user 테이블 정보 가져와서 array에 객체로 저장하여 users2에 객체배열로 저장
        for(var key in results){ 
            var array={};
            array["user_id"]=results[key].id;
            array["user_nickname"]=results[key].nickname;
            array["user_pwd"]=results[key].password;
            users2.push(array);
        }
    });
    res.render('login', {
        nickname: sess.hasOwnProperty('user_uid') ? users2[sess.user_uid]['user_nickname'] : ''
    }); // login.ejs 랜더링
  });
  

  app.post('/login', (req, res) => {
    const body = req.body; // body-parser 사용
    if( findUser( body.user_id, body.user_pw ) ) {
    // 해당유저가 존재한다면
        // userid = body.user_id;//전역변수에 저장
        req.session.user_uid = findUserIndex( body.user_id, body.user_pw ); //유니크한 값 유저 색인 값 저장
        userId=body.user_id;
        res.redirect('/');
    } else {
        res.send("일치하지 않습니다.");
    }
  });

  app.get('/logout', (req, res) => {
    delete req.session.user_uid;
    res.redirect('/');
  });



///////////////////////////////////////////////////////////////////// 

app.get('/',function(req,res){
    const sess = req.session; // 세션 객체에 접근
    res.render('index', {
        nickname: sess.hasOwnProperty('user_uid') ? users2[sess.user_uid]['user_nickname'] : ''
    });
});

app.get('/search',function(req,res){
    const sess = req.session; // 세션 객체에 접근
    var request = req.query.searchKey;
    var sql = 'SELECT name, type from certificate_list WHERE name LIKE "%' + request+ '%";';
    connection.query(sql, function (error, results, fields) {
        if (error) {
            console.log(error);
        }
        res.render('search', {
            nickname: sess.hasOwnProperty('user_uid') ? users2[sess.user_uid]['user_nickname'] : '',
            request, result : results
        });
        });
});



app.get('/board',function(req,res){
    const sess = req.session; // 세션 객체에 접근
    res.render('board', {
        nickname: sess.hasOwnProperty('user_uid') ? users2[sess.user_uid]['user_nickname'] : ''
    });
});

app.post('/userInfo',function(req,res){
    const sess = req.session; // 세션 객체에 접근
    var sql='SELECT certifi,COUNT(certifi) as cnt FROM certiView WHERE medium_major=(SELECT medium_major FROM major JOIN user_info ON user_info.major=major.no WHERE user_info.id="'+userId+'")'+'GROUP BY (certifi)';
    connection.query(sql, function (error, results, fields) {
        if (error) {
            console.log(error);
        }
    res.json(results);
    });
});

app.post('/mypage',function(req,res){
    const sess = req.session; // 세션 객체에 접근
    res.render('mypage',{
        user_id: sess.hasOwnProperty('user_uid') ? users2[sess.user_uid]['user_id'] : '',
        nickname: sess.hasOwnProperty('user_uid') ? users2[sess.user_uid]['user_nickname'] : ''
    });
});



app.get('/join',function(req,res){
    const sess = req.session; // 세션 객체에 접근
    res.render('join', {nickname: sess.hasOwnProperty('user_uid') ? users2[sess.user_uid]['user_nickname'] : ''});
});
app.post('/join2',function(req,res){
    const sess = req.session; // 세션 객체에 접근
    var result = req.body
    // console.log(result);
    res.render('join2',{
        nickname: sess.hasOwnProperty('user_uid') ? users2[sess.user_uid]['user_nickname'] : '',
        result
    });
});

app.get('/majorInfoGet',function(req,res){
    const sess = req.session; // 세션 객체에 접근
    connection.query('SELECT * FROM major', function (error, results, fields) {
        if (error) {
            console.log(error);
        }
    res.json(results);

        //현재 user 테이블 정보 가져와서 array에 객체로 저장하여 users2에 객체배열로 저장
    });
});
app.get('/certiInfoGet',function(req,res){
    var carte = req.query.carte;
    if(carte=="카테고리"){
        carte="";
    }
    
    connection.query('SELECT * from certificate_list where type LIKE "%'+carte+'%"', function (error, results, fields) {
        if (error) {
            console.log(error);
        }
    res.json(results);

        //현재 user 테이블 정보 가져와서 array에 객체로 저장하여 users2에 객체배열로 저장
    });
});

app.post('/submit',function(req,res){
    var user = req.body;
    var id = user.id;
    var pw = user.pw;
    var nickname = user.nickname;
    var majorNo = user.majorNo;
    var input = user.input;
    var certi1 = user.certi1;
    // var certi2 = user.certi2;
    // var certi3 = user.certi3;

    var sql = 'INSERT INTO user_info VALUES ("'+id+'","'+nickname+'","'+pw+'","'+majorNo+'","'+input+'")';
    connection.query(sql, function (error, results, fields) {
        if (error) {
            console.log(error);
        }
        res.json(results);
        });
    });




    app.post('/submitCerti',function(req,res){
        var user = req.body;
        var id = user.id;
        var certi1 = user.certi1[0];
        var certi2 = user.certi1[1];
        var certi3 = user.certi1[2];


        console.log(certi1);
        console.log(certi2);
        console.log(certi3);

        var query = 'INSERT INTO user_certi_info VALUES ("'+id+'","'+certi1+'");'+
                    'INSERT INTO user_certi_info VALUES ("'+id+'","'+certi2+'");'+
                    'INSERT INTO user_certi_info VALUES ("'+id+'","'+certi3+'");';
        connection.query(query, function (error, results, fields) {
            if (error) {
                console.log(error);
            }
            res.json(results);
            });
        // });
        // connection.query(sql2, function (error, results, fields) {});
        // connection.query(sql3, function (error, results, fields) {});
    });
    
    
    
        app.get('/majorInfoGet',function(req,res){
            const sess = req.session; // 세션 객체에 접근
            connection.query('SELECT * FROM major', function (error, results, fields) {
                if (error) {
                    console.log(error);
                }
            res.json(results);
    
                //현재 user 테이블 정보 가져와서 array에 객체로 저장하여 users2에 객체배열로 저장
            });
        });
    


http.createServer(app).listen(app.get('port'),function(){
    console.log('server start...' + app.get('port'));
});//서버로 구동하는 것