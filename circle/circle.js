(function(G) {
function Circle() {
    this.init.apply(this, arguments);
}
Circle.prototype = {
    init : function(id, radius) {
        var c = this;
        c.el = id;
        c.radius = radius;
        c.d = c.radius + 30;
        c.mcList = [];
        c.active = false;
        c.lasta = 1;
        c.lastb = 1;
        c.tspeed = 5;
        c.size = 100;
        c.mouseX = 0;
        c.mouseY = 0;
        c.howElliptical = 1;
        c.dtr = Math.PI/180;

        c.oDiv= document.getElementById(c.el);
        c.l = c.oDiv.offsetWidth/2;
        c.t = c.oDiv.offsetHeight/2;
        c.oDiv.onmouseover = function () {
            c.active = true;
        };
        c.oDiv.onmouseout=function () {
            c.defaultMove();
        };
        c.oDiv.onmousemove=function (ev) {
            var oEvent = window.event || ev;
            c.mouseX = (oEvent.clientX-(c.oDiv.offsetLeft + c.oDiv.offsetWidth/2))/5;
            c.mouseY = (oEvent.clientY-(c.oDiv.offsetTop + c.oDiv.offsetHeight/2))/5;
        };

        c.aA = c.oDiv.getElementsByTagName('a');
        var max = c.aA.length + 1;
        for(var i=0; i<c.aA.length; i++) {
            var phi = Math.acos(-1+(2*(i+1)-1)/max);
            var theta = Math.sqrt(max*Math.PI)*phi;
            var item = {
                offsetWidth : c.aA[i].offsetWidth,
                offsetHeight : c.aA[i].offsetHeight,
                cx : c.radius * Math.cos(theta)*Math.sin(phi),
                cy : c.radius * Math.sin(theta)*Math.sin(phi),
                cz : c.radius * Math.cos(phi)
            };
            c.mcList.push(item);
            c.aA[i].style.left = item.cx + c.oDiv.offsetWidth/2 - item.offsetWidth/2+'px';
            c.aA[i].style.top = item.cy + c.oDiv.offsetHeight/2 - item.offsetHeight/2+'px';
        }
        c.defaultMove();
        c.up = setInterval(function() {
            c.update(c);
        }, 30);
    },
    defaultMove : function() {
        var c = this;
        c.active = false;
        c.mouseX = -c.oDiv.offsetWidth/50;
        c.mouseY = -c.oDiv.offsetHeight/50;
    },
    update : function(c) {
        var a;
        var b;
        if(c.active) {
            a = (-Math.min( Math.max( -c.mouseY, -c.size ), c.size ) / c.radius ) * c.tspeed;
            b = (Math.min( Math.max( -c.mouseX, -c.size ), c.size ) / c.radius ) * c.tspeed;
        } else {
            a = c.lasta * 0.98;
            b = c.lastb * 0.98;
        }
        c.lasta = a;
        c.lastb = b;
        if(Math.abs(a)<=0.01 && Math.abs(b)<=0.01) {
            return;
        }
        var po = c.sineCosine(a, b, 0);
        for(var j=0; j<c.mcList.length; j++) {
            var rx1 = c.mcList[j].cx;
            var ry1 = c.mcList[j].cy*po[1] + c.mcList[j].cz*(-po[0]);
            var rz1 = c.mcList[j].cy*po[0] + c.mcList[j].cz*po[1];
            var rx2 = rx1*po[3] + rz1*po[2];
            var ry2 = ry1;
            var rz2 = rx1*(-po[2]) + rz1*po[3];
            var rx3 = rx2*po[5] + ry2*(-po[4]);
            var ry3 = rx2*po[4] + ry2*po[5];
            var rz3 = rz2;

            per = c.d/(c.d+rz3);
            c.mcList[j].cx = rx3;
            c.mcList[j].cy = ry3;
            c.mcList[j].cz = rz3;
            c.mcList[j].x = (c.howElliptical * rx3 * per) - (c.howElliptical*2);
            c.mcList[j].y = ry3*per;
            c.mcList[j].scale = per;
            c.mcList[j].alpha = (per-0.6)*(10/6)+0.3;

            c.aA[j].style.left = c.mcList[j].cx + c.l - c.mcList[j].offsetWidth/2+'px';
            c.aA[j].style.top = c.mcList[j].cy + c.t - c.mcList[j].offsetHeight/2+'px';
            c.aA[j].style.fontSize = Math.ceil(12 * c.mcList[j].scale/4)+'px';
            c.aA[j].style.filter = "alpha(opacity=" + 100 * c.mcList[j].alpha+")";
            c.aA[j].style.opacity = c.mcList[j].alpha;
            c.aA[j].style.display = 'block';
        }
    },
    sineCosine : function( a, b, c) {
        var sa = Math.sin(a * c.dtr);
        var ca = Math.cos(a * c.dtr);
        var sb = Math.sin(b * c.dtr);
        var cb = Math.cos(b * c.dtr);
        var sc = Math.sin(c * c.dtr);
        var cc = Math.cos(c * c.dtr);
        return [sa, ca, sb, cb, sc, cc];
    }
};
this.Circle = Circle;
})(this);
