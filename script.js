const grades = [
  {
    name: "S235JR",
    limits: [
      { maxT: 3, yieldMin: 235, tensile: [360, 510], elong: 26 },
      { maxT: 100, yieldMin: 225, tensile: [360, 510], elong: 25 },
      { maxT: 150, yieldMin: 215, tensile: [340, 490], elong: 24 },
      { maxT: 400, yieldMin: 215, tensile: [330, 480], elong: 24 },
    ],
  },
  {
    name: "S275JR",
    limits: [
      { maxT: 3, yieldMin: 275, tensile: [410, 560], elong: 23 },
      { maxT: 100, yieldMin: 265, tensile: [410, 560], elong: 22 },
      { maxT: 150, yieldMin: 255, tensile: [380, 540], elong: 21 },
      { maxT: 400, yieldMin: 255, tensile: [380, 540], elong: 21 },
    ],
  },
  {
    name: "S355JR",
    limits: [
      { maxT: 3, yieldMin: 355, tensile: [470, 630], elong: 22 },
      { maxT: 100, yieldMin: 345, tensile: [470, 630], elong: 21 },
      { maxT: 150, yieldMin: 335, tensile: [450, 600], elong: 20 },
      { maxT: 400, yieldMin: 335, tensile: [450, 600], elong: 20 },
    ],
  },
  {
  name: "S460JR",
  limits: [
    { maxT: 3, yieldMin: 460, tensile: [550, 720], elong: 17 },
    { maxT: 100, yieldMin: 440, tensile: [550, 720], elong: 17 },
    { maxT: 150, yieldMin: 430, tensile: [530, 710], elong: 17 },
    { maxT: 400, yieldMin: 430, tensile: [530, 710], elong: 17 },
  ],
},

  {
    name: "S500J0",
    limits: [
      { maxT: 3, yieldMin: 500, tensile: [580, 760], elong: 17 },
      { maxT: 100, yieldMin: 480, tensile: [580, 760], elong: 17 },
      { maxT: 150, yieldMin: 460, tensile: [550, 750], elong: 17 },
      { maxT: 400, yieldMin: 460, tensile: [550, 750], elong: 17 },
    ],
  },
];

function determineClosestSteel() {
  const t = parseFloat(document.getElementById("thickness").value);
  const fy = parseFloat(document.getElementById("yield").value);
  const fu = parseFloat(document.getElementById("tensile").value);
  const a = parseFloat(document.getElementById("elongation").value);
  const resultDiv = document.getElementById("result");

  if ([t, fy, fu, a].some(v => isNaN(v))) {
    resultDiv.innerHTML = "❌ من فضلك أدخل جميع القيم بشكل صحيح.";
    return;
  }

  function getLimitForThickness(limits, thickness) {
    return limits.find(lim => thickness <= lim.maxT) || null;
  }

  let closestGrade = null;
  let closestScore = Infinity;
  let details = [];

  for (const grade of grades) {
    const limit = getLimitForThickness(grade.limits, t);
    if (!limit) continue;

    let yieldDiff = fy < limit.yieldMin ? 1000 + (limit.yieldMin - fy) : fy - limit.yieldMin;
    let tensileDiff = 0;
    if (fu < limit.tensile[0]) tensileDiff = 1000 + (limit.tensile[0] - fu);
    else if (fu > limit.tensile[1]) tensileDiff = 1000 + (fu - limit.tensile[1]);

    let elongDiff = a < limit.elong ? 1000 + (limit.elong - a) : a - limit.elong;

    const totalDiff = yieldDiff + tensileDiff + elongDiff;

    details.push({
      name: grade.name,
      yieldDiff,
      tensileDiff,
      elongDiff,
      totalDiff,
    });

    if (totalDiff < closestScore) {
      closestScore = totalDiff;
      closestGrade = grade.name;
    }
  }

  if (!closestGrade) {
    resultDiv.innerHTML = "❌ لم يتم العثور على نوع مناسب.";
    return;
  }

  details.sort((a, b) => a.totalDiff - b.totalDiff);

  let html = `✅ النوع الأقرب هو: <strong>${closestGrade}</strong><br>`;
  let first = details[0];
  if (first.yieldDiff >= 1000) html += `⚠️ إجهاد الخضوع أقل من الحد الأدنى المطلوب.<br>`;
  if (first.tensileDiff >= 1000) html += `⚠️ إجهاد الشد خارج النطاق المطلوب.<br>`;
  if (first.elongDiff >= 1000) html += `⚠️ الاستطالة أقل من الحد الأدنى المطلوب.<br>`;

  if (details.length > 1) {
    html += `<br>💡 أنواع أخرى قريبة:<br><ul>`;
    for (let i = 1; i < details.length; i++) {
      html += `<li>${details[i].name} (فرق: ${details[i].totalDiff.toFixed(1)})</li>`;
    }
    html += `</ul>`;
  }

  resultDiv.innerHTML = html;
}
