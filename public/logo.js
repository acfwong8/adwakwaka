var $canvas = $("<canvas>").attr("id","logo");
var $a = $("<a>").attr("href","/").append($canvas);
$("header .logo").append($a);


drawText();
function drawText(){
    var c = document.getElementById("logo");
    c.width = 3200;
    c.height = 600;
    var minX = 70/1600 * c.width;
    var maxY = 225/300 * c.height;
    var minY = 75/300 * c.height;
    var startX = 10;
    var counter = 0;
    var gap = 30/1600 * c.width;
    var bigGap = 35/1600 * c.width;
    var space = 20/1600 * c.width;
    var divider = 1000;
    var thick = c.width * 0.003;
    var lineColor = "white";

    var ctx = c.getContext("2d");
    function lines(xStart, yStart, xEnd, yEnd, thickness, color){
        drawAnimationLine();
        counter = 0;
        ctx.beginPath();
        function drawAnimationLine(){
            var lineStartx = xStart;
            var lineStarty = yStart;
            var lineEndx = xEnd;
            var lineEndy = yEnd;
            var x = lineStartx + (counter/2*(lineEndx - lineStartx))/divider;
            var y = lineStarty + (counter/2*(lineEndy - lineStarty))/divider;
            ctx.moveTo(lineStartx, lineStarty);
            if(x <= lineEndx && y !== lineEndy){
                counter++;
                ctx.lineTo(x, y);
                ctx.strokeStyle = color;
                ctx.lineWidth = thickness;
                ctx.stroke();
                window.requestAnimationFrame(drawAnimationLine);
            }else if(y == lineEndy && x !== lineEndx){
                counter++;
                ctx.lineTo(x, y);
                ctx.strokeStyle = color;
                ctx.lineWidth = thickness;
                ctx.stroke();
                window.requestAnimationFrame(drawAnimationLine);
            }
        }
        ctx.closePath();
    }
    var counter2 = 0;
    function circle(xCenter, yCenter, posStart, posEnd, thickness, color, rad){
        drawAnimationCircle();
        function drawAnimationCircle(){
            ctx.beginPath();
            var end = posStart + (counter/2*(posEnd - posStart))/divider;
            if(end <= posEnd){
                ctx.arc(xCenter, yCenter, rad, posStart, end, false);
                ctx.strokeStyle = color;
                ctx.lineWidth = thickness;
                ctx.stroke();
                window.requestAnimationFrame(drawAnimationCircle);
            }
        }
        ctx.closePath();
        // ctx.beginPath();
        // ctx.arc(xCenter, yCenter, rad, posStart, posEnd, false);
        // ctx.strokeStyle = color;
        // ctx.lineWidth = thickness;
        // ctx.stroke();
        // ctx.closePath();
    }
    function oval(xCenter, yCenter, posStart,posEnd, thickness, color, radX, radY){
        drawAnimationOval();
        function drawAnimationOval(){
            ctx.beginPath();
            var end = posStart + (counter/2*(posEnd - posStart))/divider;
            var rad = radY + (counter/2*(radX - radY))/divider;
            if(end <= posEnd){
                ctx.ellipse(xCenter, yCenter, radX, radY, Math.PI/180, posStart, end, false);
                ctx.strokeStyle = color;
                ctx.lineWidth = thickness;
                ctx.stroke();
                window.requestAnimationFrame(drawAnimationOval);
            }
        }
        ctx.closePath();
    }
    // big M
    lines(minX, maxY, minX + gap, minY, thick, lineColor);
    lines(minX + gap, minY, minX + gap*2, maxY - 50/300 * c.height, thick, lineColor);
    lines(minX + gap*2, maxY - 50/300 * c.height, minX + gap*3, minY, thick, lineColor);
    lines(minX + gap*3, minY, minX + gap*4, maxY, thick, lineColor);
    // small M
    lines(minX + gap/2, maxY, minX + gap, maxY - (maxY - minY)/2, thick, lineColor);
    lines(minX + gap, maxY - (maxY - minY)/2, minX + gap*2, maxY, thick, lineColor);
    lines(minX + gap*2, maxY, minX + gap*3, maxY - (maxY - minY)/2, thick, lineColor);
    lines(minX + gap*3, maxY - (maxY - minY)/2, minX + gap*3.5, maxY, thick, lineColor);
    // big A
    lines(minX + gap*4 + space, maxY, minX + gap*4 + space + bigGap, maxY - (maxY - minY)/1.5, thick, lineColor);
    lines(minX + gap*4 + space + bigGap, maxY - (maxY - minY)/1.5, minX + gap*4 + space + bigGap*2, maxY, thick, lineColor);
    // small A
    lines(minX + gap*4 + space + bigGap/2, maxY, minX + gap*4 + space + bigGap, maxY - (maxY - minY)/3, thick, lineColor);
    lines(minX + gap*4 + space + bigGap, maxY - (maxY - minY)/3, minX + gap*4 + space + bigGap*1.5, maxY, thick, lineColor);
    //big N
    lines(minX + gap*4 + space*2 + bigGap*2, maxY, minX + gap*4 + space*2 + bigGap*2, maxY - (maxY - minY)/1.5, thick, lineColor);
    lines(minX + gap*4 + space*2 + bigGap*2, maxY - (maxY - minY)/1.5, minX + gap*4 + space*2 + bigGap*3, maxY - (maxY - minY)/3, thick, lineColor);
    lines(minX + gap*4 + space*2 + bigGap*3, maxY - (maxY - minY)/3, minX + gap*4 + space*2 + bigGap*3, maxY - (maxY - minY)/1.5, thick, lineColor);
    // small N
    lines(minX + gap*4 + space*2 + bigGap*2.5, maxY, minX + gap*4 + space*2 + bigGap*2.5, maxY - (maxY - minY)/3, thick, lineColor);
    lines(minX + gap*4 + space*2 + bigGap*2.5, maxY - (maxY - minY)/3, minX + gap*4 + space*2 + bigGap*3.5, maxY, thick, lineColor);
    lines(minX + gap*4 + space*2 + bigGap*3.5, maxY, minX + gap*4 + space*2 + bigGap*3.5, maxY - (maxY - minY)/1.5, thick, lineColor);
    // T
    lines(minX + gap*4 + space*3 + bigGap*3.5, maxY - (maxY - minY)/1.5, minX + gap*4 + space*3 + bigGap*6, maxY - (maxY - minY)/1.5, thick, lineColor);
    lines(minX + gap*4 + space*3 + bigGap*3.5, maxY - (maxY - minY)/1.9, minX + gap*4 + space*3 + bigGap*4.5, maxY - (maxY - minY)/1.9, thick, lineColor);
    lines(minX + gap*4 + space*3 + bigGap*5, maxY - (maxY - minY)/1.9, minX + gap*4 + space*3 + bigGap*6, maxY - (maxY - minY)/1.9, thick, lineColor);
    lines(minX + gap*4 + space*3 + bigGap*4.5, maxY - (maxY - minY)/1.9, minX + gap*4 + space*3 + bigGap*4.5, maxY, thick, lineColor);
    lines(minX + gap*4 + space*3 + bigGap*5, maxY - (maxY - minY)/1.9, minX + gap*4 + space*3 + bigGap*5, maxY, thick, lineColor);
    // R
    lines(minX + gap*4 + space*4 + bigGap*6, maxY, minX + gap*4 + space*4 + bigGap*6, maxY - (maxY - minY)/1.5, thick, lineColor);
    lines(minX + gap*4 + space*4 + bigGap*6, maxY - (maxY - minY)/1.5, minX + gap*4 + space*4 + bigGap*7, maxY - (maxY - minY)/1.5, thick, lineColor);
    lines(minX + gap*4 + space*4 + bigGap*6.5, maxY, minX + gap*4 + space*4 + bigGap*6.5, maxY - (maxY - minY)/3, thick, lineColor);
    var RadiusR = minY/3;
    circle(minX + gap*4 + space*4 + bigGap*7, maxY - (maxY - minY)/1.5 + RadiusR, 1.5*Math.PI, 2.5*Math.PI, thick, lineColor, RadiusR);
    lines(minX + gap*4 + space*4 + bigGap*6.5, maxY - (maxY - minY)/3, minX + gap*4 + space*4 + bigGap*7.5, maxY, thick, lineColor);
    lines(minX + gap*4 + space*4 + bigGap*7, maxY - (maxY - minY)/3, minX + gap*4 + space*4 + bigGap*8, maxY, thick, lineColor);
    // O
    oval(minX + gap*4 + space*5 + bigGap*8 + bigGap, maxY - ((maxY - minY)/3), 1.5*Math.PI, 3.5*Math.PI, thick, lineColor, bigGap*1.2, ((maxY - minY)/3));
    oval(minX + gap*4 + space*5 + bigGap*8 + bigGap, maxY - ((maxY - minY)/3), 1.5*Math.PI, 3.5*Math.PI, thick, lineColor, bigGap/1.5, ((maxY - minY)/5));
    // big N
    lines(minX + gap*4 + space*6.5 + bigGap*10, maxY, minX + gap*4 + space*6.5 + bigGap*10, maxY - (maxY - minY)/1.5, thick, lineColor);
    lines(minX + gap*4 + space*6.5 + bigGap*10, maxY - (maxY - minY)/1.5, minX + gap*4 + space*6.5 + bigGap*11, maxY - (maxY - minY)/3, thick, lineColor);
    lines(minX + gap*4 + space*6.5 + bigGap*11, maxY - (maxY - minY)/3, minX + gap*4 + space*6.5 + bigGap*11, maxY - (maxY - minY)/1.5, thick, lineColor);
    // small N
    lines(minX + gap*4 + space*6.5 + bigGap*10.5, maxY, minX + gap*4 + space*6.5 + bigGap*10.5, maxY - (maxY - minY)/3, thick, lineColor);
    lines(minX + gap*4 + space*6.5 + bigGap*10.5, maxY - (maxY - minY)/3, minX + gap*4 + space*6.5 + bigGap*11.5, maxY, thick, lineColor);
    lines(minX + gap*4 + space*6.5 + bigGap*11.5, maxY, minX + gap*4 + space*6.5 + bigGap*11.5, maxY - (maxY - minY)/1.5, thick, lineColor);
    // I
    lines(minX + gap*4 + space*8 + bigGap*11.5, maxY, minX + gap*4 + space*8 + bigGap*11.5, maxY - (maxY - minY)/1.5, thick, lineColor);
    lines(minX + gap*4 + space*8 + bigGap*12, maxY, minX + gap*4 + space*8 + bigGap*12, maxY - (maxY - minY)/1.5, thick, lineColor);
    // C
    circle(minX + gap*4 + space*10 + bigGap*12 + bigGap, maxY - (maxY - minY)/3, 0.3*Math.PI, 1.7*Math.PI, thick, lineColor, (maxY - minY)/3);
    circle(minX + gap*4 + space*10 + bigGap*12 + bigGap, maxY - (maxY - minY)/3, 0.3*Math.PI, 1.7*Math.PI, thick, lineColor, (maxY - minY)/5);
}
$(window).on("load",function(){
    var height = $("header").height()-1;
    var width = height * 5.333333;
    $("canvas").css({"width": width, "height": height});
})

$(window).on("resize",function(){
    var height = $("header").height()-1;
    var width = height * 5.333333;
    $("canvas").css({"width": width, "height": height});
})

