(function(G) {
function Circle() {
    this.init.apply(this, arguments);
}
Circle.prototype = {
    init : function(id) {
        var c = this;
        c.el = id;
        c.radius = 350;
        c.d=380;
        c.mcList = [];
        c.active = false;
        c.lasta = 1;
        c.lastb = 1;
        c.distr = true;
        c.tspeed=5;
        c.size=300;

        c.mouseX = 0;
        c.mouseY = 0;

        c.howElliptical = 1;
        c.oDiv= document.getElementById(id);
        c.aA = c.oDiv.getElementsByTagName('a');

        c.oDiv.onmouseover=function ()
        {
            c.active = true;
        };

        c.oDiv.onmouseout=function ()
        {
            c.defaultMove();
        };

        c.oDiv.onmousemove=function (ev)
        {
            var oEvent = window.event || ev;

            c.mouseX = oEvent.clientX-(c.oDiv.offsetLeft + c.oDiv.offsetWidth/2);
            c.mouseY = oEvent.clientY-(c.oDiv.offsetTop + c.oDiv.offsetHeight/2);

            c.mouseX/=5;
            c.mouseY/=5;
        };

        if (c.mcList.length == 0)
        {
            var i=0;
            var oTag=null;
            for(i=0;i<c.aA.length;i++)
            {
                oTag={};
                oTag.offsetWidth = c.aA[i].offsetWidth;
                oTag.offsetHeight = c.aA[i].offsetHeight;
                c.mcList.push(oTag);
            }
            c.positionAll();
            c.defaultMove();
        }
        c.up = setInterval(function() {
            c.update(c);
        }, 30);
    },
    defaultMove : function() {
        var c = this;
        c.active = true;
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

            c.mcList[j].cx = rx3;
            c.mcList[j].cy = ry3;
            c.mcList[j].cz = rz3;

            per = c.d/(c.d+rz3);

            c.mcList[j].x = (c.howElliptical * rx3 * per) - (c.howElliptical*2);
            c.mcList[j].y = ry3*per;
            c.mcList[j].scale = per;
            c.mcList[j].alpha = per;

            c.mcList[j].alpha = (c.mcList[j].alpha-0.6)*(10/6);
        }
        c.doPosition();
    },
    positionAll : function() {
        var c = this;
        var phi=0;
        var theta=0;
        var max = c.mcList.length;
        var i=0;

        var aTmp=[];
        var oFragment = document.createDocumentFragment();

        //随机排序
        for(i=0;i<c.aA.length;i++) {
            aTmp.push(c.aA[i]);
        }

        aTmp.sort(
            function () {
                return Math.random()<0.5?1:-1;
            }
        );

        for(i=0;i<aTmp.length;i++) {
            oFragment.appendChild(aTmp[i]);
        }

        c.oDiv.appendChild(oFragment);

        for( var i=1; i<max+1; i++){
            if(c.distr)
            {
                phi = Math.acos(-1+(2*i-1)/max);
                theta = Math.sqrt(max*Math.PI)*phi;
            }
            else
            {
                phi = Math.random()*(Math.PI);
                theta = Math.random()*(2*Math.PI);
            }
            //坐标变换
            c.mcList[i-1].cx = c.radius * Math.cos(theta)*Math.sin(phi);
            c.mcList[i-1].cy = c.radius * Math.sin(theta)*Math.sin(phi);
            c.mcList[i-1].cz = c.radius * Math.cos(phi);

            c.aA[i-1].style.left = c.mcList[i-1].cx + c.oDiv.offsetWidth/2 - c.mcList[i-1].offsetWidth/2+'px';
            c.aA[i-1].style.top = c.mcList[i-1].cy + c.oDiv.offsetHeight/2 - c.mcList[i-1].offsetHeight/2+'px';
        }
    },
    doPosition : function() {
        var c = this;
        var l = c.oDiv.offsetWidth/2;
        var t = c.oDiv.offsetHeight/2;
        l = 1024/2;
        t = 768/2;
        for(var i=0;i<c.mcList.length;i++) {
            c.mcList[i].alpha = c.mcList[i].alpha + 0.3;
            c.aA[i].style.left = c.mcList[i].cx + l - c.mcList[i].offsetWidth/2+'px';
            c.aA[i].style.top = c.mcList[i].cy + t - c.mcList[i].offsetHeight/2+'px';
            c.aA[i].style.fontSize = Math.ceil(12 * c.mcList[i].scale/4)+'px';
            c.aA[i].style.filter = "alpha(opacity=" + 100 * c.mcList[i].alpha+")";
            c.aA[i].style.opacity = c.mcList[i].alpha;
            c.aA[i].style.display = 'block';
        }
    },
    sineCosine : function( a, b, c) {
        var dtr = Math.PI/180;
        var sa = Math.sin(a * dtr);
        var ca = Math.cos(a * dtr);
        var sb = Math.sin(b * dtr);
        var cb = Math.cos(b * dtr);
        var sc = Math.sin(c * dtr);
        var cc = Math.cos(c * dtr);
        return [sa, ca, sb, cb, sc, cc];
    }
};
this.Circle = Circle;
})(this);
