$(document).ready(function(){
	// Activate Carousel
	$("#myCarousel").carousel({interval: 10000});
    
	// Enable Carousel Indicators
	$(".item1").click(function(){
		$("#myCarousel").carousel(0);
	});
	$(".item2").click(function(){
		$("#myCarousel").carousel(1);
	});
	$(".item3").click(function(){
		$("#myCarousel").carousel(2);
	});
	$(".item4").click(function(){
		$("#myCarousel").carousel(3);
	});
	$(".item5").click(function(){
		$("#myCarousel").carousel(4);
	});
	$(".item6").click(function(){
		$("#myCarousel").carousel(5);
	});
	$(".item7").click(function(){
		$("#myCarousel").carousel(6);
	});
	$(".item8").click(function(){
		$("#myCarousel").carousel(7);
	});
	$(".item9").click(function(){
		$("#myCarousel").carousel(8);
	});
	
	// Enable Carousel Controls
	$(".left").click(function(){
		$("#myCarousel").carousel("prev");
	});
	$(".right").click(function(){
		$("#myCarousel").carousel("next");
	});
});