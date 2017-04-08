### Image segmentation

Para la segmentación de la imagen se utilizó el Algoritmo de  [Kmeans](https://www.npmjs.com/package/node-kmeans) realizando el siguiente proceso: 

*Paso 1*

Se crea el **vector** que contendrá los pixeles de la imagen pasando como primer elemento el color a buscar en este caso el Rojo 

``` js
vectors[0] =  [0, 20, 255] //CenterID Rojo
```
Este primer elemento será el CenterID utilizado por el algoritmo *Kmenas* para generar los clousters obteniendo de forma más precisa el clouster de nuestro interés para el caso, el que contenga los pixeles rojos.
 

*Paso 2*

Se itero cada pixel de la imagen tomando en cuenta que "idx" hace referencia al color Rojo, "idx+1" al color Verde y "idx+2"     al color Azul almacenándolos finalmente en un Array.

``` js
    vectors[i] = [ this.bitmap.data[ idx ] , this.bitmap.data[ idx + 1 ], this.bitmap.data[ idx + 2 ]];
```

*Paso 3*

Luego con los pixeles de la imagen vectorizados se procede a aplicar el Algoritmo de Kmeans pasando como parámetros el **vector** y el número de clusters en este caso **3** una vez procesado el Vector el Algoritmo retorna los siguientes datos:

* centroid : array of X elements (X = number of dimensions)
* cluster : array of X elements containing the vectors of the input data
* clusterInd : array of X integers which are the indexes of the input data

*Este algoritmo agrupara los valores de cada pixel que tengan alguna coincidencia con el centerId asignado en el primer paso.*

``` js
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
```

*Paso 4*

En este último paso se crea la nueva imagen  mapeando los nuevos pixeles en los correspondientes **clusterInd** y finalmente se convierte la imagen a escala de grises y se invierte la imagen final debido a que el resultado de kameas permite pintar el contorno de los sectores con color rojo, pero si se desean ver con más detalle es necesario realizar la conversión.

``` js
    var newImage = new Jimp(width, height, function (err, image) {
        imagen = image;
    });
    var num = Segmento.clusterInd.length;
    for (var index = 0; index < num; index++) {
        imagen.bitmap.data[ Segmento.clusterInd[index] ] = 255;
    }
    imagen.resize(width*2, height*2, Jimp.RESIZE_BEZIER).greyscale().invert().write("./out/out.png");
```
