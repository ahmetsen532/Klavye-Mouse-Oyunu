/* Shared by the browser and the deterministic game-rule tests. */
(function(root){
 const levels={easy:{radius:32,lifetime:2.6,speed:.65},medium:{radius:25,lifetime:1.8,speed:1},hard:{radius:18,lifetime:1.15,speed:1.45}};
 class MouseRound {
  constructor({mode='click',difficulty='medium',duration=60,width=900,height=500,random=Math.random}={}){
   this.mode=mode==='track'?'track':'click';this.level={...(levels[difficulty]||levels.medium)};if(this.mode==='track'&&difficulty==='hard')Object.assign(this.level,{radius:23,speed:1.12});
   this.duration=[30,60,90].includes(Number(duration))?Number(duration):60;
   this.random=random;this.elapsed=0;this.hits=0;this.misses=0;this.expired=0;this.onTarget=0;this.reactions=[];this.age=0;this.done=false;
   this.pointer={x:0,y:0,inside:false};this.resize(width,height);this.nextTarget();
  }
  resize(width,height){this.width=Math.max(100,width);this.height=Math.max(100,height);if(this.target){this.target.x=Math.max(40,Math.min(this.width-40,this.target.x));this.target.y=Math.max(40,Math.min(this.height-40,this.target.y));}}
  nextTarget(){
   const previous=this.target;let next;
   for(let i=0;i<12;i++){
    next={x:40+this.random()*(this.width-80),y:40+this.random()*(this.height-80)};
    if(!previous||Math.hypot(next.x-previous.x,next.y-previous.y)>Math.min(this.width,this.height)*.28)break;
   }
   this.target=next;this.age=0;
   if(this.mode==='track')this.moveTarget();
  }
  moveTarget(){const t=this.elapsed*this.level.speed;this.target={x:this.width/2+(this.width/2-45)*Math.sin(t*1.13),y:this.height/2+(this.height/2-45)*Math.sin(t*1.57+.6)};}
  contains(x,y){return Math.hypot(x-this.target.x,y-this.target.y)<=this.level.radius;}
  point(x,y,inside=true){this.pointer={x,y,inside};}
  click(x,y){
   if(this.done||this.mode!=='click')return null;
   if(this.contains(x,y)){this.hits++;this.reactions.push(this.age);this.nextTarget();return true;}
   this.misses++;return false;
  }
  tick(seconds){
   let remaining=Math.min(Math.max(0,seconds),this.duration-this.elapsed);
   while(remaining>1e-8&&!this.done){
    const step=Math.min(remaining,.02,this.mode==='click'?Math.max(1e-8,this.level.lifetime-this.age):Infinity);this.elapsed=Math.min(this.duration,this.elapsed+step);this.age+=step;remaining-=step;
    if(this.mode==='track'){
     this.moveTarget();if(this.pointer.inside&&this.contains(this.pointer.x,this.pointer.y))this.onTarget+=step;
    }else if(this.age>=this.level.lifetime-1e-8){this.expired++;this.nextTarget();}
    if(this.elapsed>=this.duration-1e-8){this.elapsed=this.duration;this.done=true;}
   }
  }
  results(){const attempts=this.hits+this.misses;return {hits:this.hits,misses:this.misses,expired:this.expired,accuracy:attempts?this.hits/attempts*100:null,reaction:this.reactions.length?this.reactions.reduce((a,b)=>a+b,0)/this.reactions.length*1000:null,rate:this.elapsed?this.hits/this.elapsed:0,tracking:this.elapsed?Math.min(100,this.onTarget/this.elapsed*100):0,onTarget:this.onTarget};}
 }
 if(typeof module!=='undefined'&&module.exports)module.exports={MouseRound,levels};else root.MouseRound=MouseRound;
})(typeof window!=='undefined'?window:globalThis);
