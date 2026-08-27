/* End-to-end checks against a local server (tools/qa/serve.js on :4321).
   Needs Playwright:  npm i -D playwright && npx playwright install chromium
   Run: node tools/qa/functional.js   -> exits non-zero on failure */
const { chromium } = require('playwright');
const B='http://localhost:4321';
let pass=0, fail=0;
function chk(name, cond, extra=''){ if(cond){pass++;console.log('  PASS  '+name);} else {fail++;console.log('  FAIL  '+name+' '+extra);} }
(async()=>{
  const br=await chromium.launch();

  // ---------- desktop: dropdown on hover ----------
  let ctx=await br.newContext({viewport:{width:1440,height:900}});
  let p=await ctx.newPage();
  await p.goto(B+'/about',{waitUntil:'networkidle'});
  const before=await p.evaluate(()=>getComputedStyle(document.querySelector('.mainnav .subnav')).opacity);
  await p.hover('.mainnav .has-sub');
  await p.waitForTimeout(500);
  const after=await p.evaluate(()=>getComputedStyle(document.querySelector('.mainnav .subnav')).opacity);
  console.log('\n[desktop dropdown]');
  chk('closed by default (opacity 0)', before==='0', '->'+before);
  chk('opens on hover (opacity 1)', after==='1', '->'+after);
  // keyboard: focus the parent link then tab into the submenu
  await p.evaluate(()=>document.querySelector('.mainnav .has-sub > a').focus());
  await p.keyboard.press('Tab');
  await p.waitForTimeout(400);
  const kb=await p.evaluate(()=>({op:getComputedStyle(document.querySelector('.mainnav .subnav')).opacity,
                                  focused:document.activeElement.getAttribute('href')}));
  chk('opens on keyboard focus', kb.op==='1', JSON.stringify(kb));
  chk('tab from parent lands on /business-law', kb.focused==='/business-law', JSON.stringify(kb));
  await ctx.close();

  // ---------- mobile: hamburger drawer ----------
  ctx=await br.newContext({viewport:{width:375,height:812},isMobile:true,hasTouch:true,
    userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'});
  p=await ctx.newPage();
  await p.goto(B+'/',{waitUntil:'networkidle'});
  console.log('\n[mobile drawer]');
  const d0=await p.evaluate(()=>document.querySelector('.drawer').getBoundingClientRect().x);
  chk('drawer off-screen initially', d0 < -100, 'x='+d0);
  chk('hamburger visible', await p.isVisible('.hamburger'));
  await p.tap('.hamburger');
  await p.waitForTimeout(600);
  const d1=await p.evaluate(()=>({x:document.querySelector('.drawer').getBoundingClientRect().x,
                                  exp:document.querySelector('.hamburger').getAttribute('aria-expanded')}));
  chk('drawer opens on tap', Math.abs(d1.x) < 1, JSON.stringify(d1));
  chk('aria-expanded=true', d1.exp==='true');
  chk('submenu items visible in drawer', await p.isVisible('.drawer .subnav a[href="/business-law"]'));
  await p.touchscreen.tap(345, 500);              // right of the 281px drawer
  await p.waitForTimeout(600);
  const d2=await p.evaluate(()=>document.querySelector('.drawer').getBoundingClientRect().x);
  chk('drawer closes on overlay tap', d2 < -100, 'x='+d2);
  await p.tap('.hamburger'); await p.waitForTimeout(500);
  await p.keyboard.press('Escape'); await p.waitForTimeout(500);
  const d3=await p.evaluate(()=>document.querySelector('.drawer').getBoundingClientRect().x);
  chk('drawer closes on Escape', d3 < -100, 'x='+d3);
  await ctx.close();

  // ---------- links across every page ----------
  console.log('\n[links]');
  ctx=await br.newContext({viewport:{width:1440,height:900}});
  p=await ctx.newPage();
  const pages=['/','/about','/practiceareas','/business-law','/real-estate','/corporate','/contact'];
  let tel=new Set(), mail=new Set(), li=0, internal=new Set();
  for (const path of pages){
    await p.goto(B+path,{waitUntil:'domcontentloaded'});
    const r=await p.evaluate(()=>{
      const a=[...document.querySelectorAll('a[href]')].map(x=>x.getAttribute('href'));
      return {tel:a.filter(h=>h.startsWith('tel:')), mail:a.filter(h=>h.startsWith('mailto:')),
              li:a.filter(h=>h.includes('linkedin.com')).length,
              internal:a.filter(h=>h.startsWith('/') && !h.startsWith('//'))};
    });
    r.tel.forEach(t=>tel.add(t)); r.mail.forEach(m=>mail.add(m)); li+=r.li;
    r.internal.forEach(i=>internal.add(i));
  }
  chk('every tel: is 516-946-1706', [...tel].every(t=>t==='tel:516-946-1706'), [...tel].join(','));
  chk('no 515 anywhere', ![...tel].some(t=>t.includes('515')));
  chk('single lowercase mailto sitewide', [...mail].join(',')==='mailto:paul@paulrubell.com', [...mail].join(','));
  chk('LinkedIn link present on 8 spots', li===8, 'count='+li);

  for (const href of [...internal].filter(h=>!h.startsWith('/css')&&!h.startsWith('/js')&&!h.startsWith('/images')&&!h.startsWith('/fonts')&&h!=='/manifest.json'&&h!=='/favicon.ico')){
    const res=await p.goto(B+href,{waitUntil:'domcontentloaded'});
    chk('internal '+href+' -> '+res.status(), res.status()===200);
  }
  const cased=await p.goto(B+'/business-law',{waitUntil:'domcontentloaded'});
  chk('/business-law serves 200', cased.status()===200);
  const h1=await p.evaluate(()=>document.querySelector('h1')?.textContent.trim());
  chk('/business-law is the Business Law page', h1==='Business Law', h1);

  await br.close();
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail?1:0);
})();
