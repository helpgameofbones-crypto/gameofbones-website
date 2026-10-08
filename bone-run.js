/* Bone Run: the Game of Bones endless-runner prize game (replaces the spin wheel).
   Tap/Space to jump, hold to jump higher. Milestones: 800 = 2 Goat Trachea,
   2,500 = Chicken Feet 70 g, 5,000 (max) = Mackerel Fillet 60 g. The prize is
   verified and saved by the admin API (/api/bone-run); gifts stack with coupons
   and reward points. Loaded lazily by conversion-extras.js. */
(() => {
  if (window.__gobBoneRun) return; window.__gobBoneRun = true;
  // Prizes count only once claimed with the form; drop any unclaimed leftovers.
  try {
    localStorage.removeItem('gob-bonerun-pending');
    const a = JSON.parse(localStorage.getItem('gob-bonerun-award') || 'null');
    if (a && !a.claimed) localStorage.removeItem('gob-bonerun-award');
  } catch (_) {}
  const style = document.createElement('style'); style.id = 'br-style';
  style.textContent = `/* ---------- Game modal ---------- */
.br-modal{--g900:#0a1f17;--g800:#102c22;--g700:#173a2d;--g600:#1f4a39;--gold:#c9963a;--gold2:#e7c27a;--gold3:#f6dfa6;--cream:#f6efe2;--ink:#102c22;--serif:"Fraunces",Georgia,"Times New Roman",serif;--sans:"DM Sans",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;font-family:var(--sans);color:var(--cream);text-align:left;line-height:1.4}
.br-modal *{box-sizing:border-box}

.br-modal{position:fixed;inset:0;z-index:50;display:none;align-items:center;justify-content:center;padding:14px;
  background:radial-gradient(ellipse at center,rgba(10,31,23,.72),rgba(5,15,11,.88));backdrop-filter:blur(4px)}
.br-modal.br-open{display:flex;animation:fade .25s ease}
@keyframes fade{from{opacity:0}to{opacity:1}}
.br-card{position:relative;width:min(720px,100%);border-radius:24px;overflow:hidden;color:var(--cream);
  background:linear-gradient(180deg,var(--g700),var(--g900));box-shadow:0 40px 80px rgba(0,0,0,.5),inset 0 0 0 1px rgba(231,194,122,.35);
  animation:pop .35s cubic-bezier(.2,1.3,.4,1)}
@keyframes pop{from{transform:translateY(16px) scale(.97);opacity:0}to{transform:none;opacity:1}}
.br-card::before{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at 85% -10%,rgba(231,194,122,.18),transparent 45%)}
.br-close{position:absolute;right:14px;top:12px;z-index:5;width:34px;height:34px;border-radius:50%;border:0;cursor:pointer;
  background:rgba(255,255,255,.08);color:var(--cream);font-size:20px;line-height:34px}
.br-close:hover{background:rgba(255,255,255,.16)}
.br-head{display:flex;align-items:center;gap:12px;padding:16px 20px 12px}
.br-head img{height:42px;filter:drop-shadow(0 2px 6px rgba(0,0,0,.35))}
.br-brand{font-family:var(--serif);font-size:26px;font-weight:700;line-height:1;
  background:linear-gradient(180deg,var(--gold3),var(--gold) 70%);-webkit-background-clip:text;background-clip:text;color:transparent}
.br-brand small{display:block;font-family:var(--sans);font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:rgba(246,239,226,.65);-webkit-text-fill-color:rgba(246,239,226,.65);margin-top:6px;font-weight:700}

.br-stage{position:relative;margin:0 14px;border-radius:18px;overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none;
  box-shadow:inset 0 0 0 1px rgba(231,194,122,.28),0 14px 30px rgba(0,0,0,.35);cursor:pointer}
.br-modal canvas{display:block;width:100%;height:auto;aspect-ratio:900/380}
.br-hud{position:absolute;top:12px;left:12px;right:12px;display:flex;justify-content:space-between;pointer-events:none}
.br-chip{display:flex;align-items:baseline;gap:6px;padding:7px 13px;border-radius:12px;background:rgba(10,31,23,.45);backdrop-filter:blur(8px);
  box-shadow:inset 0 0 0 1px rgba(231,194,122,.35);color:var(--cream)}
.br-chip b{font-family:var(--serif);font-size:24px;line-height:1;font-variant-numeric:tabular-nums}
.br-chip span{font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;opacity:.7;font-weight:700}
.br-chip.br-best b{font-size:17px;color:var(--gold2)}

.br-unlock{position:absolute;left:50%;top:26%;transform:translate(-50%,-10px) scale(.9);opacity:0;pointer-events:none;text-align:center;
  padding:12px 20px;border-radius:16px;background:linear-gradient(135deg,rgba(16,44,34,.92),rgba(10,31,23,.92));
  box-shadow:0 18px 40px rgba(0,0,0,.4),inset 0 0 0 1.5px var(--gold);transition:all .35s cubic-bezier(.2,1.3,.4,1)}
.br-unlock.br-show{opacity:1;transform:translate(-50%,0) scale(1)}
.br-unlock small{display:block;font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:var(--gold2);font-weight:800}
.br-unlock b{display:block;font-family:var(--serif);font-size:20px;margin-top:4px}
.br-unlock span{display:block;font-size:12px;opacity:.75;margin-top:2px}

.br-ov{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:10px;padding:18px;
  background:linear-gradient(180deg,rgba(10,31,23,.55),rgba(10,31,23,.85));backdrop-filter:blur(3px)}
.br-ov[hidden]{display:none}
.br-ov h3{margin:0;font-family:var(--serif);font-size:34px;line-height:1.05;font-weight:700;
  background:linear-gradient(180deg,#fff7e3,var(--gold2) 80%);-webkit-background-clip:text;background-clip:text;color:transparent}
.br-ov p{margin:0;font-size:14px;max-width:420px;color:rgba(246,239,226,.85)}
.br-big{font-family:var(--serif);font-size:54px;line-height:1;font-weight:700;color:var(--cream);font-variant-numeric:tabular-nums}
.br-big small{display:block;font-family:var(--sans);font-size:11px;letter-spacing:.2em;color:var(--gold2);margin-top:6px;font-weight:800}
.br-hint{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}
.br-hint span{font-size:12px;padding:6px 10px;border-radius:999px;background:rgba(255,255,255,.08);box-shadow:inset 0 0 0 1px rgba(231,194,122,.3)}
.br-btn{position:relative;overflow:hidden;border:0;cursor:pointer;border-radius:999px;padding:14px 26px;font:800 15px/1 var(--sans);letter-spacing:.02em;
  color:var(--g900);background:linear-gradient(180deg,var(--gold3),var(--gold) 75%);box-shadow:0 10px 22px rgba(201,150,58,.35),inset 0 1px 0 rgba(255,255,255,.6)}
.br-btn::after{content:"";position:absolute;top:0;bottom:0;width:40%;left:-60%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.55),transparent);animation:shine 2.8s ease-in-out infinite}
@keyframes shine{0%,60%{left:-60%}100%{left:130%}}
.br-btn.br-ghost{background:transparent;color:var(--cream);box-shadow:inset 0 0 0 1.5px rgba(246,239,226,.5)}
.br-btn.br-ghost::after{display:none}
.br-row{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}
.br-wonprize{display:flex;align-items:center;gap:12px;padding:10px 16px 10px 10px;border-radius:14px;background:rgba(231,194,122,.12);box-shadow:inset 0 0 0 1px rgba(231,194,122,.5)}
.br-wonprize .br-m{width:42px;height:42px;border-radius:50%;display:grid;place-items:center;font-size:20px;background:radial-gradient(circle at 35% 30%,var(--gold3),var(--gold) 62%,#93681f)}
.br-wonprize b{display:block;text-align:left;font-size:14px}.br-wonprize span{display:block;text-align:left;font-size:12px;opacity:.75}

/* milestone rail */
.br-rail{position:relative;margin:22px 34px 6px;height:8px;border-radius:99px;background:rgba(255,255,255,.1);box-shadow:inset 0 1px 2px rgba(0,0,0,.4)}
.br-rail i{position:absolute;left:0;top:0;bottom:0;width:0;border-radius:99px;background:linear-gradient(90deg,#9a6e22,var(--gold) 40%,var(--gold3));box-shadow:0 0 12px rgba(231,194,122,.55);transition:width .12s linear}
.br-ms{position:absolute;top:50%;transform:translate(-50%,-50%);text-align:center}
.br-ms .br-m{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;font-size:16px;margin:0 auto;
  background:var(--g800);box-shadow:inset 0 0 0 2px rgba(246,239,226,.25);filter:grayscale(1);opacity:.75;transition:all .3s}
.br-ms.br-got .br-m{filter:none;opacity:1;background:radial-gradient(circle at 35% 30%,var(--gold3),var(--gold) 62%,#93681f);box-shadow:0 0 0 4px rgba(231,194,122,.25),0 0 18px rgba(231,194,122,.7);transform:scale(1.08)}
.br-ms .br-t{position:absolute;top:40px;left:50%;transform:translateX(-50%);white-space:nowrap;font-size:11px;line-height:1.25;color:rgba(246,239,226,.65)}
.br-ms .br-t b{display:block;font-size:12px;color:var(--cream)}
.br-ms.br-got .br-t b{color:var(--gold2)}
.br-ms:last-child .br-t{left:auto;right:-6px;transform:none;text-align:right}
.br-foot{padding:52px 20px 18px;font-size:11.5px;color:rgba(246,239,226,.6);text-align:center}
.br-foot b{color:var(--gold2);font-weight:700}

/* claim + done panels */
.br-panel{display:none;padding:6px 22px 22px}
.br-panel.br-show{display:block;animation:pop .35s cubic-bezier(.2,1.3,.4,1)}
.br-panel h3{margin:4px 0 4px;font-family:var(--serif);font-size:30px;background:linear-gradient(180deg,#fff7e3,var(--gold2) 80%);-webkit-background-clip:text;background-clip:text;color:transparent}
.br-panel .br-sub{font-size:13px;color:rgba(246,239,226,.75);margin-bottom:14px}
.br-prizecard{display:flex;align-items:center;gap:14px;padding:14px;border-radius:16px;margin-bottom:16px;
  background:linear-gradient(135deg,rgba(231,194,122,.18),rgba(231,194,122,.05));box-shadow:inset 0 0 0 1px rgba(231,194,122,.55)}
.br-prizecard .br-m{flex:0 0 58px;height:58px;border-radius:50%;display:grid;place-items:center;font-size:27px;background:radial-gradient(circle at 35% 30%,var(--gold3),var(--gold) 62%,#93681f);box-shadow:0 0 22px rgba(231,194,122,.55)}
.br-prizecard b{display:block;font-family:var(--serif);font-size:19px}
.br-prizecard span{display:block;font-size:12.5px;opacity:.8;margin-top:3px}
.br-field{position:relative;margin-bottom:10px}
.br-field input{width:100%;padding:20px 14px 8px;border-radius:12px;border:0;font:500 15px var(--sans);background:rgba(255,255,255,.95);color:var(--ink);outline:none;box-shadow:inset 0 0 0 1.5px transparent;transition:box-shadow .2s}
.br-field input:focus{box-shadow:inset 0 0 0 2px var(--gold)}
.br-field label{position:absolute;left:14px;top:6px;font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:#7d6a45;font-weight:800;pointer-events:none}
.br-consent{display:flex;gap:9px;align-items:flex-start;font-size:12px;margin:12px 0 14px;color:rgba(246,239,226,.8)}
.br-consent input{margin-top:2px;accent-color:var(--gold)}
.br-small{font-size:11.5px;color:rgba(246,239,226,.6);margin-top:10px;text-align:center}
.br-w100{width:100%}
@media (max-width:560px){
  .br-modal .br-card{display:flex;flex-direction:column;justify-content:center;max-height:100dvh;padding-bottom:env(safe-area-inset-bottom)}
  .br-head{padding:14px 56px 10px 14px}.br-head img{height:34px}.br-brand{font-size:22px}.br-brand small{font-size:9.5px;letter-spacing:.14em}
  .br-ov{gap:7px;padding:12px}.br-ov p{font-size:12.5px}.br-hint{display:none}
  .br-ov .br-btn{padding:12px 20px;font-size:14px}
  .br-chip{padding:5px 10px}.br-chip b{font-size:19px}.br-chip.br-best b{font-size:14px}
  .br-wonprize{padding:6px 10px 6px 6px}.br-wonprize .br-m{width:34px;height:34px;font-size:16px}
  .br-unlock{top:22%;padding:9px 14px}.br-unlock b{font-size:16px}
  .br-foot{padding:46px 14px 14px;font-size:10.5px}
  .br-panel{padding:4px 16px 18px}.br-panel h3{font-size:24px}
  .br-modal{padding:0;align-items:stretch}
  .br-card{border-radius:0;width:100%;min-height:100%}
  .br-stage{margin:0 10px;border-radius:14px}
  .br-ov h3{font-size:26px}.br-big{font-size:42px}
  .br-rail{margin:22px 26px 6px}
  .br-ms .br-t{font-size:10px}.br-ms .br-t b{font-size:11px}
}

.br-goal{position:absolute;left:50%;top:12px;transform:translateX(-50%);padding:6px 12px;border-radius:999px;font-size:12px;font-weight:700;white-space:nowrap;
  background:rgba(10,31,23,.55);backdrop-filter:blur(8px);box-shadow:inset 0 0 0 1px rgba(231,194,122,.45);color:var(--cream);pointer-events:none;transition:transform .2s}
.br-goal.br-near{background:linear-gradient(135deg,#c9963a,#e7c27a);color:#0a1f17;animation:brpulse .7s ease-in-out infinite alternate}
@keyframes brpulse{to{transform:translateX(-50%) scale(1.07)}}
.br-combo{position:absolute;left:12px;top:56px;padding:4px 10px;border-radius:10px;font:800 13px var(--sans);color:#0a1f17;background:linear-gradient(180deg,#f6dfa6,#c9963a);
  box-shadow:0 6px 14px rgba(0,0,0,.3);opacity:0;transform:scale(.8);transition:all .2s;pointer-events:none}
.br-combo.br-show{opacity:1;transform:scale(1)}
.br-shield{position:absolute;right:12px;top:56px;padding:4px 10px;border-radius:10px;font:800 12px var(--sans);background:rgba(120,190,255,.25);color:#e8f4ff;box-shadow:inset 0 0 0 1px rgba(160,210,255,.6);opacity:0;transition:opacity .2s;pointer-events:none}
.br-shield.br-show{opacity:1}
.br-mute{position:absolute;right:12px;bottom:10px;z-index:3;width:32px;height:32px;border-radius:50%;border:0;cursor:pointer;background:rgba(10,31,23,.5);color:var(--cream);font-size:15px;box-shadow:inset 0 0 0 1px rgba(231,194,122,.35)}
.br-cta{display:flex;align-items:center;gap:10px;justify-content:center;margin:12px 14px 0;padding:11px 14px;border-radius:14px;font-size:13px;font-weight:700;
  background:linear-gradient(135deg,rgba(231,194,122,.22),rgba(231,194,122,.08));box-shadow:inset 0 0 0 1px rgba(231,194,122,.55);color:var(--cream);cursor:pointer;border:0;width:calc(100% - 28px)}
.br-cta b{color:var(--gold2)}
.br-cta[hidden]{display:none}
.br-tiers{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:10px 0 0;width:100%;max-width:440px}
.br-tiers div{padding:7px 6px;border-radius:12px;background:rgba(255,255,255,.07);box-shadow:inset 0 0 0 1px rgba(231,194,122,.25);font-size:11px;line-height:1.3}
.br-tiers b{display:block;font-size:15px}
.br-tiers em{display:block;font-style:normal;color:var(--gold2);font-weight:700;font-size:10px;margin-top:2px}
@media (max-width:560px){.br-tiers{display:none}.br-goal{top:48px;font-size:11px}.br-combo{top:84px}.br-shield{top:84px}.br-tiers div{font-size:10px}.br-tiers b{font-size:13px}.br-cta{font-size:12px}}
.br-count{position:absolute;inset:0;display:grid;place-items:center;pointer-events:none;font-family:var(--serif);font-weight:700;font-size:96px;color:#fff7e3;text-shadow:0 8px 30px rgba(0,0,0,.45)}
.br-count[hidden]{display:none}
.br-count span{animation:brcount .8s ease-out both}
@keyframes brcount{from{transform:scale(1.8);opacity:0}30%{opacity:1}to{transform:scale(.9);opacity:.9}}
.br-pause{position:absolute;left:12px;bottom:10px;z-index:3;width:32px;height:32px;border-radius:50%;border:0;cursor:pointer;background:rgba(10,31,23,.5);color:var(--cream);font-size:13px;box-shadow:inset 0 0 0 1px rgba(231,194,122,.35)}
.br-tiers img,.br-prizecard img.br-pimg{display:block;border-radius:12px;object-fit:cover;background:#f6efe2}
.br-tiers img{width:100%;height:58px;margin-bottom:6px}
.br-prizecard img.br-pimg{flex:0 0 64px;width:64px;height:64px;box-shadow:0 0 0 2px rgba(231,194,122,.7),0 0 22px rgba(231,194,122,.45)}
.br-prizecard img.br-pimg[hidden]{display:none}
.br-next{width:100%;max-width:360px}
.br-next .br-bar{height:8px;border-radius:99px;background:rgba(255,255,255,.12);overflow:hidden;margin-top:6px}
.br-next .br-bar i{display:block;height:100%;background:linear-gradient(90deg,#9a6e22,var(--gold3));border-radius:99px;transition:width .8s cubic-bezier(.2,1,.3,1)}
.br-next small{display:block;font-size:12px;color:rgba(246,239,226,.8)}
.br-newbest{display:inline-block;margin-bottom:2px;padding:4px 10px;border-radius:999px;font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;background:linear-gradient(180deg,#f6dfa6,#c9963a);color:#0a1f17;animation:brpop .5s cubic-bezier(.2,1.6,.4,1)}
@keyframes brpop{from{transform:scale(.4);opacity:0}to{transform:none;opacity:1}}
.br-newbest[hidden]{display:none}
.br-linkbtn{background:none;border:0;color:var(--gold2);font:700 13px var(--sans);text-decoration:underline;text-underline-offset:3px;cursor:pointer;padding:6px}
.br-linkbtn[hidden]{display:none}
.br-skipnote{font-size:11.5px;color:rgba(246,239,226,.65);text-align:center;margin-top:6px}
@media (max-width:560px){.br-card.br-running .br-head{display:none}.br-card.br-running .br-stage{margin-top:12px}.br-count{font-size:72px}.br-tiers img{height:44px}}
@media (prefers-reduced-motion:reduce){.br-count span,.br-newbest,.br-goal.br-near{animation:none}}
.br-err{margin:0 0 10px;padding:9px 11px;border-radius:10px;background:rgba(178,58,46,.18);color:#ffd9d2;font-size:12.5px}
body.br-lock{overflow:hidden}
.br-modal .br-card{max-height:calc(100dvh - 28px);overflow-y:auto}
.br-modal button{font-family:inherit}
.br-modal h3{letter-spacing:0}
`;
  document.head.append(style);
  document.body.insertAdjacentHTML('beforeend', `<div class="br-modal" id="br-modal" role="dialog" aria-modal="true" aria-label="Bone Run">
  <div class="br-card">
    <button class="br-close" id="br-closeGame" aria-label="Close">×</button>
    <div class="br-head"><img src="/assets/gob-logo.png" alt=""><div class="br-brand">Bone Run<small>Tap to jump · hold to jump higher</small></div></div>

    <div id="br-playArea">
      <div class="br-stage" id="br-stage">
        <canvas id="br-cv"></canvas>
        <div class="br-hud">
          <div class="br-chip"><b id="br-score">0</b><span>pts</span></div>
          <div class="br-chip br-best"><span>best</span><b id="br-best">0</b></div>
        </div>
        <div class="br-goal" id="br-goal">Next: 🦴 2 Goat Trachea at 800</div>
        <div class="br-combo" id="br-combo">x2 combo</div>
        <div class="br-shield" id="br-shieldTag">🧸 Shield on</div>
        <button class="br-mute" id="br-mute" aria-label="Sound on or off">🔊</button>
        <button class="br-pause" id="br-pauseBtn" aria-label="Pause" hidden>❚❚</button>
        <div class="br-count" id="br-count" hidden aria-live="assertive"></div>
        <div class="br-ov" id="br-pauseOv" hidden><h3>Paused</h3><p>Take a breather. Bambi will wait.</p><button class="br-btn" id="br-resumeBtn">▶ Resume</button></div>
        <div class="br-unlock" id="br-unlock"><small>Prize unlocked</small><b id="br-unlockName">2 Goat Trachea</b><span>Keep running for a bigger one</span></div>

        <div class="br-ov" id="br-startOv">
          <h3>Help Bambi outrun<br>bath time.</h3>
          <p>Dodge the vacuum, the tub and the vet's cone. Grab bones in a row for combos. Every milestone unlocks a free treat.</p>
          <div class="br-hint"><span>👆 Tap = jump</span><span>👆👆 Tap again = double jump</span><span>🦴 Bone +25 · combos x3</span><span>✨ Gold bone +100</span><span>🧸 Toy = shield</span></div>
          <div class="br-tiers"><div><img src="/assets/catalogue-plates/goat-trachea.webp" alt="" loading="lazy"><b>🦴 800</b>2 Goat Trachea<em>free with any order</em></div><div><img src="https://syuostlqzzinigqwjzap.supabase.co/storage/v1/object/public/product-images/cac553a3-463f-4cf6-92dd-48c054f82bfe/image-0-1782712513139.png" alt="" loading="lazy"><b>🐾 2,500</b>Chicken Feet 70 g<em>orders ₹499+</em></div><div><img src="/assets/catalogue-plates/mackerel-fillet.webp" alt="" loading="lazy"><b>🐟 5,000</b>Mackerel 60 g<em>orders ₹499+</em></div></div>
          <button class="br-btn" id="br-claimStart" hidden>🎁 Claim my free treat</button><button class="br-btn" id="br-startBtn">Start running</button>
        </div>

        <div class="br-ov" id="br-overOv" hidden>
          <span class="br-newbest" id="br-newBest" hidden>🏅 New best</span>
          <div class="br-big" id="br-finalScore">0<small>POINTS</small></div>
          <h3 id="br-overTitle" style="font-size:24px">Cone of shame!</h3>
          <div class="br-wonprize" id="br-wonBox" hidden><span class="br-m" id="br-wonIcon">🦴</span><div><b id="br-wonName">2 free Goat Trachea</b><span id="br-wonNote">Unlocked this run</span></div></div>
          <p id="br-overText"></p>
          <div class="br-next" id="br-next" hidden><small id="br-nextText"></small><div class="br-bar"><i id="br-nextFill" style="width:0"></i></div></div>
          <div class="br-row"><button class="br-btn" id="br-claimBtn" hidden>Claim my treat</button><button class="br-btn br-ghost" id="br-againBtn">Run again</button></div>
          <button class="br-btn br-ghost" id="br-orderBtn" hidden style="margin-top:2px">🛒 Place your order &amp; get your free treat</button>
          <button class="br-linkbtn" id="br-skipOver" hidden>Skip the form · claim it at checkout</button>
        </div>
      </div>

      <div class="br-rail" id="br-rail"><i id="br-railFill"></i>
        <div class="br-ms" id="br-m1" style="left:16%"><div class="br-m">🦴</div><div class="br-t"><b>800</b>2 Goat Trachea</div></div>
        <div class="br-ms" id="br-m2" style="left:50%"><div class="br-m">🐾</div><div class="br-t"><b>2,500</b>Chicken Feet 70 g</div></div>
        <div class="br-ms" id="br-m3" style="left:100%"><div class="br-m">🐟</div><div class="br-t"><b>5,000</b>Mackerel Fillet 60 g</div></div>
      </div>
      <button class="br-cta" id="br-heldCta" hidden></button>
      <div class="br-foot">🦴 Goat Trachea is free with <b>any order</b> · 🐾 🐟 bigger prizes free on orders ₹499+ · valid 7 days · one prize per customer · <b>works with coupons &amp; reward points</b></div>
    </div>

    <div class="br-panel" id="br-claimPanel">
      <h3>It's yours! 🎉</h3>
      <div class="br-sub" id="br-claimSub">Best run: 2,612 points</div>
      <div class="br-prizecard"><img class="br-pimg" id="br-claimImg" alt="" hidden><span class="br-m" id="br-claimIcon">🐾</span><div><b id="br-claimName">1 free pack of Chicken Feet (70 g)</b><span id="br-claimNote">Added at ₹0 to your next order · valid 7 days · works with coupons &amp; reward points</span></div></div>
      <form id="br-claimForm">
        <div class="br-field"><label>Name</label><input name="name" required maxlength="100" autocomplete="name"></div>
        <div class="br-field"><label>Email</label><input name="email" type="email" required autocomplete="email"></div>
        <div class="br-field"><label>Mobile number</label><input name="phone" type="tel" required inputmode="numeric" pattern="[0-9]{10}" autocomplete="tel" placeholder="10 digits"></div>
        <label class="br-consent"><input name="marketing_consent" type="checkbox" value="true" required> Email me my free treat details and occasional Game of Bones news. I can unsubscribe anytime.</label>
        <p class="br-err" id="br-claimErr" role="alert" hidden></p><button class="br-btn br-w100" id="br-claimSubmit">Claim my free treat</button><button type="button" class="br-btn br-ghost br-w100" id="br-claimSkip" style="margin-top:8px">⏭ Skip · claim it at checkout</button>
        <div class="br-skipnote">Skip the form: your prize is added automatically when you place your order on this device.</div>
        <button type="button" class="br-linkbtn" id="br-claimLater" style="display:block;margin:6px auto 0">Keep playing</button>
        <div class="br-small">Use the same mobile number or email at checkout and it's added automatically.</div>
      </form>
    </div>

    <div class="br-panel" id="br-donePanel">
      <h3 id="br-doneTitle">Saved. Treat time! 🐾</h3>
      <div class="br-sub" id="br-doneSub">We have emailed your free treat details.</div>
      <div class="br-prizecard"><img class="br-pimg" id="br-doneImg" alt="" hidden><span class="br-m" id="br-doneIcon">🐾</span><div><b id="br-doneName">1 free pack of Chicken Feet (70 g)</b><span id="br-doneNote">It will be added at ₹0 to your next order of ₹499+ in the next 7 days. Use any coupon code and your reward points too.</span></div></div>
      <div class="br-row"><button class="br-btn" id="br-shopBtn">🛒 Place my order now</button><button class="br-btn br-ghost" id="br-playMore">Run again to upgrade</button></div>
      <div class="br-small" id="br-doneHint">Your free treat is waiting. Order today so it ships with your treats.</div>
    </div>
  </div>
</div>`);

  // ================= config =================
  // Phones get a narrower world so everything is drawn bigger; speed and
  // scoring are scaled so points per second stay the same.
  const MOBILE = Math.min(window.innerWidth || 900, (window.screen && screen.width) || 900) < 640;
  const W = MOBILE ? 560 : 900, H = 380, GROUND = 312, MAX = 5000;
  const SPEED_K = MOBILE ? 0.8 : 1, PTS_DIV = MOBILE ? 8 : 10;
  const tiers = [
    { at: 800,  name: '2 free Goat Trachea', short: '2 Goat Trachea', icon: '🦴', min: 0, img: '/assets/catalogue-plates/goat-trachea.webp' },
    { at: 2500, name: '1 free pack of Chicken Feet (70 g)', short: 'Chicken Feet (70 g)', icon: '🐾', min: 499, img: 'https://syuostlqzzinigqwjzap.supabase.co/storage/v1/object/public/product-images/cac553a3-463f-4cf6-92dd-48c054f82bfe/image-0-1782712513139.png' },
    { at: 5000, name: '1 free pack of Mackerel Fillet (60 g)', short: 'Mackerel Fillet (60 g)', icon: '🐟', min: 499, img: '/assets/catalogue-plates/mackerel-fillet.webp' },
  ];
  const $ = id => document.getElementById('br-' + id);
  const minText = tier => tier && tier.min > 0 ? 'your next order of ₹' + tier.min + '+' : 'any order, no minimum';
  const tierByName = name => tiers.find(x => x.name === name);
  const setPrizeImg = (id, tier) => { const im = $(id); if (!im) return; if (tier && tier.img) { im.src = tier.img; im.hidden = false; } else im.hidden = true; };
  const reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cv = $('cv'), ctx = cv.getContext('2d');
  const DPR = Math.min(2, window.devicePixelRatio || 1);
  cv.style.aspectRatio = W + ' / ' + H;
  cv.width = W * DPR; cv.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

  let state = 'idle', raf = 0, best = 0, bestTier = -1, runTier = -1, unlockTimer = 0, runStart = 0, bestRun = null;
  try { best = Math.max(0, Number(localStorage.getItem('gob-bonerun-best')) || 0); } catch (_) {}
  // A won-but-unclaimed prize survives closing the game or changing page, so
  // a mis-click never loses it. It only counts once the form is submitted.
  const UNCLAIMED = 'gob-bonerun-unclaimed';
  function unclaimed() {
    try { const u = JSON.parse(localStorage.getItem(UNCLAIMED) || 'null'); return u && u.tier >= 0 && Date.now() - Number(u.at || 0) < 7 * 864e5 ? u : null; } catch (_) { return null; }
  }
  function setUnclaimed(u) { try { u ? localStorage.setItem(UNCLAIMED, JSON.stringify(u)) : localStorage.removeItem(UNCLAIMED); } catch (_) {} refreshClaimUi(); }
  { const u = unclaimed(); if (u) { bestTier = u.tier; bestRun = { score: u.score, ms: u.ms }; } }
  let dog, obs, bones, parts, speed, dist, score, bonus, spawnIn, boneIn, last, t, holding, shake, flash;
  let combo = 0, comboTimer = 0, shield = false, toyIn = 0, toys = [], invuln = 0, speedLevel = 0, airJumps = 0;
  // ---- tiny synth sounds (no files). Off until the first tap; mute button in the corner.
  let muted = false; try { muted = localStorage.getItem('gob-bonerun-muted') === '1'; } catch (_) {}
  let actx = null;
  function beep(f, d = 0.09, type = 'sine', vol = 0.06, slide = 0) {
    if (muted) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const o = actx.createOscillator(), g = actx.createGain(), n = actx.currentTime;
      o.type = type; o.frequency.setValueAtTime(f, n); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, f + slide), n + d);
      g.gain.setValueAtTime(vol, n); g.gain.exponentialRampToValueAtTime(0.0001, n + d);
      o.connect(g); g.connect(actx.destination); o.start(n); o.stop(n + d + 0.02);
    } catch (_) {}
  }
  const sfx = {
    jump: () => beep(420, 0.1, 'square', 0.035, 260),
    bone: k => beep(660 + k * 120, 0.08, 'triangle', 0.06),
    gold: () => { beep(880, 0.08, 'triangle', 0.07); setTimeout(() => beep(1320, 0.12, 'triangle', 0.07), 70); },
    toy: () => beep(520, 0.18, 'sine', 0.07, 400),
    block: () => beep(300, 0.2, 'sawtooth', 0.05, -150),
    crash: () => beep(180, 0.35, 'sawtooth', 0.06, -120),
    win: () => [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, 0.14, 'triangle', 0.07), i * 90)),
  };

  // ================= world layers (pre-generated) =================
  const rand = (a, b) => a + Math.random() * (b - a);
  const hills = Array.from({ length: 8 }, (_, i) => ({ x: i * 180, h: rand(40, 90), w: rand(160, 260) }));
  const trees = Array.from({ length: 10 }, (_, i) => ({ x: i * 120 + rand(0, 60), h: rand(38, 70), k: Math.random() < .25 ? 'lamp' : 'tree' }));
  const stars = Array.from({ length: 40 }, () => ({ x: rand(0, W), y: rand(8, 150), r: rand(.5, 1.6), p: rand(0, 6) }));

  function reset() {
    dog = { x: 120, y: GROUND, vy: 0, onGround: true, run: 0, squash: 0 };
    obs = []; bones = []; parts = [];
    speed = 6 * SPEED_K; dist = 0; score = 0; bonus = 0; spawnIn = 420; boneIn = 90; t = 0; holding = false; shake = 0; flash = 0; runTier = -1;
    combo = 0; comboTimer = 0; shield = false; toyIn = 900; toys = []; invuln = 0; speedLevel = 0; airJumps = 0;
    if ($('combo')) { $('combo').classList.remove('br-show'); $('shieldTag').classList.remove('br-show'); }
    last = performance.now();
  }

  // ================= input =================
  function press() {
    if (state !== 'run') return;
    holding = true;
    if (dog.onGround) {
      dog.vy = -12.4; dog.onGround = false; dog.squash = -0.18; airJumps = 1;
      puff(dog.x + 10, GROUND, 6, '#e9dcc0'); sfx.jump(); try { navigator.vibrate && navigator.vibrate(8); } catch (_) {}
    } else if (airJumps > 0) {
      // second jump in mid-air
      airJumps = 0; dog.vy = -10.2; dog.squash = -0.14;
      puff(dog.x + 30, dog.y - 10, 8, '#f6dfa6'); sfx.jump();
    }
  }
  function release() { holding = false; if (dog.vy < -5) dog.vy = -5; }

  // ================= particles =================
  function puff(x, y, n, color) {
    for (let i = 0; i < n; i++) parts.push({ x, y, vx: rand(-2.2, -0.4), vy: rand(-1.6, -0.2), r: rand(2, 5), life: rand(18, 30), max: 30, color, g: 0.02 });
  }
  function floatText(x, y, text, big) { parts.push({ x, y, vx: 0, vy: big ? -0.7 : -0.9, life: big ? 70 : 46, max: big ? 70 : 46, text, big, g: 0 }); }
  function sparkle(x, y, label) {
    for (let i = 0; i < 16; i++) { const a = Math.PI * 2 * i / 16; parts.push({ x, y, vx: Math.cos(a) * rand(1.5, 3.5), vy: Math.sin(a) * rand(1.5, 3.5), r: rand(1.5, 3), life: 32, max: 32, color: i % 2 ? '#f6dfa6' : '#c9963a', g: 0.05, star: true }); }
    parts.push({ x, y: y - 6, vx: 0, vy: -0.9, life: 46, max: 46, text: label || '+25', g: 0 });
  }
  function confetti() {
    const cols = ['#f6dfa6', '#c9963a', '#e7c27a', '#f6efe2', '#ffffff'];
    for (let i = 0; i < 90; i++) parts.push({ x: rand(0, W), y: rand(-60, -10), vx: rand(-1, 1), vy: rand(1, 3.2), r: rand(3, 6), life: rand(80, 140), max: 140, color: cols[i % 5], g: 0.03, rot: rand(0, 6), conf: true });
  }

  // ================= drawing helpers =================
  function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
  function ell(x, y, rx, ry, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); }

  function drawSky() {
    const g = ctx.createLinearGradient(0, 0, 0, GROUND);
    g.addColorStop(0, '#0b2219'); g.addColorStop(.55, '#1d4a39'); g.addColorStop(.86, '#c99a4c'); g.addColorStop(1, '#f1d394');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, GROUND);
    stars.forEach(s => { ctx.globalAlpha = .25 + .35 * Math.sin(t * .05 + s.p) ** 2; ctx.fillStyle = '#f6efe2'; ell(s.x, s.y, s.r, s.r); ctx.fill(); });
    ctx.globalAlpha = 1;
    // sun + glow
    const sx = Math.round(W * 0.77), sy = GROUND - 46;
    const rg = ctx.createRadialGradient(sx, sy, 10, sx, sy, 190);
    rg.addColorStop(0, 'rgba(255,236,190,.95)'); rg.addColorStop(.18, 'rgba(246,215,150,.55)'); rg.addColorStop(1, 'rgba(246,215,150,0)');
    ctx.fillStyle = rg; ctx.fillRect(0, 0, W, GROUND);
    ctx.fillStyle = '#fff3d4'; ell(sx, sy, 34, 34); ctx.fill();
  }
  function drawHills() {
    const off = (dist * 0.12) % 1440;
    ctx.fillStyle = '#2b5a45';
    for (let k = 0; k < 2; k++) hills.forEach(h => {
      const x = h.x - off + k * 1440;
      if (x > W + 300 || x < -300) return;
      ctx.beginPath(); ctx.moveTo(x - h.w / 2, GROUND); ctx.quadraticCurveTo(x, GROUND - h.h * 2, x + h.w / 2, GROUND); ctx.fill();
    });
  }
  function drawTrees() {
    const span = 1200, off = (dist * 0.38) % span;
    for (let k = 0; k < 2; k++) trees.forEach(tr => {
      const x = tr.x - off + k * span;
      if (x > W + 60 || x < -60) return;
      if (tr.k === 'lamp') {
        ctx.fillStyle = '#123327'; ctx.fillRect(x, GROUND - 92, 4, 92); rr(x - 6, GROUND - 98, 16, 9, 3); ctx.fill();
        const lg = ctx.createRadialGradient(x + 2, GROUND - 86, 2, x + 2, GROUND - 86, 46);
        lg.addColorStop(0, 'rgba(255,224,160,.8)'); lg.addColorStop(1, 'rgba(255,224,160,0)');
        ctx.fillStyle = lg; ctx.fillRect(x - 46, GROUND - 132, 92, 92);
      } else {
        ctx.fillStyle = '#123327';
        ctx.fillRect(x - 2, GROUND - tr.h * .45, 4, tr.h * .45);
        ell(x, GROUND - tr.h * .62, tr.h * .32, tr.h * .38); ctx.fill();
        ell(x - tr.h * .18, GROUND - tr.h * .48, tr.h * .22, tr.h * .24); ctx.fill();
        ell(x + tr.h * .2, GROUND - tr.h * .5, tr.h * .22, tr.h * .26); ctx.fill();
      }
    });
  }
  function drawGround() {
    const g = ctx.createLinearGradient(0, GROUND, 0, H);
    g.addColorStop(0, '#efe2c4'); g.addColorStop(1, '#d9c59a');
    ctx.fillStyle = g; ctx.fillRect(0, GROUND, W, H - GROUND);
    ctx.fillStyle = '#1f4a39'; ctx.fillRect(0, GROUND - 2, W, 4);
    // grass tufts on the edge
    ctx.fillStyle = '#2f6a50';
    const go = dist % 26;
    for (let x = -go; x < W; x += 26) { ctx.beginPath(); ctx.moveTo(x, GROUND); ctx.lineTo(x + 4, GROUND - 7); ctx.lineTo(x + 8, GROUND); ctx.fill(); }
    // path texture
    ctx.fillStyle = 'rgba(16,44,34,.12)';
    const po = dist % 64;
    for (let x = -po; x < W; x += 64) { rr(x, GROUND + 22, 26, 3, 2); ctx.fill(); rr(x + 34, GROUND + 44, 18, 3, 2); ctx.fill(); }
  }

  function drawDog() {
    const h = GROUND - dog.y;                // height above ground
    // shadow
    const sh = Math.max(.25, 1 - h / 160);
    ctx.fillStyle = `rgba(16,44,34,${.28 * sh})`; ell(dog.x + 34, GROUND + 4, 40 * sh, 6 * sh); ctx.fill();

    const sq = dog.squash; const sx = 1 + sq * -0.6, sy = 1 + sq;
    ctx.save();
    ctx.translate(dog.x + 34, dog.y - 4);
    const tilt = dog.onGround ? Math.sin(dog.run * 2) * 0.03 : Math.max(-0.25, Math.min(0.2, dog.vy * 0.025));
    ctx.rotate(tilt); ctx.scale(sx, sy);
    const bob = dog.onGround ? Math.abs(Math.sin(dog.run)) * -3 : 0;
    ctx.translate(-34, bob);

    const fur = ctx.createLinearGradient(0, -48, 0, 0);
    fur.addColorStop(0, '#e6b06a'); fur.addColorStop(1, '#b97a3c');
    const dark = '#8a5428', cream = '#f6e2c2';

    // legs (gallop)
    const ph = dog.run;
    const leg = (bx, phase, back) => {
      const a = dog.onGround ? Math.sin(ph + phase) * 0.7 : (back ? 0.9 : -0.8);
      ctx.save(); ctx.translate(bx, -18); ctx.rotate(a);
      ctx.fillStyle = back ? dark : '#a96a33'; rr(-4, 0, 8, 20, 4); ctx.fill();
      ctx.fillStyle = cream; ell(1, 20, 5, 3); ctx.fill();
      ctx.restore();
    };
    leg(14, Math.PI, true); leg(48, 0, true);
    // tail
    ctx.save(); ctx.translate(4, -32); ctx.rotate(-0.6 + Math.sin(t * 0.4) * 0.35);
    ctx.fillStyle = '#c98a4b'; ell(-10, 0, 13, 4.5, 0); ctx.fill(); ctx.restore();
    // body
    ctx.fillStyle = fur; ell(32, -30, 30, 15); ctx.fill();
    ctx.fillStyle = cream; ell(48, -24, 12, 9); ctx.fill();
    // collar
    ctx.fillStyle = '#c9963a'; rr(52, -40, 6, 16, 3); ctx.fill();
    ctx.fillStyle = '#f6dfa6'; ell(57, -24, 3, 3); ctx.fill();
    // head
    ctx.fillStyle = fur; ell(66, -46, 15, 14); ctx.fill();
    ctx.fillStyle = cream; ell(79, -41, 10, 7); ctx.fill();
    ctx.fillStyle = '#2b1a0e'; ell(88, -43, 3.6, 3); ctx.fill();
    // mouth / tongue when running
    ctx.fillStyle = '#e46a6a'; ell(82, -35, 3.2, 2.2 + Math.abs(Math.sin(t * .3))); ctx.fill();
    // eye
    ctx.fillStyle = '#1b120a'; ell(70, -50, 2.8, 3); ctx.fill();
    ctx.fillStyle = '#fff'; ell(71, -51, 1, 1); ctx.fill();
    // ear
    ctx.save(); ctx.translate(60, -55); ctx.rotate(0.35 + (dog.onGround ? Math.sin(ph) * 0.12 : -0.5));
    ctx.fillStyle = dark; ell(0, 8, 6, 12); ctx.fill(); ctx.restore();
    // front legs (over body)
    leg(22, 0.3, false); leg(54, Math.PI + 0.3, false);
    ctx.restore();
  }

  function drawObstacle(o) {
    const y = GROUND - o.h;
    ctx.fillStyle = 'rgba(16,44,34,.22)'; ell(o.x + o.w / 2, GROUND + 3, o.w * .55, 4); ctx.fill();
    if (o.type === 'vacuum') {
      const g = ctx.createLinearGradient(o.x, 0, o.x + o.w, 0); g.addColorStop(0, '#7d1f19'); g.addColorStop(.5, '#c23b2f'); g.addColorStop(1, '#7d1f19');
      ctx.fillStyle = g; rr(o.x, y + 18, o.w, o.h - 26, 12); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.25)'; rr(o.x + 6, y + 22, 6, o.h - 36, 3); ctx.fill();
      ctx.strokeStyle = '#c9c9c9'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(o.x + o.w - 8, y + 20); ctx.quadraticCurveTo(o.x + o.w + 14, y + 4, o.x + o.w + 6, y - 6); ctx.stroke();
      ctx.fillStyle = '#222'; ell(o.x + 10, GROUND - 6, 7, 7); ctx.fill(); ell(o.x + o.w - 10, GROUND - 6, 7, 7); ctx.fill();
      ctx.fillStyle = '#888'; ell(o.x + 10, GROUND - 6, 2.5, 2.5); ctx.fill(); ell(o.x + o.w - 10, GROUND - 6, 2.5, 2.5); ctx.fill();
    } else if (o.type === 'tub') {
      ctx.fillStyle = '#c9963a'; [o.x + 8, o.x + o.w - 14].forEach(fx => { rr(fx, GROUND - 9, 6, 9, 2); ctx.fill(); });
      const g = ctx.createLinearGradient(0, y, 0, GROUND); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#dfe7ea');
      ctx.fillStyle = g; rr(o.x, y + 10, o.w, o.h - 18, [6, 6, 18, 18]); ctx.fill();
      ctx.fillStyle = '#9fd4ee'; rr(o.x + 5, y + 12, o.w - 10, 6, 3); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.9)';
      [[10, 4, 7], [24, 0, 9], [40, 5, 6], [54, 2, 7]].forEach(([bx, by, r]) => { if (bx < o.w) { ell(o.x + bx, y + by + Math.sin(t * .1 + bx) * 1.5, r, r); ctx.fill(); } });
      ctx.strokeStyle = 'rgba(16,44,34,.12)'; ctx.lineWidth = 1; rr(o.x, y + 10, o.w, o.h - 18, [6, 6, 18, 18]); ctx.stroke();
    } else {
      ctx.save(); ctx.translate(o.x + o.w / 2, GROUND - o.h / 2);
      const g = ctx.createLinearGradient(-o.w / 2, 0, o.w / 2, 0); g.addColorStop(0, 'rgba(255,255,255,.75)'); g.addColorStop(.5, 'rgba(255,255,255,.95)'); g.addColorStop(1, 'rgba(220,230,235,.8)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-o.w / 2, o.h / 2); ctx.lineTo(-8, -o.h / 2); ctx.lineTo(8, -o.h / 2); ctx.lineTo(o.w / 2, o.h / 2); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#4f86b3'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-o.w / 2, o.h / 2); ctx.lineTo(o.w / 2, o.h / 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-8, -o.h / 2); ctx.lineTo(8, -o.h / 2); ctx.stroke();
      ctx.restore();
    }
  }

  function drawToy(o) {
    const y = o.y + Math.sin(t * 0.1 + o.p) * 6;
    const halo = ctx.createRadialGradient(o.x, y, 2, o.x, y, 34);
    halo.addColorStop(0, 'rgba(150,210,255,.7)'); halo.addColorStop(1, 'rgba(150,210,255,0)');
    ctx.fillStyle = halo; ctx.fillRect(o.x - 34, y - 34, 68, 68);
    ctx.save(); ctx.translate(o.x, y); ctx.rotate(Math.sin(t * 0.08) * 0.3);
    ctx.fillStyle = '#e45d7a'; ell(0, 0, 13, 13); ctx.fill();
    ctx.fillStyle = '#ffd1dc'; ell(-4, -4, 4, 4); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 9, 0.4, 2.4); ctx.stroke();
    ctx.restore();
  }
  // A prize arch appears on the path just before each milestone.
  function drawGoalArch() {
    if (state !== 'run') return;
    const nxt = tiers.find(x => score < x.at); if (!nxt) return;
    const left = nxt.at - score; if (left > 220) return;
    const x = dog.x + 70 + left * PTS_DIV;
    if (x > W + 120) return;
    ctx.save();
    ctx.fillStyle = '#c9963a'; rr(x - 4, GROUND - 150, 8, 150, 3); ctx.fill(); rr(x + 96, GROUND - 150, 8, 150, 3); ctx.fill();
    const g = ctx.createLinearGradient(0, GROUND - 170, 0, GROUND - 130); g.addColorStop(0, '#f6dfa6'); g.addColorStop(1, '#c9963a');
    ctx.fillStyle = g; rr(x - 14, GROUND - 176, 128, 40, 10); ctx.fill();
    ctx.fillStyle = '#0a1f17'; ctx.font = '800 15px "DM Sans", system-ui, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(nxt.icon + ' ' + nxt.at.toLocaleString('en-IN'), x + 50, GROUND - 151);
    ctx.textAlign = 'start'; ctx.restore();
  }
  function drawBone(b) {
    const y = b.y + Math.sin(t * 0.08 + b.p) * 5;
    if (b.gold) { const gl = ctx.createRadialGradient(b.x, y, 2, b.x, y, 44); gl.addColorStop(0, 'rgba(255,240,170,.9)'); gl.addColorStop(1, 'rgba(255,240,170,0)'); ctx.fillStyle = gl; ctx.fillRect(b.x - 44, y - 44, 88, 88); }
    const halo = ctx.createRadialGradient(b.x, y, 2, b.x, y, 30);
    halo.addColorStop(0, 'rgba(255,226,150,.55)'); halo.addColorStop(1, 'rgba(255,226,150,0)');
    ctx.fillStyle = halo; ctx.fillRect(b.x - 30, y - 30, 60, 60);
    ctx.save(); ctx.translate(b.x, y); ctx.rotate(Math.sin(t * 0.06 + b.p) * 0.3);
    if (b.gold) ctx.scale(1.25, 1.25);
    const g = ctx.createLinearGradient(0, -8, 0, 8);
    if (b.gold) { g.addColorStop(0, '#fffbe0'); g.addColorStop(.5, '#ffd34d'); g.addColorStop(1, '#d99a00'); } else { g.addColorStop(0, '#fbe7b4'); g.addColorStop(.5, '#e2b765'); g.addColorStop(1, '#a97a2c'); }
    ctx.fillStyle = g;
    rr(-12, -4, 24, 8, 4); ctx.fill();
    [[-12, -4], [-12, 4], [12, -4], [12, 4]].forEach(([cx, cy]) => { ell(cx, cy, 5.2, 5.2); ctx.fill(); });
    ctx.fillStyle = 'rgba(255,255,255,.6)'; rr(-8, -3, 12, 2, 1); ctx.fill();
    ctx.restore();
  }

  function drawParts() {
    parts.forEach(p => {
      const a = Math.max(0, p.life / p.max);
      ctx.globalAlpha = a;
      if (p.text) { ctx.fillStyle = p.big ? '#ffe7a8' : '#fff3d4'; ctx.font = p.big ? '700 26px Georgia, serif' : '700 18px Georgia, serif'; ctx.textAlign = 'center'; ctx.fillText(p.text, p.x, p.y); ctx.textAlign = 'start'; }
      else if (p.conf) { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.color; ctx.fillRect(-p.r / 2, -p.r, p.r, p.r * 2); ctx.restore(); }
      else { ctx.fillStyle = p.color; ell(p.x, p.y, p.r, p.r); ctx.fill(); }
    });
    ctx.globalAlpha = 1;
  }

  function vignette() {
    const v = ctx.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, W * .7);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(5,15,11,.35)');
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
    if (flash > 0) { ctx.fillStyle = `rgba(255,236,190,${flash})`; ctx.fillRect(0, 0, W, H); }
  }

  function draw() {
    ctx.save();
    if (shake > 0 && !reduceMotion) ctx.translate(rand(-shake, shake), rand(-shake, shake));
    drawSky();
    // Sunset slowly turns to night as the score climbs.
    const night = Math.max(0, Math.min(0.42, (score - 1200) / 3800 * 0.42));
    if (night > 0) { ctx.fillStyle = `rgba(8,18,52,${night})`; ctx.fillRect(0, 0, W, GROUND); }
    drawHills(); drawTrees(); drawGround(); drawGoalArch();
    bones.forEach(drawBone); toys.forEach(drawToy); obs.forEach(drawObstacle);
    if (!(invuln > 0 && Math.floor(t / 4) % 2)) drawDog();
    if (shield) { ctx.strokeStyle = `rgba(150,210,255,${.55 + .25 * Math.sin(t * .2)})`; ctx.lineWidth = 3; ell(dog.x + 46, dog.y - 34, 58, 42); ctx.stroke(); ctx.fillStyle = 'rgba(150,210,255,.10)'; ctx.fill(); }
    drawParts();
    ctx.restore();
    vignette();
  }

  // ================= loop =================
  const hit = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  function step(now) {
    const dt = Math.min(2, (now - last) / 16.67); last = now; t += dt;
    speed = Math.min(14 * SPEED_K, speed + 0.0019 * SPEED_K * dt);
    dist += speed * dt;

    // dog physics (hold = floatier jump)
    const grav = holding && dog.vy < 0 ? 0.42 : 0.78;
    dog.vy += grav * dt; dog.y += dog.vy * dt;
    if (dog.y >= GROUND) {
      if (!dog.onGround) { dog.squash = 0.16; puff(dog.x + 30, GROUND, 5, '#e9dcc0'); }
      dog.y = GROUND; dog.vy = 0; dog.onGround = true;
    }
    dog.squash *= 0.82;
    dog.run += 0.32 * dt * (speed / 6);
    if (dog.onGround && Math.random() < 0.18 * dt) puff(dog.x + 8, GROUND, 1, '#e3d3ad');

    // spawning (gaps shrink a little as speed rises, never unfair)
    spawnIn -= speed * dt;   // measured in pixels so gaps stay fair at any speed
    if (spawnIn <= 0) {
      const pool = [{ type: 'vacuum', w: 46, h: 58 }, { type: 'tub', w: 70, h: 44 }, { type: 'cone', w: 42, h: 50 }];
      const o = pool[Math.floor(Math.random() * pool.length)];
      obs.push({ ...o, x: W + 20 });
      if (speed > 9 && Math.random() < 0.22) obs.push({ ...pool[2], x: W + 20 + o.w + 8 }); // occasional double
      spawnIn = rand(360, 680) + speed * 30;
    }
    boneIn -= dt;
    if (boneIn <= 0) { bones.push({ x: W + 30, y: GROUND - rand(70, 150), p: rand(0, 6), gold: Math.random() < 0.12 }); boneIn = rand(70, 140); }
    toyIn -= dt;
    if (toyIn <= 0 && !shield) { toys.push({ x: W + 30, y: GROUND - rand(90, 150), p: rand(0, 6) }); toyIn = rand(1500, 2200); }
    toys.forEach(o => o.x -= speed * dt);
    if (invuln > 0) invuln -= dt;
    if (comboTimer > 0) { comboTimer -= dt; if (comboTimer <= 0) { combo = 0; $('combo').classList.remove('br-show'); } }
    // speed-up callouts
    const lvl = Math.floor((speed / SPEED_K - 6) / 2);
    if (lvl > speedLevel) { speedLevel = lvl; floatText(W / 2, 120, ['', 'Faster! 🔥', 'Zoomies! ⚡', 'Turbo pup! 🚀', 'Unstoppable! 🌟'][Math.min(4, lvl)] || 'Unstoppable! 🌟', true); }

    obs.forEach(o => o.x -= speed * dt);
    bones.forEach(b => b.x -= speed * dt);
    parts.forEach(p => { p.x += p.vx * dt - (p.conf || p.text ? 0 : speed * 0.15 * dt); p.y += p.vy * dt; p.vy += p.g * dt; p.life -= dt; if (p.rot !== undefined) p.rot += 0.1 * dt; });
    parts = parts.filter(p => p.life > 0);
    obs = obs.filter(o => o.x > -120);
    shake *= 0.85; flash *= 0.9;

    // collisions (forgiving)
    const body = { x: dog.x + 14, y: dog.y - 52, w: 66, h: 44 };
    for (const o of obs) {
      if (invuln > 0 || o.hitDone) continue;
      if (hit(body, { x: o.x + 6, y: GROUND - o.h + 8, w: o.w - 12, h: o.h - 8 })) {
        if (shield) { shield = false; o.hitDone = true; invuln = 50; shake = 6; flash = 0.25; sfx.block(); puff(o.x + o.w / 2, GROUND - o.h / 2, 14, '#bfe3ff'); floatText(dog.x + 50, dog.y - 80, 'Saved by the toy! 🧸', true); $('shieldTag').classList.remove('br-show'); continue; }
        shake = 9; sfx.crash(); draw(); return endRun(false);
      }
      // close call: cleared an obstacle with very little room
      if (!o.closeDone && o.x + o.w < dog.x + 14 && o.x + o.w > dog.x - 4 && GROUND - dog.y < o.h + 26) { o.closeDone = true; bonus += 10; floatText(dog.x + 40, dog.y - 70, 'Close call! +10'); }
    }
    bones = bones.filter(b => {
      if (hit({ x: dog.x + 6, y: dog.y - 70, w: 96, h: 74 }, { x: b.x - 16, y: b.y - 12, w: 32, h: 24 })) {
        if (b.gold) { bonus += 100; sparkle(b.x, b.y, '+100 ✨'); sfx.gold(); flash = 0.2; }
        else {
          combo = comboTimer > 0 ? combo + 1 : 1; comboTimer = 150;
          const mult = combo >= 6 ? 3 : combo >= 3 ? 2 : 1;
          bonus += 25 * mult; sparkle(b.x, b.y, mult > 1 ? '+' + 25 * mult + ' x' + mult : '+25'); sfx.bone(mult);
          const tag = $('combo'); tag.textContent = mult > 1 ? '🔥 x' + mult + ' combo · ' + combo + ' in a row' : combo + ' in a row'; tag.classList.toggle('br-show', combo >= 2);
        }
        return false;
      }
      if (b.x < dog.x - 30 && !b.missed && !b.gold) { b.missed = true; if (combo >= 2) { combo = 0; comboTimer = 0; $('combo').classList.remove('br-show'); } }
      return b.x > -40;
    });

    toys = toys.filter(o => {
      if (hit({ x: dog.x + 6, y: dog.y - 70, w: 96, h: 74 }, { x: o.x - 16, y: o.y - 16, w: 32, h: 32 })) { shield = true; sfx.toy(); floatText(o.x, o.y - 10, 'Shield! 🧸', true); $('shieldTag').classList.add('br-show'); return false; }
      return o.x > -40;
    });
    score = Math.min(MAX, Math.floor(dist / PTS_DIV) + bonus);
    const nxt = tiers.find(x => score < x.at);
    const goal = $('goal');
    if (nxt) { const left = nxt.at - score; goal.textContent = (left <= 150 ? 'So close! ' : 'Next: ') + nxt.icon + ' ' + nxt.short + ' · ' + left.toLocaleString('en-IN') + ' to go'; goal.classList.toggle('br-near', left <= 150); }
    else { goal.textContent = '🏆 Top prize unlocked!'; goal.classList.add('br-near'); }
    $('score').textContent = score.toLocaleString('en-IN');
    $('railFill').style.width = (score / MAX * 100) + '%';
    tiers.forEach((tier, i) => {
      if (score >= tier.at && runTier < i) {
        runTier = i; $('m' + (i + 1)).classList.add('br-got');
        confetti(); flash = 0.35; sfx.win();
        if (navigator.vibrate) navigator.vibrate(60);
        if (i < tiers.length - 1) showUnlock(tier);
        floatText(W / 2, 90, tier.icon + ' ' + tier.short + ' unlocked!', true);
      }
    });
    draw();
    if (score >= MAX) return endRun(true);
    raf = requestAnimationFrame(step);
  }

  // ================= UI flow =================
  function showUnlock(tier) {
    $('unlockName').textContent = tier.icon + ' ' + tier.short;
    $('unlock').classList.add('br-show'); clearTimeout(unlockTimer);
    unlockTimer = setTimeout(() => $('unlock').classList.remove('br-show'), 2200);
  }
  function paintMiles() { tiers.forEach((x, i) => $('m' + (i + 1)).classList.toggle('br-got', i <= bestTier)); }
  // Anonymous play tracking for the admin Game Leads dashboard.
  function track(event, extra) {
    try {
      if (!['gameofbones.in', 'www.gameofbones.in'].includes(location.hostname)) return;
      let id = localStorage.getItem('gob-player-id');
      if (!id) { id = (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2)).replace(/[^a-z0-9-]/gi, ''); localStorage.setItem('gob-player-id', id); }
      fetch('/api/bone-run/event', { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ player_id: id, event, ...(extra || {}) }) }).catch(() => {});
    } catch (_) {}
  }
  let countTimer = 0;
  function start() {
    if (state === 'count') return;
    reset(); state = 'count'; paintMiles(); $('railFill').style.width = '0%'; $('score').textContent = '0';
    try { localStorage.setItem('gob-bonerun-played', '1'); } catch (_) {}
    $('startOv').hidden = true; $('overOv').hidden = true; $('pauseOv').hidden = true; $('unlock').classList.remove('br-show');
    document.querySelector('.br-modal .br-card').classList.add('br-running');
    draw();
    const c = $('count'); c.hidden = false;
    const steps = ['3', '2', '1', 'Go!']; let i = 0;
    const tick = () => {
      if (state !== 'count') { c.hidden = true; return; }
      if (i < steps.length) { c.innerHTML = '<span>' + steps[i] + '</span>'; beep(i < 3 ? 520 : 880, 0.12, 'triangle', 0.05); i++; countTimer = setTimeout(tick, i === 4 ? 450 : 600); return; }
      c.hidden = true; state = 'run'; $('pauseBtn').hidden = false; runStart = performance.now(); last = performance.now(); track('start');
      raf = requestAnimationFrame(step);
    };
    tick();
  }
  function pause() {
    if (state !== 'run') return;
    state = 'paused'; cancelAnimationFrame(raf); holding = false;
    pausedAt = performance.now(); $('pauseOv').hidden = false; $('pauseBtn').hidden = true;
  }
  let pausedAt = 0;
  function resume() {
    if (state !== 'paused') return;
    runStart += performance.now() - pausedAt; // paused time does not count as play time
    state = 'run'; $('pauseOv').hidden = true; $('pauseBtn').hidden = false; last = performance.now();
    raf = requestAnimationFrame(step);
  }
  function countUp(el, to) {
    const t0 = performance.now(), d = 700;
    const tick = n => { const k = Math.min(1, (n - t0) / d); el.firstChild.nodeValue = Math.round(to * (1 - Math.pow(1 - k, 3))).toLocaleString('en-IN'); if (k < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }
  function endRun(maxed) {
    state = 'over'; cancelAnimationFrame(raf); track('end', { score });
    $('pauseBtn').hidden = true; document.querySelector('.br-modal .br-card').classList.remove('br-running');
    const newBest = score > best && best > 0; $('newBest').hidden = !newBest;
    best = Math.max(best, score); $('best').textContent = best.toLocaleString('en-IN');
    { const nx = tiers.find(x => score < x.at), prev = [...tiers].reverse().find(x => score >= x.at);
      $('next').hidden = !nx;
      if (nx) { const from = prev ? prev.at : 0; $('nextText').textContent = nx.icon + ' ' + (nx.at - score).toLocaleString('en-IN') + ' points to ' + nx.short; $('nextFill').style.width = '0%'; setTimeout(() => { $('nextFill').style.width = Math.max(4, Math.min(100, (score - from) / (nx.at - from) * 100)) + '%'; }, 60); } }
    try { localStorage.setItem('gob-bonerun-best', String(best)); } catch (_) {}
    const improved = runTier > bestTier;
    if (improved) {
      bestTier = runTier; bestRun = { score, ms: Math.round(performance.now() - runStart) };
      setUnclaimed({ tier: bestTier, score: bestRun.score, ms: bestRun.ms, at: Date.now() });
      // The prize must be claimed with the form. Open it automatically so
      // winners do not miss it.
      setTimeout(() => { if (state === 'over' && !$('overOv').hidden) showClaim(); }, 1600);
    }
    countUp($('finalScore'), score);
    $('overTitle').textContent = maxed ? 'Legend. Maximum score! 🏆' : ['Bath time got you!', 'The vacuum wins this round.', 'Cone of shame!'][Math.floor(Math.random() * 3)];
    const next = tiers.find(x => score < x.at);
    if (runTier >= 0) {
      $('wonBox').hidden = false; $('wonIcon').textContent = tiers[runTier].icon; $('wonName').textContent = tiers[runTier].name;
      $('wonNote').textContent = improved ? 'Unlocked this run' : 'You already hold this prize or a better one';
    } else $('wonBox').hidden = true;
    const u = unclaimed();
    const saved = u ? ' Claim it now: it is added free to ' + minText(tiers[u.tier]) + '.' : '';
    $('overText').textContent = (maxed ? 'You beat Bone Run. The top prize is yours.' : next ? (next.at - score).toLocaleString('en-IN') + ' more points for ' + next.name + '.' : '') + saved;
    $('claimBtn').hidden = !unclaimed();
    $('orderBtn').hidden = !(heldAward() && !unclaimed());
    $('skipOver').hidden = !unclaimed();
    $('overOv').hidden = false;
  }
  // A prize already claimed with the form on this device.
  function heldAward() { try { const a = JSON.parse(localStorage.getItem('gob-bonerun-award') || 'null'); return a && a.claimed && (!a.valid_until || String(a.valid_until) >= new Date().toISOString().slice(0, 10)) ? a : null; } catch (_) { return null; } }
  function goOrder() {
    close();
    let items = 0; try { items = JSON.parse(localStorage.getItem('gob-preview-cart') || '[]').length; } catch (_) {}
    location.href = items ? '/cart' : '/products';
  }
  function showClaim() {
    const tier = tiers[bestTier];
    $('claimNote').textContent = 'Added at ₹0 to ' + minText(tier) + ' · valid 7 days · works with coupons & reward points';
    setPrizeImg('claimImg', tier); setPrizeImg('doneImg', tier);
    ['claimIcon', 'doneIcon'].forEach(id => $(id).textContent = tier.icon);
    ['claimName', 'doneName'].forEach(id => $(id).textContent = tier.name);
    $('claimSub').textContent = 'Your run: ' + (bestRun ? bestRun.score : best).toLocaleString('en-IN') + ' points';
    $('claimErr').hidden = true;
    $('playArea').style.display = 'none'; $('claimPanel').classList.add('br-show');
  }
  function backToGame() {
    ['claimPanel', 'donePanel'].forEach(id => $(id).classList.remove('br-show'));
    $('playArea').style.display = ''; $('overOv').hidden = true; $('pauseOv').hidden = true; $('count').hidden = true; $('startOv').hidden = false; clearTimeout(countTimer);
    $('pauseBtn').hidden = true; document.querySelector('.br-modal .br-card').classList.remove('br-running');
    reset(); paintMiles(); $('railFill').style.width = '0%'; draw(); refreshClaimUi();
  }
  // Keep a visible way back to the claim form while a prize is unclaimed.
  function refreshClaimUi() {
    const u = unclaimed();
    const btn = $('claimStart'); if (btn) { btn.hidden = !u; if (u) btn.textContent = '🎁 Claim ' + tiers[u.tier].name; }
    const held = !u && heldAward();
    const cta = $('heldCta');
    if (cta) { cta.hidden = !held; if (held) { const ht = tierByName(held.label); cta.innerHTML = '🛒 Place your order &amp; get your <b>' + held.label.replace(/^(\d+ )?free /i, '$1') + '</b> free' + (ht && ht.min > 0 ? ' (orders ₹' + ht.min + '+)' : ' · any order'); } }
    const launch = document.querySelector('#wheelLaunch');
    if (launch) {
      launch.classList.toggle('br-has-prize', Boolean(u));
      const txt = launch.querySelector('.br-txt');
      if (txt) txt.innerHTML = u ? (u.skip ? 'Order now · free treat' : 'Claim your free treat') + '<small>' + tiers[u.tier].name.replace(/\bfree\s+/, '') + (u.skip ? ' added at checkout' : ' is waiting') + '</small>'
        : held ? 'Order now · free treat<small>' + held.label.replace(/\bfree\s+/, '') + ' is waiting</small>'
        : 'Play &amp; win a treat<small>Bone Run · free treats up to Mackerel</small>';
    }
  }

  // ================= events =================
  const stage = $('stage');
  stage.addEventListener('pointerdown', e => { if (e.target.closest('button')) return; e.preventDefault(); press(); });
  window.addEventListener('pointerup', release);
  document.addEventListener('keydown', e => {
    if (!$('modal').classList.contains('br-open') || e.repeat) return;
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      e.preventDefault();
      if (state === 'run') press(); else if (state === 'paused') resume(); else if (state !== 'count' && $('playArea').style.display !== 'none') start();
    }
  });
  document.addEventListener('keyup', e => { if (e.code === 'Space' || e.code === 'ArrowUp') release(); });
  $('startBtn').onclick = start;
  $('againBtn').onclick = start;
  $('claimBtn').onclick = showClaim;
  $('claimStart').onclick = showClaim;
  $('pauseBtn').onclick = e => { e.stopPropagation(); pause(); };
  $('pauseBtn').addEventListener('pointerdown', e => e.stopPropagation());
  $('resumeBtn').onclick = resume;
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  // Skip the form: the prize stays on this device and is claimed automatically
  // at checkout with the name, mobile and email entered there.
  const skipToCheckout = () => { const u = unclaimed(); if (u) setUnclaimed({ ...u, skip: true }); goOrder(); };
  $('claimSkip').onclick = skipToCheckout;
  $('skipOver').onclick = skipToCheckout;
  function open() {
    $('modal').classList.add('br-open'); document.body.classList.add('br-lock');
    if (state !== 'run') { backToGame(); if (unclaimed()) showClaim(); }
  }
  function close() { cancelAnimationFrame(raf); clearTimeout(countTimer); if (state === 'run' || state === 'count' || state === 'paused') state = 'idle'; document.querySelector('.br-modal .br-card').classList.remove('br-running'); $('modal').classList.remove('br-open'); document.body.classList.remove('br-lock'); }
  $('closeGame').onclick = close;
  $('modal').addEventListener('click', e => { if (e.target === $('modal')) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && $('modal').classList.contains('br-open')) close(); });

  async function customerKey(email, phone) {
    const bytes = new TextEncoder().encode(`gob-spin-v1:${email.trim().toLowerCase()}|${phone.replace(/\D/g, '').slice(-10)}`);
    const hash = await crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Remembered on this device so the cart and checkout can show the prize
  // straight away. The server still matches it by phone/email at checkout.
  function saveDeviceAward(label, validUntil) {
    try { localStorage.setItem('gob-bonerun-award', JSON.stringify({ label, claimed: true, valid_until: validUntil || new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10) })); } catch (_) {}
    document.dispatchEvent(new Event('gob:prize-updated'));
  }
  const apiBase = ['gameofbones.in', 'www.gameofbones.in'].includes(location.hostname) ? '/api' : (localStorage.getItem('gob-api-base') || '');
  $('claimForm').onsubmit = async e => {
    e.preventDefault();
    const form = $('claimForm'); if (!form.reportValidity() || !bestRun) return;
    const data = Object.fromEntries(new FormData(form));
    const button = $('claimSubmit'); const err = $('claimErr');
    button.disabled = true; button.textContent = 'Saving your treat…'; err.hidden = true;
    try {
      if (!apiBase) throw new Error('Prizes can only be claimed on gameofbones.in.');
      const response = await fetch(`${apiBase.replace(/\/$/, '')}/bone-run`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: data.name, email: data.email, phone: data.phone, marketing_consent: data.marketing_consent === 'true', score: bestRun.score, run_ms: bestRun.ms }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'We could not save your prize right now. Please try again.');
      const label = result.prize || tiers[bestTier].name;
      setUnclaimed(null);
      const tier = tiers.find(x => x.name === label);
      $('doneIcon').textContent = tier ? tier.icon : '🎁'; $('doneName').textContent = label; setPrizeImg('doneImg', tier);
      if (result.status === 'already_used') {
        try { localStorage.removeItem('gob-bonerun-award'); } catch (_) {}
        $('doneTitle').textContent = 'Thanks for playing! 🐾';
        $('doneSub').textContent = 'You have already used your Bone Run prize on an order. Prizes are one per customer.';
        $('doneNote').textContent = 'Keep playing for fun and to beat your best score.';
      } else if (result.status === 'kept') {
        saveDeviceAward(label, result.valid_until);
        $('doneTitle').textContent = 'You already have this one 🐾';
        $('doneSub').textContent = 'Your saved prize is the same or better, so we kept it.';
        $('doneNote').textContent = 'Added at ₹0 to ' + minText(tierByName(label)) + '. Works with coupon codes and reward points.';
      } else {
        $('doneTitle').textContent = result.status === 'upgraded' ? 'Prize upgraded! 🎉' : 'Saved. Treat time! 🐾';
        $('doneSub').textContent = 'We have emailed your free treat details.';
        $('doneNote').textContent = 'Place your order in the next 7 days and it is added at ₹0 to ' + minText(tierByName(label)) + '. Use any coupon code and your reward points too.';
        try { localStorage.setItem(`gob-spin:${await customerKey(String(data.email), String(data.phone))}`, JSON.stringify({ label, detail: result.coupon_code || '' })); } catch (_) {}
        saveDeviceAward(label, result.valid_until);
      }
      $('claimPanel').classList.remove('br-show'); $('donePanel').classList.add('br-show');
      window.GOB_ANALYTICS?.track?.('bone_run_claim', { score: bestRun.score, prize: label, status: result.status });
    } catch (error) {
      err.textContent = error && error.message && !/failed to fetch|network/i.test(error.message) ? error.message : 'We could not save your prize right now. Please try again.';
      err.hidden = false;
    } finally { button.disabled = false; button.textContent = 'Claim my free treat'; }
  };
  $('shopBtn').onclick = goOrder;
  $('orderBtn').onclick = goOrder;
  $('heldCta').onclick = goOrder;
  const muteBtn = $('mute');
  const paintMute = () => { muteBtn.textContent = muted ? '🔇' : '🔊'; };
  muteBtn.onclick = e => { e.stopPropagation(); muted = !muted; try { localStorage.setItem('gob-bonerun-muted', muted ? '1' : '0'); } catch (_) {} paintMute(); };
  muteBtn.addEventListener('pointerdown', e => e.stopPropagation());
  paintMute();
  $('playMore').onclick = backToGame;
  $('claimLater').onclick = backToGame;
  $('best').textContent = best.toLocaleString('en-IN');
  reset(); draw();
  refreshClaimUi();
  window.GOB_openSpinWheel = open;
  document.querySelector('#wheelLaunch')?.addEventListener('click', open);
  document.dispatchEvent(new Event('gob:wheel-ready'));
})();