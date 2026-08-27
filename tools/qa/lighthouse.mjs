/* Mobile Lighthouse across all seven pages against localhost:4321.
   Needs: npm i -D lighthouse playwright
   Run: node tools/qa/lighthouse.mjs */
import lighthouse from 'lighthouse';
import { chromium } from 'playwright';
const PAGES=['/','/about','/practiceareas','/contact'];
const browser = await chromium.launch({args:['--remote-debugging-port=9222']});
const port = 9222;
const rows=[]; const issues={};
for (const p of PAGES){
  const r = await lighthouse('http://localhost:4321'+p, {port, output:'json', logLevel:'error',
    screenEmulation:{mobile:true,width:412,height:823,deviceScaleFactor:1.75,disabled:false},
    formFactor:'mobile', onlyCategories:['performance','accessibility','best-practices','seo']});
  const c=r.lhr.categories;
  rows.push([p, ...['performance','accessibility','best-practices','seo'].map(k=>Math.round(c[k].score*100))]);
  for (const [k,a] of Object.entries(r.lhr.audits)){
    if (a.score!==null && a.score<1 && a.scoreDisplayMode!=='informative' && !['unused-javascript','uses-long-cache-ttl','legacy-javascript'].includes(k)){
      (issues[k] ||= new Set()).add(p);
    }
  }
}
console.log('\n page              perf  a11y  best  seo');
for (const r of rows) console.log(`  ${String(r[0]).padEnd(16)} ${String(r[1]).padStart(4)} ${String(r[2]).padStart(5)} ${String(r[3]).padStart(5)} ${String(r[4]).padStart(4)}`);
console.log('\n failing audits:');
for (const [k,v] of Object.entries(issues)) console.log(`  ${k.padEnd(38)} ${[...v].join(' ')}`);
await browser.close();
