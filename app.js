const express = require('express');

//express app
const app = express();
var login_flag = false;

// for getting form data input



var bodyParser = require('body-parser');

var bcrypt = require('bcrypt');

const csv = require('csv-parser'),
results = [];

app.use(express.json());

app.get('/getdata',(req,res)=>{
    //console.log(req);
    const fs2 = require('fs');
    var results2 = [];
    fs2.createReadStream('bookscrape_f1.csv')
        .pipe(csv())
        .on('data', (data) => results2.push(data))
        .on('end', () => {
            //console.log(results);
            
            res.json({
                list:results2
            });
        });
})

const csvfilepath = "file.csv";

//listen for requests
app.listen(3000);


app.get('/',(req,res) => {
    console.log('Welcome Page');
    res.sendFile('./HTML_Files/WelcomePage.html',{root : __dirname});
})

app.use(express.urlencoded({extended: true}));

function checkemail(temp){
    var fs4 = require('fs');
    fs4.createReadStream('file.csv')
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            
            for(let i in results)
            {
                var database_email = (results[i].email_address_su);
                if(database_email === temp){
                    console.log('email found');
                    
                    return false;
                }
            }
        });
}

app.post("/signupsubmit",function(req,res){
    console.log('Sign Up Submit');
    var values= req.body;
    console.log(req.body);
    var fs = require('fs');
    var temp = values.email_address_su;
    var test = Object.values(req.body);
    
    

    console.log(temp);

    
    if(test[6] == test[7] && checkemail(temp)){
        var hash_pw ='';
        var saltRounds = 10;
        bcrypt.hash(test[6], saltRounds, function(err, hash) {
             hash_pw = hash;
             //console.log(hash_pw);
             
             var json2csv = require('json2csv');
             var newLine = '\r\n';
             var appendThis = req.body;
             appendThis.password = hash_pw;
             appendThis.confirm_password = hash_pw;
             var fields = Object.keys(req.body);
             //console.log(fields);

             var toCsv = {
                 data: appendThis,
                 fields: fields,
                 header: false,
             };
    
            fs.stat('file.csv', function (err, stat) {
                if (err == null) {
                    console.log('File exists');
                
                    //write the actual data and end with newline
                    var csv = json2csv.parse(appendThis, {header:false}) + newLine;
                        
                    //console.log(csv);

                    fs.appendFileSync('file.csv', csv, function (err) {
                        if (err) throw err;
                        console.log('The "data to append" was appended to file!');
                });
                } else {
                    //write the headers and newline
                    console.log('New file, just writing headers');
                    fields = fields + newLine;
                
                    fs.writeFile('file.csv', fields, function (err) {
                        if (err) throw err;
                        console.log('file saved');

                        var csv = json2csv.parse(appendThis, {header:false}) + newLine;
                        
                        //console.log(csv);
    
                        fs.appendFileSync('file.csv', csv, function (err) {
                            if (err) throw err;
                            console.log('The "data to append" was appended to file!');
                        });
                });
                }
            });
            login_flag=true;
            res.redirect('/postlogin');
        });
    console.log(hash_pw);
    //json2csv
    
    }
    else if(checkemail(temp)){       
        res.send("<a  href='/signup' > Password Didnt Match....Try Again </a>");
    }
    else{
        res.send("<a  href='/signin' > Email Already Registered....Pls Sign In </a>");
    }
    
   });


   app.post("/signinsubmit",function(req,res){
        var values= req.body;
        console.log(values);
        const fs = require('fs');
        var t=0;
        fs.createReadStream('file.csv')
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            
            for(let i in results)
            {
                var database_email = (results[i].email_address_su);
                if(database_email === values.address){
                    console.log('email found');
                    t++;
                    bcrypt.compare(values.password,results[i].password, function(err,response){
                        if(response){
                            
                            console.log('password found');
                            login_flag=true;
                            res.redirect('/postlogin');
                        }
                        else{
                            res.send("<a  href='/signin' > Password Wrong....Try Again </a>");
                        }
                    })
                }
            }
            if(t==0)
            res.send("<a  href='/signup' > Email Not Found Sign Up In First </a>");
        });
        
   });

   app.get('/signin',(req,res) => {
    console.log('Sign In Page');
    res.sendFile('./HTML_Files/sign_in_form.html',{root : __dirname});
})

app.get('/signup',(req,res) => {
    console.log('Sign Up Page');
    res.sendFile('./HTML_Files/signUpForm.html',{root : __dirname});
})

app.get('/postlogin',(req,res) => {
    if(login_flag){
        console.log('Post Sign In Page');
        res.sendFile('./HTML_Files/postLogin.html',{root : __dirname});
    }
    else{
        res.send("<a  href='/signin' > Please Log In First </a>");
    }
})

app.get('/booksearch',(req,res) => {
    console.log('Welcome Page');
    if(login_flag){     
        res.sendFile('./HTML_Files/booksearch.html',{root : __dirname});
    }
    else{
        res.send("<a  href='/signin' > Please Log In First </a>");
    }
})

app.post("/booksearchsubmit",function(req,res){
    if(login_flag){
        console.log(req.body);
        var values= req.body;
        console.log(values);
        const fs3 = require('fs');
        var results=[];
        fs3.createReadStream('bookscrape_f1.csv')
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            console.log('hii');
            var flag=true;
            for(let i in results)
            {
                //console.log('******');

                if((values.x).toLocaleUpperCase() == (results[i].Title).toLocaleUpperCase()){
                    console.log(results[i]);
                    res.json((results[i]));
                    flag = false;
                }
            }
            if(flag){
                res.json({
                    Not_Found: "Book Not Available"
                });
            }
        });
    }
    else{
        res.send("<a  href='/signin' > Please Log In First </a>");
    }
    
});




app.get('/logout',(req,res) => {
    console.log('Welcome Page');
    login_flag=false;
    res.sendFile('./HTML_Files/WelcomePage.html',{root : __dirname});
})