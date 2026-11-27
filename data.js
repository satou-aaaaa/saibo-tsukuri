// 細胞のつくりあての問題を作る（ブラウザと node の両方で使う）。
// 中身は、大阪府教育委員会の中学2年理科プリント（解答）・大阪府教育センターの指導案・千葉県教育委員会「やる気アップ 理科」・長野県総合教育センターのクリア問題・岩手県の教材・神戸大学の実験資料（下の SRC。2026-11-17 に読んだ）で確かめたことだけ。
// 1問は、顕微鏡で見たことや説明を読んで、細胞のつくり（核・細胞膜・細胞壁・葉緑体・液胞）を選ぶ。正解したら2段目「どんなはたらき？」を選ぶ。
// ミトコンドリア・細胞質・単細胞生物と多細胞生物は扱わない。液胞は、中学の資料（大阪府）にならって「植物の細胞だけに見られるもの」とする。
// 選び肢は、ほかの4つから選ぶ（やさしいは2つ、ふつう・むずかしいは3つ）。
// 乱数 R は呼ぶ回数が毎回同じになるように使う（sort の比較の中では引かない）。同じ tag なら、どの端末でも同じ問題になる。
// KINDS・言い回しの並びは最後に足すだけにする（並べ替え・削除をすると過去の日の問題が変わる）。
(function (root) {
  "use strict";
  const LV = ["やさしい", "ふつう", "むずかしい"];

  // 出典（画面の「なぜ」に出す）
  const SRC = {
    osaka: ["大阪府教育委員会「中学2年理科 生物と細胞」確認プリント（解答）", "https://www.pref.osaka.lg.jp/documents/25642/rika_2nen_15_1kaku1_kai.pdf"],
    osaka2: ["大阪府教育委員会「中学2年理科 生物と細胞」補充プリント（解答）", "https://www.pref.osaka.lg.jp/documents/25642/rika_2nen_15_2hoju_kai.pdf"],
    oc1: ["大阪府教育センター 理科の指導案「光合成が行われる場所（オオカナダモの葉緑体）」", "https://www.osaka-c.ed.jp/rika/plan/2_1plan.pdf"],
    oc2: ["大阪府教育センター 理科の指導案「光合成が行われる場所」本時の展開", "https://www.osaka-c.ed.jp/rika/plan/2_2tenkai.pdf"],
    chiba: ["千葉県教育委員会「やる気アップ 理科」生物と細胞（解答つき）", "https://www.pref.chiba.lg.jp/kyouiku/shidou/gakuryoku/yaruki/rika/documents/15r02.pdf"],
    nagano: ["長野県総合教育センター 中学2年理科 クリア問題11", "https://www.edu-ctr.pref.nagano.lg.jp/kjouhou/manabi-hiroba/01_clear_challenge_mondai/rika_clear/data/r_cl_chu2_11.pdf"],
    iwate: ["岩手県 生物基礎の教材「いろいろな細胞の観察（タマネギ他）」", "https://www1.iwate-ed.jp/07tantou/kagaku/h24_seibutsukiso/File/pdf/h24_0404_2_05.pdf"],
    kobe: ["神戸大学 実験資料「プロトプラスト」", "https://www.edu.kobe-u.ac.jp/iphe-seibutu/jikken_r2/protoplast-siryou.pdf"],
  };

  // 答えになる5つ
  const CLASSES = ["核", "細胞膜", "細胞壁", "葉緑体", "液胞"];

  // 2段目「どんなはたらき？」の3つ
  const GROUPS = {
    shikiri: { name: "細胞のしきりになる", sub: "細胞と細胞のさかいめにある" },
    tsukuru: { name: "光合成を行う", sub: "光を受けてデンプンをつくる" },
    motsu: { name: "細胞の中で物質をもつ・ためる", sub: "染色液で染まるものや、とけた物質がある" },
  };
  // どの細胞に見られる（「なぜ」に出す。大阪府のプリント）
  const CATS = { ryoho: "植物と動物の両方の細胞", shoku: "植物の細胞だけ" };
  // 答えごとの決まり。2段目・どの細胞・決め手はこの表で決まる（qa/run.mjs が別に持った表でも確かめる）
  const RULE = {
    "核": { grp: "motsu", cat: "ryoho", key: "核は、植物と動物の両方の細胞にあり、酢酸オルセイン液や酢酸カーミン液などの染色液によく染まります。" },
    "細胞膜": { grp: "shikiri", cat: "ryoho", key: "細胞膜は、植物と動物の両方の細胞にあります。植物の細胞では、そのさらに外側に細胞壁があります。" },
    "細胞壁": { grp: "shikiri", cat: "shoku", key: "細胞壁は、細胞膜の外側にある厚くてじょうぶなしきりで、植物のからだをじょうぶにします。植物の細胞だけに見られます。" },
    "葉緑体": { grp: "tsukuru", cat: "shoku", key: "葉緑体は、葉などの緑色をした部分の細胞にあり、ここで光合成が行われます。植物の細胞だけに見られます。" },
    "液胞": { grp: "motsu", cat: "shoku", key: "液胞は、物質を貯蔵するつくりで、不要な物質や色素がとけています。中学では植物の細胞だけに見られるものとして学びます。" },
  };

  // part:ri:begin（shared-workflows の template/parts/data/ri.js の写し。ここでは直さない。node scripts/sync-template.mjs で写す）
  const ri = (R, a, b) => a + Math.floor(R() * (b - a + 1));
  // part:ri:end
  // part:shuffle:begin（shared-workflows の template/parts/data/shuffle.js の写し。ここでは直さない。node scripts/sync-template.mjs で写す）
  function shuffle(R, a) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = ri(R, 0, i); [b[i], b[j]] = [b[j], b[i]]; } return b; }
  // part:shuffle:end
  // part:pickN:begin（shared-workflows の template/parts/data/pickN.js の写し。ここでは直さない。node scripts/sync-template.mjs で写す）
  function pickN(R, a, n) { return shuffle(R, a).slice(0, n); }
  // part:pickN:end
  const MEDIA = ["理科室で", "理科の授業で", "観察ノートで", "家で", "テスト勉強で"];
  // 問いの前につく言い方（どれでも答えは同じ）
  const PRE = ["顕微鏡で観察した。", "理科の授業で。", "プリントの問題。", "こんなつくり。", "観察ノートより。"];

  // どれかを当てる問題。ans：答え、sit：言い方。選び肢は、ほかの4つから（やさしいは2つ、ふつう・むずかしいは3つ）
  function which(ans, sit) {
    const near = CLASSES.filter((c) => c !== ans);
    return (R, lv) => {
      const si = ri(R, 0, sit.length - 1), mi = ri(R, 0, MEDIA.length - 1);
      const n = lv === 0 ? 2 : 3, ds = pickN(R, near, n);
      const q = sit[si] + "　どのつくり？";
      return { type: "act", media: MEDIA[mi], q, opts: shuffle(R, [ans, ...ds]), ans, rev: false, v: `${si}:${mi}` };
    };
  }
  // 1つの種類を作る。grp・cat・key は答えの決まり RULE から。clue は手がかりの文（PRE と組む）
  function K(id, lv, ans, name, src, look, why, clue) {
    const r = RULE[ans];
    return { id, lv, grp: r.grp, cat: r.cat, ans, name, src, look, key: r.key, why, make: which(ans, clue.flatMap((c) => PRE.map((p) => p + c))) };
  }

  const KINDS = [
    // ---- やさしい ----
    K("k_hoo", 0, "核", "ほおの細胞を染める", ["chiba", "iwate"], "染色液で何が染まったか。",
      "ほおの内側の細胞に酢酸カーミン液（酢酸オルセイン液）をたらすと、核が染まって見えます（千葉県のプリント）。酢酸オルセインでは核が赤色に染まります（岩手県の教材）。",
      ["ほおの内側を綿棒でこすりとり、酢酸カーミン液をたらすと、細胞の中の一部分が赤く染まった。"]),
    K("m_soto", 0, "細胞膜", "動物の細胞のいちばん外側", ["osaka", "nagano"], "動物の細胞には、じょうぶなしきりがありません。",
      "植物と動物の細胞に共通するのは核と細胞膜です（大阪府のプリント・長野県のクリア問題）。動物の細胞には細胞壁がないので、いちばん外側は細胞膜です。",
      ["動物の細胞のいちばん外側で、細胞をつつんでいるつくり。", "ほおの内側の細胞で、まわりとのさかいめになっているつくり。"]),
    K("w_joubu", 0, "細胞壁", "厚くてじょうぶなしきり", ["osaka"], "植物の細胞だけにある、外側のしきりです。",
      "細胞壁は、細胞膜の外側にある厚くてじょうぶなしきりです（大阪府のプリント）。",
      ["植物の細胞のいちばん外側にある、厚くてじょうぶなしきり。"]),
    K("y_kanada", 0, "葉緑体", "オオカナダモの緑色の粒", ["oc1"], "緑色に見えるつくりです。",
      "オオカナダモの葉の細胞には、緑色の葉緑体がたくさんあり、球形（円盤状）に見えます（大阪府教育センターの指導案）。",
      ["オオカナダモの葉の細胞を観察すると、細胞の中に緑色の粒がたくさん見えた。"]),
    K("e_tameru", 0, "液胞", "物質をためる袋", ["osaka"], "物質を貯蔵するつくりです。",
      "液胞は物質を貯蔵するつくりで、不要な物質や色素がとけています（大阪府のプリント）。",
      ["植物の細胞の中にあって、物質を貯蔵しているつくり。"]),
    // ---- ふつう ----
    K("k_tamanegi", 1, "核", "タマネギの表皮を染める", ["iwate"], "染色液に注目しましょう。",
      "タマネギの表皮に酢酸オルセイン染色液をたらすと、核が赤色に染まります（岩手県の教材）。",
      ["タマネギの表皮に酢酸オルセイン液をたらすと、どの細胞にも赤く染まった部分が見えた。"]),
    K("m_kyotsu", 1, "細胞膜", "植物にも動物にもあるしきり", ["osaka2", "nagano"], "動物の細胞にもあります。",
      "細胞膜は、植物の細胞と動物の細胞に共通するつくりです（大阪府の補充プリント・長野県のクリア問題）。",
      ["植物の細胞にも動物の細胞にもある、細胞のまわりのしきり。染色液では染まりにくい。"]),
    K("w_karada", 1, "細胞壁", "植物のからだをじょうぶにする", ["osaka", "chiba"], "動物の細胞にはありません。",
      "細胞壁は植物のからだをじょうぶにします（大阪府のプリント）。植物は細胞壁があるために運動性が低いと考えられます（千葉県のプリント）。",
      ["植物のからだをじょうぶにしているつくり。動物の細胞にはない。"]),
    K("y_youso", 1, "葉緑体", "ヨウ素液で青紫色", ["oc1", "chiba"], "光を当てた葉で、デンプンがあるのはどこか。",
      "光を当てたオオカナダモの葉にヨウ素液をたらすと、葉緑体が青紫色に染まります。デンプンがある印です（大阪府教育センターの指導案・千葉県のプリント）。",
      ["数時間光を当てたオオカナダモの葉にヨウ素液をたらすと、細胞の中の粒が青紫色に染まった。"]),
    K("e_fuyou", 1, "液胞", "不要な物質がとけている", ["osaka", "chiba"], "植物は、いらないものをためておけます。",
      "液胞には不要な物質や色素がとけています（大阪府のプリント）。植物は老廃物を液胞にためるので、動物のように排出する必要がないと考えられます（千葉県のプリント）。",
      ["植物の細胞で、不要な物質や色素がとけている部分。"]),
    // ---- むずかしい ----
    K("k_kyotsu", 2, "核", "両方にあって、よく染まる", ["osaka", "osaka2"], "染色液に注目しましょう。",
      "核は植物と動物の両方の細胞にあり、酢酸オルセイン液や酢酸カーミン液などの染色液によく染まります（大阪府のプリント）。",
      ["植物の細胞にも動物の細胞にもあって、酢酸オルセイン液などの染色液によく染まるつくり。"]),
    K("m_uchi", 2, "細胞膜", "じょうぶなしきりのすぐ内側", ["osaka"], "細胞壁の内側にあるものです。",
      "細胞壁は細胞膜の外側にある厚くてじょうぶなしきりです（大阪府のプリント）。つまり、植物の細胞では、細胞膜は細胞壁のすぐ内側にあります。",
      ["植物の細胞で、厚くてじょうぶなしきりのすぐ内側にあるつくり。動物の細胞では、これがいちばん外側になる。"]),
    K("w_kouso", 2, "細胞壁", "酵素でとけてプロトプラストに", ["kobe"], "とかしても細胞は残りました。",
      "細胞壁を酵素でとかすと、プロトプラストができます（神戸大学の実験資料）。",
      ["植物の細胞を酵素の液につけると、ある部分がとけて、プロトプラストができた。とけた部分。"]),
    K("y_ugoku", 2, "葉緑体", "光で動く粒", ["oc2", "oc1"], "光の強さで並び方が変わりました。",
      "葉緑体は、弱い光では散らばり、強い光では集まります。光に反応して動くようです（大阪府教育センターの指導案）。",
      ["オオカナダモの葉に強い光を当てると集まり、弱い光では散らばった粒。", "ふ入りの葉で、緑色の部分の細胞にはあり、白い部分の細胞にはない粒。"]),
    K("e_iro", 2, "液胞", "アントシアニンの入れ物", ["kobe", "osaka"], "色素がとけている所です。",
      "赤や青の色素アントシアニンは、液胞にあります（神戸大学の実験資料）。液胞には不要な物質や色素がとけています（大阪府のプリント）。",
      ["赤や青の色素アントシアニンがとけている、植物の細胞のつくり。"]),
  ];
  const BY = Object.fromEntries(KINDS.map((k) => [k.id, k]));
  const kindsOf = (lv) => KINDS.filter((k) => k.lv === lv).map((k) => k.id);

  // part:seedOf:begin（shared-workflows の template/parts/data/seedOf.js の写し。ここでは直さない。node scripts/sync-template.mjs で写す）
  function seedOf(str) { let h = 2166136261; for (const ch of String(str)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  // part:seedOf:end
  // part:rng:begin（shared-workflows の template/parts/data/rng.js の写し。ここでは直さない。node scripts/sync-template.mjs で写す）
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  // part:rng:end

  // 1問を作る。tag は「種類|種」（例 "k_hoo|2026-11-18:d0"）。同じ tag ならいつも同じ問題
  function make(tag) {
    const [kind] = String(tag).split("|"), k = BY[kind];
    if (!k) return null;
    const p = k.make(rng(seedOf(tag)), k.lv);
    return { tag, kind, lv: k.lv, name: k.name, look: k.look, key: k.key, why: k.why, grp: k.grp, cat: k.cat, src: k.src.map((s) => SRC[s]), ...p };
  }
  const keyOf = (P) => `${P.kind}:${P.q}:${P.opts.slice().sort().join("/")}`;

  // 今日の5問（やさしい2・ふつう2・むずかしい1）。種類は重ねない
  function dailyTags(date) {
    const R = rng(seedOf("day:" + date)), e = pickN(R, kindsOf(0), 2), n = pickN(R, kindsOf(1), 2), h = pickN(R, kindsOf(2), 1);
    return [...e, ...n, ...h].map((id, i) => `${id}|${date}:d${i}`);
  }
  // 上級の3問（むずかしいだけ・今日の5問のむずかしいとは別の種類）
  function hardTags(date) {
    const dh = dailyTags(date)[4].split("|")[0], R = rng(seedOf("hard:" + date)), h = pickN(R, kindsOf(2).filter((x) => x !== dh), 3);
    return h.map((id, i) => `${id}|${date}:h${i}`);
  }

  const SBT = { KINDS, BY, GROUPS, CATS, RULE, LV, SRC, CLASSES, kindsOf, seedOf, rng, make, keyOf, dailyTags, hardTags, pickN };
  if (typeof module !== "undefined" && module.exports) module.exports = SBT; else root.SBT = SBT;
})(typeof self !== "undefined" ? self : this);
