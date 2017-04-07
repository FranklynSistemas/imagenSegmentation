### Image segmentation

Para la segmentación de la imagen se utilizó el Algoritmo de  [Kmeans](https://www.npmjs.com/package/node-kmeans) realizando el siguiente proceso: 


*Paso 1*

Se itero cada pixel de la imagen tomando en cuenta que "idx" hace referencia al color Rojo, "idx+1" al color Verde y "idx+2"     al color Azul almacenándolos finalmente en un Array.

``` js
    vectors[i] = [ this.bitmap.data[ idx ] , this.bitmap.data[ idx + 1 ], this.bitmap.data[ idx + 2 ]];
```

*Paso 2*

Luego con los pixeles de la imagen vectorizados se procede a aplicar el Algoritmo de Kmeans pasando como parámetros el **vector** y el número de clusters en este caso **3** una vez procesado el Vector el Algoritmo retorna los siguientes datos:

* centroid : array of X elements (X = number of dimensions)
* cluster : array of X elements containing the vectors of the input data
* clusterInd : array of X integers which are the indexes of the input data

*Este algoritmo agrupara los valores de cada pixel que tengan alguna coincidencia con el pixel pivote elegido aleatoriamente.*

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
*Paso 3*

En este último paso se crea la nueva imagen con las mismas dimensiones que la original y se mapeando los nuevos pixeles en los correspondientes **clusterInd** con sus correspondientes colores almacenados en **cluster**.

``` js
    var newImage = new Jimp(width, height, function (err, image) {
        imagen = image;
    });
    var num = Segmento.clusterInd.length;
    for (var index = 0; index < num; index++) {
        imagen.bitmap.data[ Segmento.clusterInd[index] ] = Segmento.cluster[index][0];
        imagen.bitmap.data[ Segmento.clusterInd[index] + 1 ] = Segmento.cluster[index][1]
        imagen.bitmap.data[ Segmento.clusterInd[index] + 2] = Segmento.cluster[index][2]
    }
```
