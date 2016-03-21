$(function(){
	//µ¼º½À¸
	function navSlider(){
		var $nav = $('.nav'),
		$cur = $('.nav li.cur a'),
		$navLine = $('.nav-line'),
		$anchor = $('a',$nav.children()),
		curPosL = $cur.position().left,
		curW = $cur.outerWidth(true),
		curIdx = $('li.cur',$nav).index();
		$navLine.css({'width':curW,'left':curPosL});
		$anchor.not('li.last a',$nav).each(function(index){
			var posL = $(this).position().left,
			w = $(this).outerWidth(true);
			$(this).mouseenter(function(){
				$navLine.animate({'width':w,'left':posL},250);
				$(this).parent().addClass('cur').siblings().removeClass('cur');
			});
		});
		$nav.mouseleave(function(){
			$navLine.animate({'width':curW,'left':curPosL},250);
			$anchor.parent(':eq('+curIdx+')').addClass('cur').siblings().removeClass('cur');
		});
	};
	navSlider();
});