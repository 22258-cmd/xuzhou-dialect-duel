
/* ---------- 四声卡片 ---------- */
document.querySelectorAll('.tone').forEach(function(el){
  el.addEventListener('click', function(){
    var on = el.classList.contains('on');
    document.querySelectorAll('.tone').forEach(function(o){o.classList.remove('on');});
    if(!on) el.classList.add('on');
  });
});

/* ---------- 秤星 ---------- */
var starWrap = document.getElementById('stars');
var groups = [
  {n:7, label:'北斗七星 · 死'},
  {n:6, label:'南斗六星 · 生'},
  {n:3, label:'福 · 禄 · 寿'}
];
function buildStars(){
  starWrap.innerHTML = '';
  groups.forEach(function(g){
    var d = document.createElement('div');
    d.className = 'grp';
    for(var i=0;i<g.n;i++){
      var s = document.createElement('div');
      s.className = 'star';
      d.appendChild(s);
    }
    starWrap.appendChild(d);
  });
}
buildStars();
var shortCount = 0;
document.getElementById('btnShort').addEventListener('click', function(){
  var all = Array.prototype.slice.call(starWrap.querySelectorAll('.star:not(.off)'));
  if(!all.length) return;
  var last = all[all.length-1];
  last.classList.add('hit');
  setTimeout(function(){ last.classList.remove('hit'); last.classList.add('off'); }, 320);
  shortCount++;
  var beam = document.getElementById('beamG');
  beam.style.transform = 'rotate(' + (-4 - shortCount*3) + 'deg)';
});
document.getElementById('btnResetStar').addEventListener('click', function(){
  shortCount = 0;
  buildStars();
  document.getElementById('beamG').style.transform = 'rotate(-4deg)';
});

/* ---------- 试打一局 ---------- */
var G;
function resetGame(){
  G = {quote:128, floor:62, qi:16, mz:45, day:3, over:false, ban:false, told:false};
  document.getElementById('log').innerHTML = '<p>你站在摊前。他报了个“128”，秤杆翘着——<span class="hl">虚的</span>。</p>';
  document.getElementById('sayYou').textContent = '这黄子咋卖？';
  document.getElementById('sayHim').textContent = '进价就这个数，我真不挣你钱。';
  document.getElementById('btnBan').disabled = true;
  render();
}
function render(){
  document.getElementById('quote').textContent = G.quote;
  document.getElementById('qiLab').textContent = G.qi + ' / 16';
  document.getElementById('qiBar').style.width = (G.qi/16*100) + '%';
  document.getElementById('mzLab').textContent = G.mz;
  document.getElementById('mzBar').style.width = Math.max(0,G.mz) + '%';
  document.getElementById('gameState').textContent = '日头 ' + G.day + ' / 5';
  document.getElementById('floorLab').textContent = '底价 ' + G.floor;
  var tilt = -8 + (G.quote - G.floor) / (128 - G.floor) * 14;
  document.getElementById('beam').style.transform = 'rotate(' + tilt + 'deg)';
  document.getElementById('btnBan').disabled = !(G.ban && !G.over);
  document.getElementById('faceHim').textContent = G.qi <= 4 ? '软' : (G.qi <= 9 ? '绷' : '摊');
}
function log(t){
  var p = document.createElement('p');
  p.innerHTML = t;
  var box = document.getElementById('log');
  box.appendChild(p);
  box.scrollTop = box.scrollHeight;
}
function clamp(){
  if(G.qi < 0) G.qi = 0;
  if(G.qi > 16) G.qi = 16;
  if(G.mz < 0) G.mz = 0;
  if(G.mz > 100) G.mz = 100;
}
function checkEnd(){
  if(G.over) return;
  if(G.mz <= 0){
    G.over = true;
    log('<span class="hl">掉面儿了。</span>旁边看热闹的人笑了一声，你什么都没买就走了。这一集，输。');
  } else if(G.day >= 6){
    G.over = true;
    log('<span class="hl">收摊了。</span>他卷起帆布，你手里还是空的。时间是你唯一的敌人。');
  } else if(G.qi <= 2){
    G.ban = true;
    log('他眼神飘了一下，秤杆往下沉了点——<span class="hl">服软了</span>。「办肆」解锁。');
  }
}
function act(k){
  if(G.over) return;
  var bonus = G.mz >= 70 ? 1 : 0;
  if(k === 'c'){
    var q = 10 + bonus*4, d = 2 + bonus;
    G.quote -= q; G.qi -= d; G.mz -= 2;
    G.sayYou = '“' + (G.quote-14) + '，就这个数。”';
    G.sayHim = '“你这不是砍价，你这是抢。”';
    log('<span class="hl">沉底价</span> · 阴平213。你把价锚到 ' + (G.quote-8) + '，他心气 −' + d + '，价 −' + q + '。');
  } else if(k === 'd'){
    G.qi += 1; G.quote -= 2; G.mz += 8; G.day += 0.5;
    G.sayYou = '“嗯。128。”';
    G.sayHim = '“……你这人。”';
    log('<span class="hl">顶回去</span> · 阳平55。你不接话，只把数字原样顶回去。心气 +1，敞亮 +8，但日头走了一格。');
  } else if(k === 't'){
    G.qi -= 3; G.quote += 4; G.mz -= 6;
    G.sayYou = '“这黄子看着可不齐整啊。”';
    G.sayHim = '“哎你这话说的——那你说多少？”';
    log('<span class="hl">挑一句</span> · 上声35。他被架住了，心气 −3，但恼了，价往回抬 4，你掉了 6 点敞亮。');
  } else if(k === 'z'){
    if(G.qi <= 3){
      G.over = true;
      log('<span class="hl">一锤子。</span>掌落在秤盘上，他没再说话，装袋、递过来。成交价 ' + G.quote + '。');
    } else {
      G.qi -= 1; G.quote -= 4; G.mz -= 12;
      G.sayYou = '“不要了。”';
      G.sayHim = '“哎哎哎——回来回来。”';
      log('<span class="hl">一锤子</span> · 去声51。你转身就走。他心气 −1，价 −4，但你在众人面前掉了 12 点面子。');
    }
  } else if(k === 'b'){
    if(G.told){
      log('这句话一场只能用一次。再用，就成了咋呼。');
      render(); return;
    }
    G.told = true;
    G.qi -= 3; G.mz += 6; G.quote -= 8;
    G.sayYou = '“白Zao我。这价你虚了两成。”';
    G.sayHim = '“……你咋知道的。”';
    log('<span class="hl">白Zao我</span> · 拆穿虚高。虚的那两成原样弹回去：心气 −3，价 −8，敞亮 +6。');
  } else if(k === 'l'){
    G.qi += 2; G.mz += 4; G.day += 1;
    G.sayYou = '“大爷，今年这雨下得咋样？”';
    G.sayHim = '“旱。贵就贵在这上头。”';
    log('<span class="hl">拉呱</span> · 心气 +2，敞亮 +4，还问出了行情。但日头走了一格——你买的是时间。');
  } else if(k === 's'){
    G.qi += 2; G.quote += 8;
    G.sayYou = '“师傅，借您家伙校一下秤。”';
    G.sayHim = '“秤准着呢。”';
    log('<span class="hl">司维</span> · 补两颗秤星，但分了神，价又回去 8 —— 回血是要花钱的。');
  } else if(k === 'x'){
    if(G.qi <= 2 && !G.over){
      G.over = true;
      log('<span class="hl">“办肆！”</span>你竖了个大拇指。周围跟着喊了一声。秤砣落下，秤杆弹直——你按 ' + G.quote + ' 买走了。');
      G.mz = 100;
    }
  } else if(k === 'r'){
    resetGame(); return;
  }
  clamp();
  checkEnd();
  document.getElementById('sayYou').textContent = G.sayYou;
  document.getElementById('sayHim').textContent = G.sayHim;
  render();
}
document.querySelectorAll('.moves .btn').forEach(function(b){
  b.addEventListener('click', function(){ act(b.getAttribute('data-mv')); });
});
resetGame();
