var world;
var shapeArray=[];

var polygon;
var touchOrigin;
var touchEnd;
var OEdistance
var OEradian;
var touchScale;
var touching = false;
var face;

var cloud;

var level = 1;
var score = 0;
var bonus = 9000;
var shot = 3;
var size = cc.director.getWinSize();

var scoretext;
var leveltext;
var bonustext;
var jumptext;
var resettext;
var menutext;


if (typeof SpriteTag == "undefined") {
   var SpriteTag = {};
   SpriteTag.totem = 0; // トーテム
   SpriteTag.destroyable = 1; //
   SpriteTag.solid = 2; //
   SpriteTag.ground = 3; //地面
   SpriteTag.gool = 4;

};
var gameLayer;
var gameScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        gameLayer = new game();
        gameLayer.init();
        this.addChild(gameLayer);
    }
});

var game = cc.Layer.extend({
    init:function () {
        this._super();
        var backgroundLayer = cc.LayerGradient.create(cc.color(0xdf,0x9f,0x83,255),cc.color(0xfa,0xf7,0x9f,255));
        this.addChild(backgroundLayer);
        world = new cp.Space();
        world.gravity = cp.v(0, -100);
        var debugDraw = cc.PhysicsDebugNode.create(world);
        debugDraw.setVisible(true);
        this.addChild(debugDraw);


        var wallBottom = new cp.SegmentShape(world.staticBody,
           cp.v(-4294967294, -100), // start point
           cp.v(4294967295, -100), // MAX INT:4294967295
           0); // thickness of wall
        world.addStaticShape(wallBottom);

        cloud = new scroll();
        this.addChild(cloud);


        // this.addBody(240,10,480,20,false,res.ground_png,"ground");
        // this.addBody(204,32,24,24,true,res.brick1x1_png,"destroyable");
        // this.addBody(276,32,24,24,true,res.brick1x1_png,"destroyable");
        // this.addBody(240,56,96,24,true,res.brick4x1_png,"destroyable");
        // this.addBody(240,80,48,24,true,res.brick2x1_png,"solid");
        // this.addBody(228,104,72,24,true,res.brick3x1_png,"destroyable");
        // this.addBody(240,140,96,48,true,res.brick4x2_png,"solid");
        // this.addBody(240,188,24,48,true,res.totem_png,"totem");

        //this.addBody(240,10,480,20,false,res.ground_png,SpriteTag.ground);
        this.addBody(204,32,24,24,false,res.brick1x1_png,SpriteTag.destroyable);
        this.addBody(276,32,24,24,false,res.brick1x1_png,SpriteTag.destroyable);
        this.addBody(240,56,96,24,true,res.brick4x1_png,SpriteTag.destroyable);
        this.addBody(240,80,48,24,false,res.brick2x1_png,SpriteTag.solid);
        this.addBody(228,104,72,24,true,res.brick3x1_png,SpriteTag.destroyable);
        this.addBody(240,140,96,48,true,res.brick4x2_png,SpriteTag.solid);
        this.addBody(240,188,24,48,true,res.totem_png,SpriteTag.totem);
        this.addBody(204,176,24,24,false,res.gool_png,SpriteTag.gool);

        for(i=0;i<2;i++){
          var rp = new mode();
          rp.pictureValue = i;
          rp.setPosition( size.width *0.18*(6+i), size.height *2);
          rp.setScale(1);
          this.addChild(rp);
        }

        topLayer = cc.Layer.create();
        this.addChild(topLayer);
        this.scheduleUpdate();
        cc.eventManager.addListener(touchListener.clone(), this);
        world.setDefaultCollisionHandler (this.collisionBegin,null,null,null);

    },
    addBody: function(posX,posY,width,height,isDynamic,spriteImage,type){
        if(isDynamic){
            var body = new cp.Body(1,cp.momentForBox(1,width,height));
        }
        else{
            var body = new cp.Body(Infinity,Infinity);
        }
        body.setPos(cp.v(posX,posY));
        var bodySprite = cc.Sprite.create(spriteImage);
        gameLayer.addChild(bodySprite,0);
        bodySprite.setPosition(posX,posY);
        if(isDynamic){
            world.addBody(body);
        }
        var shape = new cp.BoxShape(body, width, height);
        shape.setFriction(1);
        shape.setElasticity(0);
        shape.name=type;
        shape.setCollisionType(type);
        shape.image=bodySprite;
        world.addShape(shape);
        shapeArray.push(shape);
    },
    update:function(dt){
        world.step(dt);
        cloud.scroll();
        for(var i=shapeArray.length-1;i>=0;i--){
            shapeArray[i].image.x=shapeArray[i].body.p.x
            shapeArray[i].image.y=shapeArray[i].body.p.y
            var angle = Math.atan2(-shapeArray[i].body.rot.y,shapeArray[i].body.rot.x);
            shapeArray[i].image.rotation= angle*57.2957795;
        }
        for (var i = 0; i < shapeArray.length; i++) {
           var shape = shapeArray[i];
              //pointQueryは物理オブジェクトの内側がタップされたかどうか判定する関数
                if (touching && shape.name == SpriteTag.totem) {
                 face = shape.body;
                 polygon.setPosition(shape.body.getPosition().x,shape.body.getPosition().y);
                 //totemとtouchEndの距離
                 OEdistance = Math.sqrt((shape.body.getPosition().x-touchEnd.getPosition().x)*(shape.body.getPosition().x-touchEnd.getPosition().x)+(shape.body.getPosition().y-touchEnd.getPosition().y)*(shape.body.getPosition().y-touchEnd.getPosition().y));
                 //モンスト風
                 //polygon.setScale(1,OEdistance/50);
                 polygon.setScale(1,OEdistance/100);
                 //totem(polygonの中点)とtouchEnd(タッチしている場所)の角度
                 OEradian = Math.atan2(shape.body.getPosition().x-touchEnd.getPosition().x,shape.body.getPosition().y-touchEnd.getPosition().y) * 180 / Math.PI;
                 polygon.setRotation(OEradian);
                 //xSpeed = (touchEnd.getPosition().x - touchOrigin.getPosition().x) / 10;
                 //ySpeed = (touchEnd.getPosition().y - touchOrigin.getPosition().y) / 10;
               }
         }
         //テキスト
         topLayer.removeChild(leveltext);
         topLayer.removeChild(scoretext);
         scoretext = cc.LabelTTF.create("Score : "+ score,"Arial",10);
         scoretext.setPosition(size.width *0.25, size.height*2);
         topLayer.addChild(scoretext,1);
         topLayer.removeChild(bonustext);
         bonus-=1;
         bonustext = cc.LabelTTF.create("Bonus : "+ bonus,"Arial",10);
         bonustext.setPosition(size.width *0.5, size.height*2);
         topLayer.addChild(bonustext,1);
         topLayer.removeChild(jumptext);
         jumptext = cc.LabelTTF.create("Jump : "+ shot,"Arial",10);
         jumptext.setPosition(size.width *0.7, size.height*2);
         topLayer.addChild(jumptext,1);
         topLayer.removeChild(resettext);
    },
    collisionBegin : function (arbiter, space ) {
      //var col = arbiter.a.name + arbiter.b.name;
      if((arbiter.a.name==0  && arbiter.b.name==4) || (arbiter.a.name==4 && arbiter.b.name==0)){
        console.log("Oh no!!!!");
      }
      //console.log(space);
      //console.log(space);
      if((arbiter.a.name==0  && arbiter.b.name==1) || (arbiter.a.name==1 && arbiter.b.name==0)){
        if(arbiter.a.name == 1){
          world.removeShape(arbiter.a);
          gameLayer.removeChild(arbiter.image);
          shapeArray.splice(i, 1);
        }
      }
      if(arbiter.a.name== SpriteTag.totem && arbiter.b.name== SpriteTag.ground ) {
        cc.audioEngine.playEffect(res.landing_mp3);
      }
      return true;
    },


});
//拡張
var mode = cc.Sprite.extend({
    ctor:function() {
        this._super();
        if(i==0)this.initWithFile(res.reset_png);
        if(i==1)this.initWithFile(res.menu_png);
        cc.eventManager.addListener(lis.clone(), this);
    }
});
//scroll
var scroll = cc.Sprite.extend({
  //ctorはコンストラクタ　クラスがインスタンスされたときに必ず実行される
  ctor: function() {
    this._super();
    this.initWithFile(res.cloud_png);
    this.setScale(0.2);
    //this.opacity;
    this.setOpacity(100);
  },
  //onEnterメソッドはスプライト描画の際に必ず呼ばれる
  onEnter: function() {
    //背景画像の描画開始位置 横960の画像の中心が、画面の端に設置される
    this.setPosition(size.width*2, size.height);
    //  this.setPosition(480,160);
  },
  scroll: function() {
    //座標を更新する
    this.setPosition(this.getPosition().x - 2, this.getPosition().y);
    //画面の端に到達したら反対側の座標にする
    if (this.getPosition().x < -100) {
      this.setPosition(size.width*2, this.getPosition().y);
    }
  }
});
//押されたときの処理
var lis = cc.EventListener.create({
    event: cc.EventListener.TOUCH_ONE_BY_ONE,
    swallowTouches: true,
    onTouchBegan: function (touch, event) {
            var target = event.getCurrentTarget();
            var location = target.convertToNodeSpace(touch.getLocation());
            var targetSize = target.getContentSize();
            var targetRectangle = cc.rect(0, 0, targetSize.width, targetSize.height);
            if (cc.rectContainsPoint(targetRectangle, location)) {
              if(target.pictureValue == 0){
                //topLayer.removeChild(leveltext);
                shot = 3;
                var gamescene = cc.TransitionFadeDown.create(0.5, new gameScene());
                cc.director.runScene(gamescene);
                bonus = 9000;

              }
              if(target.pictureValue == 1){

              }
              cflag = 0;
              gameflag = 0;
            }
    }
});

var touchListener = cc.EventListener.create({
   event: cc.EventListener.TOUCH_ONE_BY_ONE, // シングルタッチのみ対応
   swallowTouches: false, // 以降のノードにタッチイベントを渡す
   onTouchBegan: function(touch, event) { // タッチ開始時
      var pos = touch.getLocation();

      //console.log("shapeArray.length:", shapeArray.length)
         // すべてのshapをチェックする
      for (var i = 0; i < shapeArray.length; i++) {
         var shape = shapeArray[i];
         //console.log("shape.type:", i, shape.type)
            //pointQueryは物理オブジェクトの内側がタップされたかどうか判定する関数
         if (shape.pointQuery(cp.v(pos.x, pos.y)) != undefined) {
            console.log("hit ")
            /*if (shape.name == SpriteTag.destroyable) {
               //ブロックをタップしたときは、消去する
               world.removeBody(shape.getBody());
               world.removeShape(shape);
               gameLayer.removeChild(shape.image);
               shapeArray.splice(i, 1);
               console.log("remove block")
               return;
            */
             if (shape.name == SpriteTag.totem) {
               // トーテムをタップしたときは、衝撃を与える
               touchOrigin = cc.Sprite.create(res.touchorigin_png);
               touchEnd = cc.Sprite.create(res.touchend_png);
               topLayer.addChild(touchOrigin, 0);
               topLayer.addChild(touchEnd, 0);
               touchOrigin.setPosition(touch.getLocation().x, touch.getLocation().y);
               touchEnd.setPosition(touch.getLocation().x, touch.getLocation().y);

               //多角形を描く
               var red = cc.color(255, 0, 0);
               var green = cc.color(0, 255, 0);
               var blue = cc.color(0, 0, 255);
               /*モンスト風
               vertices = [
                 cc.p(0,50),
                 cc.p(-20,0),
                 cc.p(-8,10),
                 cc.p(0,-50),
                 cc.p(8,10),
                 cc.p(20,0),
               ];*/
               vertices = [
                 cc.p(0,0),
                 cc.p(-20,-50),
                 cc.p(-8,-40),
                 cc.p(0,-100),
                 cc.p(8,-40),
                 cc.p(20,-50),
               ];
               polygon = new cc.DrawNode();
               polygon.drawPoly(vertices, red,1,green);
               polygon.setScale(0.5);
               topLayer.addChild(polygon);
               polygon.setPosition(shape.body.getPosition().x,shape.body.getPosition().y);
               touching = true;
               return true;
            }
         }
      }
      // 何も無い場所をタップしたときは箱を追加する
      //gameLayer.addBody(pos.x,pos.y,24,24,true,res.brick1x1_png,SpriteTag.destroyable);
      return;

   },
   onTouchMoved: function(touch,event){
     touchEnd.setPosition(touch.getLocation().x, touchEnd.getPosition().y);
     touchEnd.setPosition(touchEnd.getPosition().x, touch.getLocation().y);
   },
   onTouchEnded: function(touch, event){
     topLayer.removeChild(touchOrigin);
     topLayer.removeChild(touchEnd);
     topLayer.removeChild(polygon);

     //var body = face.getBody();
     //console.log(body);
     //『body』に力を加えます
     face.applyImpulse(cp.v((face.getPosition().x-touchEnd.getPosition().x),
     (face.getPosition().y-touchEnd.getPosition().y)+(face.getPosition().y-touchEnd.getPosition().y)),cp.v(0,0));
     shot -= 1;
     clearTimeout(stop);
     touching = false;
   },

});

/*
var touchListener = cc.EventListener.create({
    event: cc.EventListener.TOUCH_ONE_BY_ONE,
    onTouchBegan: function (touch, event) {
        for(var i=shapeArray.length-1;i>=0;i--){
            if(shapeArray[i].pointQuery(cp.v(touch.getLocation().x,touch.getLocation().y))!=undefined){
                if(shapeArray[i].name== SpriteTag.destroyable ){
                    gameLayer.removeChild(shapeArray[i].image);
                    world.removeBody(shapeArray[i].getBody())
                    world.removeShape(shapeArray[i])
                    shapeArray.splice(i,1);
                }
            }
        }
    }
});
*/
