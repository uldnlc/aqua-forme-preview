const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.site-nav');
function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('is-open');
}
menuButton.addEventListener('click', () => {
  const willOpen = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(willOpen));
  navigation.classList.toggle('is-open', willOpen);
});
navigation.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation.classList.contains('is-open')) { closeMenu(); menuButton.focus(); }
});
document.addEventListener('click', event => {
  if (!event.target.closest('.site-header')) closeMenu();
});
window.matchMedia('(min-width: 1101px)').addEventListener('change', closeMenu);

// Keep the current section visible in the navigation without hiding page content.
if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        document.querySelectorAll('.site-nav a[href^="#"]').forEach(link => {
          if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      }
    });
  }, {rootMargin: '-12% 0px -65% 0px', threshold: 0});
  document.querySelectorAll('section[id]').forEach(section => sectionObserver.observe(section));
}

// Existing Air Reserve menus remain unchanged; each choice links to its specific calendar.
(() => {
  const courses = [{"key": "seitai", "label": "整体", "description": "肩や腰のつらさ、姿勢が気になる方に。", "options": [{"minutes": 60, "price": 6600, "menu": "s0000D3358", "headMenu": "s0000D335B"}, {"minutes": 90, "price": 9000, "menu": "s0000D335C", "headMenu": "s0000D335D"}]}, {"key": "relax", "label": "からだのほぐし", "description": "心地よい強さで、全身のお疲れをほぐします。", "options": [{"minutes": 30, "price": 3000, "menu": "s0000D335E", "headMenu": "s0000D335F"}, {"minutes": 45, "price": 4300, "menu": "s0000D3360", "headMenu": "s0000D3361"}, {"minutes": 60, "price": 5500, "menu": "s0000D3363", "headMenu": "s0000D3364"}, {"minutes": 75, "price": 7000, "menu": "s0000D3365", "headMenu": "s0000D3366"}, {"minutes": 90, "price": 8500, "menu": "s0000D3367", "headMenu": "s0000D3368"}]}, {"key": "oil", "label": "全身オイル", "description": "オイルを使ったトリートメント。", "options": [{"minutes": 60, "price": 7500, "menu": "s0000D336A", "headMenu": "s0000D336C"}, {"minutes": 75, "price": 9000, "menu": "s0000D336D", "headMenu": "s0000D336E"}, {"minutes": 90, "price": 10500, "menu": "s0000D336F", "headMenu": "s0000D3370"}, {"minutes": 105, "price": 12000, "menu": "s0000D3371", "headMenu": "s0000D3372"}, {"minutes": 120, "price": 13500, "menu": "s0000D3373", "headMenu": "s0000D3374"}]}, {"key": "foot", "label": "足つぼ", "description": "オイルを使って、足裏・足部をケアします。", "options": [{"minutes": 30, "price": 3300, "menu": "s0000D3375", "headMenu": "s0000D3377"}, {"minutes": 45, "price": 4600, "menu": "s0000D3379", "headMenu": "s0000D337A"}, {"minutes": 60, "price": 5800, "menu": "s0000D337B", "headMenu": "s0000D337C"}]}, {"key": "set", "label": "ほぐし＋足つぼ", "description": "からだのほぐしと足つぼを組み合わせたコース。", "options": [{"minutes": 60, "price": 5800, "menu": "s0000D337D", "headMenu": "s0000D337E"}, {"minutes": 90, "price": 8800, "menu": "s0000D337F", "headMenu": "s0000D3380"}]}, {"key": "leg", "label": "美脚コース", "description": "整体45分＋脚オイル45分のセット。", "options": [{"minutes": 90, "price": 9000, "menu": "s0000D3381", "headMenu": "s0000D3382"}]}, {"key": "leg-oil", "label": "脚のオイル", "description": "脚のみのオイルトリートメント。", "options": [{"minutes": 45, "price": 5000, "menu": "s0000D3383", "headMenu": "s0000D3385"}, {"minutes": 60, "price": 6600, "menu": "s0000D3386", "headMenu": "s0000D3387"}]}];
  const app = document.getElementById('booking-app');
  if (!app) return;
  const screen = document.getElementById('booking-screen');
  const progress = [...app.querySelectorAll('.booking-progress li')];
  let step = 0, courseKey = '', minutes = 0, head = null;
  const yen = amount => amount.toLocaleString('ja-JP') + '円';
  const course = () => courses.find(item => item.key === courseKey);
  const option = () => course()?.options.find(item => item.minutes === minutes);
  const latest = length => {
    const time = Math.min(18 * 60, 20 * 60 - length - 30);
    return Math.floor(time / 60) + ':' + String(time % 60).padStart(2, '0');
  };
  const choice = (name, value, title, detail, checked) => `<label class="booking-choice"><input type="radio" name="${name}" value="${value}" ${checked ? 'checked' : ''}><span class="booking-choice-text"><strong>${title}</strong><span>${detail}</span></span></label>`;
  function render(moveFocus = false) {
    progress.forEach((item, i) => {
      item.classList.toggle('is-complete', i < step);
      if (i === step) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
    });
    let content;
    if (step === 0) {
      content = `<fieldset><legend id="booking-step-title" tabindex="-1">1. 施術の種類をお選びください</legend><div class="booking-choices booking-course-choices">${courses.map(item => choice('course', item.key, item.label, item.description, item.key === courseKey)).join('')}</div></fieldset><div class="booking-actions"><button class="button button-primary booking-next" type="button" ${courseKey ? '' : 'disabled'}>時間を選ぶ →</button></div>`;
    } else if (step === 1) {
      content = `<p class="booking-current">選んだ施術：<strong>${course().label}</strong></p><fieldset><legend id="booking-step-title" tabindex="-1">2. 時間をお選びください</legend><p class="booking-field-note">料金はすべて税込です。</p><div class="booking-choices">${course().options.map(item => choice('time', item.minutes, (courseKey === 'seitai' ? '約' : '') + item.minutes + '分', yen(item.price), item.minutes === minutes)).join('')}</div></fieldset><div class="booking-actions"><button class="booking-back" type="button">← 施術の種類に戻る</button><button class="button button-primary booking-next" type="button" ${minutes ? '' : 'disabled'}>ヘッドの追加を選ぶ →</button></div>`;
    } else {
      content = `<p class="booking-current">選んだ施術：<strong>${course().label} ${minutes}分</strong></p><fieldset><legend id="booking-step-title" tabindex="-1">3. ヘッドを追加しますか？</legend><p class="booking-field-note">頭をほぐす15分の追加メニューです。</p><div class="booking-choices">${choice('head', 'no', '追加しない', yen(option().price), head === false)}${choice('head', 'yes', 'ヘッド15分を追加する', '＋1,500円 ／ 合計 ' + yen(option().price + 1500), head === true)}</div></fieldset><div id="booking-summary" aria-live="polite"></div><div class="booking-actions"><button class="booking-back" type="button">← 時間の選択に戻る</button><span id="booking-link-wrap"></span></div><p class="booking-after-note">次の画面で日時とお名前・連絡先を入力すると予約できます。<br>この画面で選ぶだけでは、予約は確定しません。</p>`;
    }
    screen.innerHTML = content;
    if (step === 2) updateSummary();
    if (moveFocus) {
      const title = document.getElementById('booking-step-title');
      title.focus({preventScroll: true});
      app.scrollIntoView({block: 'start', behavior: 'instant'});
    }
  }
  function updateSummary() {
    const summary = document.getElementById('booking-summary');
    const wrap = document.getElementById('booking-link-wrap');
    if (head === null) {
      summary.innerHTML = '';
      wrap.innerHTML = '<button class="button button-primary" type="button" disabled>空き日時を選ぶ →</button>';
      return;
    }
    const treatment = minutes + (head ? 15 : 0);
    const total = option().price + (head ? 1500 : 0);
    const menu = head ? option().headMenu : option().menu;
    summary.innerHTML = `<div class="booking-summary"><h3>選択したコース</h3><p class="booking-summary-course">${course().label} ${minutes}分${head ? '＋ヘッド15分' : ''}</p><p class="booking-total">合計 <strong>${yen(total)}</strong><span>（税込）</span></p><dl><div><dt>施術時間の目安</dt><dd>約${treatment}分</dd></div><div><dt>最終開始時刻</dt><dd>${latest(treatment)}</dd></div></dl><p>予約ページには、施術後の入れ替え時間30分を含む<strong>${treatment + 30}分</strong>の予約枠が表示されます。</p><p>ネット予約・キャンセルは前日23時まで。お支払いは店頭で現金・PayPayをご利用いただけます。</p></div>`;
    wrap.innerHTML = `<a class="button button-primary booking-final" href="https://airrsv.net/aqua-forme-mitaka/calendar?schdlId=${encodeURIComponent(menu)}">空き日時を選ぶ →</a>`;
  }
  screen.addEventListener('change', event => {
    const input = event.target;
    if (input.name === 'course') {
      if (courseKey !== input.value) { minutes = 0; head = null; }
      courseKey = input.value;
    } else if (input.name === 'time') {
      if (minutes !== Number(input.value)) head = null;
      minutes = Number(input.value);
    } else if (input.name === 'head') {
      head = input.value === 'yes';
      updateSummary();
    }
    const next = screen.querySelector('.booking-next');
    if (next) next.disabled = step === 0 ? !courseKey : !minutes;
  });
  screen.addEventListener('click', event => {
    if (event.target.closest('.booking-next') && step < 2) { step++; render(true); }
    if (event.target.closest('.booking-back') && step > 0) { step--; render(true); }
  });
  app.hidden = false;
  render();
})();
