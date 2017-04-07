var request = require('request');
var cons  = require("consolidate");
var bodyParser  = require('body-parser');
var fs = require('fs');
var express        = require('express');
var app            = express();
//Create Server
app.set('port', (process.env.PORT || 5000));
//Template engine... HTML
app.engine("html", cons.swig); 
app.set("view engine", "html");
app.set("views", __dirname + "/vistas");
app.use(express.static('public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', function(request, response){  
  response.render('index');
});

app.get('/image', function(request, response){  
   download("http://24.media.tumblr.com/tumblr_lfp3qax6Lm1qfmtrbo1_1280.jpg", './images/in.jpg', function(result){
        if(result != undefined){
            response.json(result);
        }else{
            segmentImg(function(imgBase64) {        
                response.render('image', { img: imgBase64 });
            });
        }
    });
});

app.get('/cargarImg', function(request, response) {
    console.log( request.query.url);
    download(request.query.url, './images/in.jpg', function(result){
        console.log(result);
        if(result != undefined){
            response.json(result);
        }else{
            segmentImg(function(imgBase64) {
                response.json({status:true, img:imgBase64 });
            });
        }
    });
});

var download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    if(res != undefined ){
        console.log('content-type:', res.headers['content-type']);
        console.log('content-length:', res.headers['content-length']);
        if(res.headers['content-type'].split("/")[0] == "image"){
            request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
        }else{
            callback({status:false, err: "No es una imagen"});
        }
    }else{
        callback({status:false, err: "No es una URL valida"});
    }
  });
};
/******************************** Lectura y tratamiento de la Imagen  ***************************************/
var Jimp = require("jimp");
var kmeans = require('node-kmeans'); 

var vectors = new Array();
var imagen,
    width,
    height;

function segmentImg(callback){
    Jimp.read("./images/in.jpg", function (err, image) {
    var i = 0;
    //imagen = image;
    width =  image.bitmap.width;
    height = image.bitmap.height;
    //var imgArray = Array.prototype.slice.call(image.bitmap.data, 0);
    image.scan(0, 0,width , height, function (x, y, idx) {
            // x, y is the position of this pixel on the image 
            // idx is the position start position of this rgba tuple in the bitmap Buffer 
            // this is the image 
        /*  var red   = this.bitmap.data[ idx + 0 ];
            var green = this.bitmap.data[ idx + 1 ];
            var blue  = this.bitmap.data[ idx + 2 ];
            var alpha = this.bitmap.data[ idx + 3 ];*/
            vectors[i] = [ this.bitmap.data[ idx ] , this.bitmap.data[ idx + 1 ], this.bitmap.data[ idx + 2 ]];
            i++;
            if(idx == ((image.bitmap.width * image.bitmap.height) * 4)  - 4 ){
                console.log("Finaliza Mapeo");
                MakeKmeans(vectors, function(result) {
                    callback(result);
                });
            }       
        }); 
    });
}

function MakeKmeans(vector, callback){
   kmeans.clusterize(vector, {k: 3},function(err,res) {
        if (err){
            console.error(err);
        }else{
            CreateSegmento(res[2], function(result) {
                callback(result);
            }); 
        }   
    });  
};

function CreateSegmento(Segmento, callback){
    var newImage = new Jimp(width, height, function (err, image) {
        imagen = image;
    });
    var num = Segmento.clusterInd.length;
    for (var index = 0; index < num; index++) {
        imagen.bitmap.data[ Segmento.clusterInd[index] ] = Segmento.cluster[index][0];
        imagen.bitmap.data[ Segmento.clusterInd[index] + 1 ] = Segmento.cluster[index][1]
        imagen.bitmap.data[ Segmento.clusterInd[index] + 2] = Segmento.cluster[index][2]
    }
    imagen.resize(width*2, height*2, Jimp.RESIZE_BEZIER).write("./out/out.png");
    imagen.getBase64( Jimp.AUTO , function(err, image) {
      if(image){
        callback(image);
      }else{
        callback(err);
      }
    });
}

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
