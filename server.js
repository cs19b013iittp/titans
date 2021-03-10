/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


const express = require('express');
const path = require('path');
const app = express();
app.use(express.static(__dirname + '/dist/titans'));
app.get('/*', function(req,res) {
res.sendFile(path.join(__dirname+
'/dist/titans/index.html'));});
app.listen(process.env.PORT || 8080);
