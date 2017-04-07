$(function(){

	$(window).load(function() {
		 $("#Cargando").delay(300).fadeOut("slow");				
	});

	$("#segment").click(function() {
		var url = $("#url").val();
		console.log(url);
		if(url!= ""){
			$("#Cargando").css( "background-color", "rgba(255, 255, 255, 0)" ).fadeIn();
			$.ajax({
				url     : "/cargarImg?url="+url,
				type    : "GET", 
				data    : "", 
				dataType  : "json",
				contentType: "application/json; charset=utf-8"
				}).done(function(result){
					//var result = JSON.parse(response);
					$("#Cargando").delay(300).fadeOut("slow");
					if(result.status){
						$("#imgOriginal").attr("src",url);
						$("#img").attr("src", result.img);
					}else{
						$("#error").html("<h3>"+result.err+"</h3>").fadeIn("slow");
						setTimeout(function(params) {
							$("#error").fadeOut("slow").html("");
						},5000);
					}
				});
		};
	});
	

});