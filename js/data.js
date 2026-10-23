// Mock data for the prototype. Nothing here talks to a server.

const DATA = {};

/* ---------- Helpers ---------- */

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function gcd(a, b) { return b ? gcd(b, a % b) : Math.abs(a); }

/* ---------- Weekly Test question bank (Accounting) ---------- */
// type: mcq | tf | short. answer is the correct option text.

DATA.weeklyBank = [
  // Assets
  { id: 'a1', topic: 'Assets', level: 'easy', type: 'mcq', q: 'What are assets?', options: ['Bank loan', 'Inventory', 'Capital', 'Workers'], answer: 'Inventory', explain: 'Assets are resources owned by a business. Inventory is a current asset as it represents goods held for sale.' },
  { id: 'a2', topic: 'Assets', level: 'easy', type: 'tf', q: 'Cash in the bank is an asset.', options: ['True', 'False'], answer: 'True', explain: 'Cash at bank is money the business owns and can use, so it is a current asset.' },
  { id: 'a3', topic: 'Assets', level: 'medium', type: 'mcq', q: 'Which of these is a non-current asset?', options: ['Inventory', 'Trade receivables', 'Machinery', 'Cash'], answer: 'Machinery', explain: 'Non-current assets are used for more than one year. Machinery is used over many years to run the business.' },
  { id: 'a4', topic: 'Assets', level: 'medium', type: 'mcq', q: 'Money owed to the business by customers is called…', options: ['Trade payables', 'Trade receivables', 'Drawings', 'Revenue'], answer: 'Trade receivables', explain: 'Trade receivables are amounts customers owe the business for credit sales. They are a current asset.' },
  { id: 'a5', topic: 'Assets', level: 'hard', type: 'mcq', q: 'Prepaid rent at year end is classified as…', options: ['A current asset', 'A current liability', 'An expense', 'Equity'], answer: 'A current asset', explain: 'Rent paid in advance gives the business a future benefit (use of the premises), so it is a current asset until used.' },
  { id: 'a6', topic: 'Assets', level: 'easy', type: 'short', q: 'Name the asset that represents goods held for resale.', answer: 'Inventory', accept: ['inventory', 'stock', 'inventories'], explain: 'Goods bought to be resold are inventory (also called stock).' },
  { id: 'a7', topic: 'Assets', level: 'hard', type: 'tf', q: 'Depreciation increases the carrying value of a non-current asset.', options: ['True', 'False'], answer: 'False', explain: 'Depreciation spreads the cost of an asset over its life and reduces its carrying value.' },

  // Liabilities
  { id: 'l1', topic: 'Liabilities', level: 'easy', type: 'mcq', q: 'Which of these is a liability?', options: ['Cash', 'Equipment', 'Loan', 'Inventory'], answer: 'Loan', explain: 'Liabilities are obligations or debts. A loan represents money owed to external parties.' },
  { id: 'l2', topic: 'Liabilities', level: 'easy', type: 'tf', q: 'Trade payables are amounts the business owes suppliers.', options: ['True', 'False'], answer: 'True', explain: 'Buying on credit from suppliers creates trade payables, a current liability.' },
  { id: 'l3', topic: 'Liabilities', level: 'medium', type: 'mcq', q: 'A 5-year bank loan is a…', options: ['Current liability', 'Non-current liability', 'Current asset', 'Expense'], answer: 'Non-current liability', explain: 'Debts due after more than 12 months are non-current liabilities.' },
  { id: 'l4', topic: 'Liabilities', level: 'medium', type: 'mcq', q: 'Wages owed to staff at year end are recorded as…', options: ['Accrued expenses', 'Prepaid expenses', 'Revenue', 'Drawings'], answer: 'Accrued expenses', explain: 'Expenses incurred but not yet paid are accruals, shown as a current liability.' },
  { id: 'l5', topic: 'Liabilities', level: 'hard', type: 'mcq', q: 'A customer pays in advance for goods not yet delivered. This creates…', options: ['Trade receivables', 'Deferred revenue', 'Sales revenue', 'Capital'], answer: 'Deferred revenue', explain: 'Cash received before the goods are delivered is a liability (deferred or unearned revenue) until the sale happens.' },
  { id: 'l6', topic: 'Liabilities', level: 'easy', type: 'short', q: 'What do we call money the business owes to suppliers?', answer: 'Trade payables', accept: ['trade payables', 'payables', 'creditors', 'accounts payable'], explain: 'Amounts owed to suppliers for credit purchases are trade payables (creditors).' },

  // Equity
  { id: 'e1', topic: 'Equity', level: 'easy', type: 'mcq', q: 'Capital introduced by the owner is part of…', options: ['Liabilities', 'Equity', 'Assets', 'Expenses'], answer: 'Equity', explain: "The owner's investment belongs to equity — the owner's claim on the business." },
  { id: 'e2', topic: 'Equity', level: 'medium', type: 'mcq', q: 'Which formula is the accounting equation?', options: ['Assets = Liabilities − Equity', 'Assets = Liabilities + Equity', 'Equity = Assets + Liabilities', 'Liabilities = Assets + Equity'], answer: 'Assets = Liabilities + Equity', explain: 'Everything a business owns (assets) is financed by outsiders (liabilities) or the owner (equity).' },
  { id: 'e3', topic: 'Equity', level: 'medium', type: 'tf', q: 'Drawings increase the owner’s equity.', options: ['True', 'False'], answer: 'False', explain: 'Drawings are withdrawals by the owner, so they reduce equity.' },
  { id: 'e4', topic: 'Equity', level: 'hard', type: 'mcq', q: 'Assets are $80,000 and liabilities are $35,000. What is equity?', options: ['$115,000', '$45,000', '$35,000', '$80,000'], answer: '$45,000', explain: 'Equity = Assets − Liabilities = $80,000 − $35,000 = $45,000.' },
  { id: 'e5', topic: 'Equity', level: 'easy', type: 'tf', q: 'A net profit increases equity.', options: ['True', 'False'], answer: 'True', explain: 'Profit belongs to the owner, so it is added to equity.' },

  // Journal Entry
  { id: 'j1', topic: 'Journal Entry', level: 'easy', type: 'mcq', q: 'Bought equipment with cash. Which account is debited?', options: ['Cash', 'Equipment', 'Capital', 'Sales'], answer: 'Equipment', explain: 'The asset received (equipment) increases, so it is debited; cash decreases and is credited.' },
  { id: 'j2', topic: 'Journal Entry', level: 'medium', type: 'mcq', q: 'Paid rent of $500 by cheque. The journal entry is…', options: ['Dr Bank, Cr Rent', 'Dr Rent, Cr Bank', 'Dr Rent, Cr Capital', 'Dr Capital, Cr Bank'], answer: 'Dr Rent, Cr Bank', explain: 'Expenses increase with a debit; paying from the bank reduces an asset, so bank is credited.' },
  { id: 'j3', topic: 'Journal Entry', level: 'easy', type: 'tf', q: 'Every journal entry needs a short narration.', options: ['True', 'False'], answer: 'True', explain: 'A narration explains why the entry was made, which helps anyone reviewing the records.' },
  { id: 'j4', topic: 'Journal Entry', level: 'hard', type: 'mcq', q: 'Sold goods on credit to Tan Ltd. Which account is credited?', options: ['Tan Ltd', 'Sales', 'Bank', 'Inventory'], answer: 'Sales', explain: 'Revenue increases with a credit. Tan Ltd (a receivable) is debited because they now owe the business.' },
  { id: 'j5', topic: 'Journal Entry', level: 'medium', type: 'short', q: 'Increases in expenses are recorded on which side?', answer: 'Debit', accept: ['debit', 'dr', 'debit side'], explain: 'Assets and expenses increase on the debit side.' },
  { id: 'j6', topic: 'Journal Entry', level: 'hard', type: 'tf', q: 'In double entry, total debits can be more than total credits for one transaction.', options: ['True', 'False'], answer: 'False', explain: 'Each transaction has equal debits and credits — that is the core rule of double entry.' },

  // Trial Balance
  { id: 't1', topic: 'Trial Balance', level: 'easy', type: 'mcq', q: 'A trial balance checks that…', options: ['Profit is correct', 'Total debits equal total credits', 'Cash is enough', 'Assets exceed liabilities'], answer: 'Total debits equal total credits', explain: 'The trial balance lists all ledger balances to confirm debits and credits agree.' },
  { id: 't2', topic: 'Trial Balance', level: 'medium', type: 'tf', q: 'A balanced trial balance means there are no errors at all.', options: ['True', 'False'], answer: 'False', explain: 'Some errors (e.g. omission or compensating errors) do not affect the totals, so a balanced trial balance can still hide mistakes.' },
  { id: 't3', topic: 'Trial Balance', level: 'medium', type: 'mcq', q: 'In a trial balance, drawings appear in the…', options: ['Debit column', 'Credit column', 'Both columns', 'Neither'], answer: 'Debit column', explain: 'Drawings reduce equity and have a debit balance.' },
  { id: 't4', topic: 'Trial Balance', level: 'hard', type: 'mcq', q: 'Which error would cause the trial balance NOT to agree?', options: ['Error of omission', 'Single-sided entry', 'Error of principle', 'Compensating error'], answer: 'Single-sided entry', explain: 'Recording only one side of a transaction makes debits and credits unequal.' },
  { id: 't5', topic: 'Trial Balance', level: 'easy', type: 'tf', q: 'Sales revenue has a credit balance.', options: ['True', 'False'], answer: 'True', explain: 'Income accounts increase with credits, so revenue normally has a credit balance.' },

  // Income Statement
  { id: 'i1', topic: 'Income Statement', level: 'easy', type: 'mcq', q: 'Gross profit is…', options: ['Sales − Cost of sales', 'Sales − Expenses', 'Assets − Liabilities', 'Cash in − Cash out'], answer: 'Sales − Cost of sales', explain: 'Gross profit is what is left from sales after deducting the cost of the goods sold.' },
  { id: 'i2', topic: 'Income Statement', level: 'medium', type: 'mcq', q: 'Sales $50,000, cost of sales $30,000, expenses $8,000. Net profit?', options: ['$20,000', '$12,000', '$42,000', '$88,000'], answer: '$12,000', explain: 'Gross profit = $20,000. Net profit = $20,000 − $8,000 = $12,000.' },
  { id: 'i3', topic: 'Income Statement', level: 'easy', type: 'tf', q: 'Buying a delivery van is an expense in the income statement.', options: ['True', 'False'], answer: 'False', explain: 'A van is a non-current asset. Only its depreciation for the year is an expense.' },
  { id: 'i4', topic: 'Income Statement', level: 'hard', type: 'mcq', q: 'Opening inventory $4,000, purchases $20,000, closing inventory $6,000. Cost of sales?', options: ['$18,000', '$22,000', '$30,000', '$10,000'], answer: '$18,000', explain: 'Cost of sales = opening inventory + purchases − closing inventory = $4,000 + $20,000 − $6,000.' },
  { id: 'i5', topic: 'Income Statement', level: 'medium', type: 'short', q: 'Sales minus cost of sales gives what?', answer: 'Gross profit', accept: ['gross profit', 'gross margin'], explain: 'Sales − cost of sales = gross profit.' }
];

DATA.weeklyTopics = ['Assets', 'Liabilities', 'Equity', 'Journal Entry', 'Trial Balance', 'Income Statement'];

// Which topics a file covers is guessed from its name; anything else gets a mixed quiz.
DATA.topicKeywords = {
  Assets: ['asset', 'chapter_5', 'chapter5', 'inventory'],
  Liabilities: ['liabil', 'loan', 'payable', 'week5'],
  Equity: ['equity', 'capital', 'owner'],
  'Journal Entry': ['journal', 'entry', 'ledger', 'double'],
  'Trial Balance': ['trial', 'balance'],
  'Income Statement': ['income', 'profit', 'statement']
};

DATA.sampleFiles = [
  { name: 'Chapter_5_Assets.pdf', size: 2.4, pages: 12 },
  { name: 'Lecture_Notes_Week5.pdf', size: 1.8, pages: 8 }
];

// Past weekly tests (labels kept from the prototype)
DATA.quizHistory = [
  { id: 'q1', label: '6/6', date: '6 Jun 2025', score: 52, confidence: 45, topics: { Assets: 60, Liabilities: 40, 'Journal Entry': 50 } },
  { id: 'q2', label: '13/6', date: '13 Jun 2025', score: 68, confidence: 55, topics: { Assets: 75, Equity: 70, 'Trial Balance': 55 } },
  { id: 'q3', label: '20/6', date: '20 Jun 2025', score: 61, confidence: 50, topics: { Liabilities: 55, 'Journal Entry': 60, 'Income Statement': 65 } },
  { id: 'q4', label: '27/6', date: '27 Jun 2025', score: 72, confidence: 70, topics: { Assets: 80, 'Trial Balance': 65, Equity: 75 } },
  { id: 'q5', label: '4/1', date: '4 Jan 2026', score: 66, confidence: 62, topics: { 'Journal Entry': 60, 'Income Statement': 70, Liabilities: 65 } },
  { id: 'q6', label: '11/1', date: '11 Jan 2026', score: 75, confidence: 74, topics: { Assets: 85, Liabilities: 70, 'Trial Balance': 68 } }
];

DATA.planTasks = {
  Assets: 'Revise on Assets',
  Liabilities: 'Revise on Liabilities',
  Equity: 'Review the accounting equation',
  'Journal Entry': 'Practice on Journal entry',
  'Trial Balance': 'Revise on Trial balance',
  'Income Statement': 'Practice Income statement questions'
};

/* ---------- Smart Revision Sheets ---------- */

DATA.revisionContent = {
  'Journal Entry': {
    points: ['Assets are debited, liabilities and equity are credited', 'A narration that explains the entry is required', 'Entries are recorded chronologically'],
    summary: ['Debit what comes in, credit what goes out', 'Every entry must have equal debits and credits']
  },
  'Assets & Liabilities': {
    points: ['Assets are resources the business owns or controls', 'Liabilities are debts the business owes', 'Both are split into current (< 12 months) and non-current', 'Inventory and receivables are current assets', 'Long-term loans are non-current liabilities'],
    summary: ['Assets = Liabilities + Equity', 'Classify by how soon they are used or settled']
  },
  'Trial Balance': {
    points: ['Lists every ledger balance at a point in time', 'Debit and credit totals must agree', 'Assets, expenses and drawings are debits', 'Liabilities, income and capital are credits'],
    summary: ['A balanced trial balance can still contain errors', 'Use a suspense account to clear differences']
  },
  'Income Statement': {
    points: ['Shows performance over a period', 'Sales − cost of sales = gross profit', 'Gross profit − expenses = net profit', 'Cost of sales uses opening and closing inventory', 'Only the depreciation of assets is an expense', 'Net profit is added to equity'],
    summary: ['Revenue and expenses, not assets', 'Matching concept: expenses in the period they help earn revenue']
  },
  Equity: {
    points: ["Equity is the owner's claim on the business", 'Capital and profit increase equity', 'Drawings and losses reduce equity'],
    summary: ['Equity = Assets − Liabilities']
  }
};

DATA.revisionSheets = [
  { id: 's1', title: 'Journal Entry', date: '15 Jan 2026', topics: 3 },
  { id: 's2', title: 'Assets & Liabilities', date: '12 Jan 2026', topics: 5 },
  { id: 's3', title: 'Trial Balance', date: '8 Jan 2026', topics: 4 },
  { id: 's4', title: 'Income Statement', date: '5 Jan 2026', topics: 6 }
];

/* ---------- Practice & Feedback Engine (Maths) ---------- */
// Questions are generated so every session is different.

function fmt(n) { return Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100); }
function uniqOptions(correct, wrongs) {
  const set = [correct];
  for (const w of wrongs) if (!set.includes(w) && set.length < 4) set.push(w);
  let k = 1;
  while (set.length < 4) { const v = isNaN(Number(correct)) ? correct + k : fmt(Number(correct) + k * 2); if (!set.includes(v)) set.push(v); k++; }
  return shuffle(set);
}

const GEN = {
  linear(level) {
    const a = level === 'easy' ? rand(2, 5) : rand(2, 9);
    const x = level === 'hard' ? rand(-6, 12) || 3 : rand(2, 10);
    const b = level === 'easy' ? rand(1, 9) : rand(-12, 15) || 4;
    const c = a * x + b;
    const sign = b >= 0 ? '+' : '−';
    const expr = `${a}x ${sign} ${Math.abs(b)} = ${c}`;
    const wrongSide = (c + b) / a;
    const forgotDivide = c - b;
    const wrongs = [`x = ${fmt(wrongSide)}`, `x = ${fmt(forgotDivide)}`, `x = ${fmt(x + 2)}`, `x = ${fmt(x - 1)}`];
    const answer = `x = ${x}`;
    return {
      prompt: 'Solve for x:', expr, answer, options: uniqOptions(answer, wrongs), numeric: x,
      hints: [`Start by getting the x term on its own. What do you need to do to remove ${sign} ${Math.abs(b)}?`, `${b >= 0 ? 'Subtract' : 'Add'} ${Math.abs(b)} on both sides: ${a}x = ${c - b}.`, `Now divide both sides by ${a}.`],
      steps: [`Start with ${expr}`, `${b >= 0 ? 'Subtract' : 'Add'} ${Math.abs(b)} on both sides: ${a}x = ${c - b}`, `Divide both sides by ${a}: x = ${fmt((c - b) / a)}`, `Check: ${a} × ${x} ${sign} ${Math.abs(b)} = ${c} ✓`],
      misconceptions: { [`x = ${fmt(wrongSide)}`]: 'Students often forget to perform the same operation on both sides of the equation.', [`x = ${fmt(forgotDivide)}`]: 'Students often stop after removing the constant and forget to divide by the coefficient of x.' },
      tutor: `A linear equation is balanced like a scale. Whatever you do to one side, you must do to the other. Undo the operations in reverse order: first remove the constant (${sign} ${Math.abs(b)}), then the multiplier (${a}).`
    };
  },
  triangles(level) {
    if (level !== 'easy' && Math.random() < 0.5) {
      const triples = level === 'hard' ? [[8, 15, 17], [7, 24, 25], [9, 12, 15], [20, 21, 29]] : [[3, 4, 5], [6, 8, 10], [5, 12, 13]];
      const [p, q, r] = pick(triples);
      const answer = `${r} cm`;
      return {
        prompt: `A right-angled triangle has shorter sides ${p} cm and ${q} cm. Find the hypotenuse.`, expr: `c² = ${p}² + ${q}²`, answer, numeric: r,
        options: uniqOptions(answer, [`${p + q} cm`, `${r + 1} cm`, `${Math.abs(q - p) + 2} cm`, `${r * 2} cm`]),
        hints: ['Use Pythagoras’ theorem: c² = a² + b².', `Work out ${p}² + ${q}² = ${p * p + q * q}.`, `Take the square root of ${p * p + q * q}.`],
        steps: [`c² = ${p}² + ${q}²`, `c² = ${p * p} + ${q * q} = ${r * r}`, `c = √${r * r} = ${r} cm`],
        misconceptions: { [`${p + q} cm`]: 'Students often add the two sides directly instead of squaring them first.' },
        tutor: 'In a right-angled triangle, the square on the hypotenuse equals the sum of the squares on the other two sides.'
      };
    }
    const a = rand(30, 80), b = rand(30, 100 - (level === 'hard' ? 10 : 0));
    const c = 180 - a - b;
    const answer = `${c}°`;
    return {
      prompt: `Two angles of a triangle are ${a}° and ${b}°. Find the third angle.`, expr: `${a}° + ${b}° + x = 180°`, answer, numeric: c,
      options: uniqOptions(answer, [`${360 - a - b}°`, `${a + b}°`, `${c + 10}°`, `${90 - a > 0 ? 90 - a : c - 5}°`]),
      hints: ['Angles in a triangle add up to 180°.', `Add the known angles: ${a}° + ${b}° = ${a + b}°.`, `Subtract from 180°.`],
      steps: [`Angle sum of a triangle = 180°`, `${a}° + ${b}° = ${a + b}°`, `x = 180° − ${a + b}° = ${c}°`],
      misconceptions: { [`${360 - a - b}°`]: 'Students often use 360° (angles in a quadrilateral or at a point) instead of 180° for a triangle.' },
      tutor: 'The three interior angles of any triangle always total 180°. Subtract the angles you know from 180° to find the missing one.'
    };
  },
  fractions(level) {
    const dens = level === 'easy' ? [2, 4, 5, 10] : [3, 4, 5, 6, 8];
    const d1 = pick(dens), d2 = pick(dens);
    const n1 = rand(1, d1 - 1), n2 = rand(1, d2 - 1);
    const num = n1 * d2 + n2 * d1, den = d1 * d2, g = gcd(num, den);
    const simple = `${num / g}/${den / g}`;
    const answer = level === 'easy' ? fmt(num / den) : simple;
    const wrongAdd = `${n1 + n2}/${d1 + d2}`;
    return {
      prompt: level === 'easy' ? 'Work out, giving your answer as a decimal:' : 'Add the fractions (simplest form):', expr: `${n1}/${d1} + ${n2}/${d2}`, answer, numeric: num / den,
      options: level === 'easy' ? uniqOptions(answer, [fmt((n1 + n2) / (d1 + d2)), fmt(num / den + 0.1), fmt(n1 / d1)]) : uniqOptions(answer, [wrongAdd, `${num}/${den + 1}`, `${n1 * n2}/${den}`]),
      hints: ['You cannot add fractions until the denominators are the same.', `A common denominator is ${den}.`, `Convert: ${n1 * d2}/${den} + ${n2 * d1}/${den}.`],
      steps: [`Common denominator: ${d1} × ${d2} = ${den}`, `${n1}/${d1} = ${n1 * d2}/${den} and ${n2}/${d2} = ${n2 * d1}/${den}`, `Add numerators: ${num}/${den}`, level === 'easy' ? `As a decimal: ${fmt(num / den)}` : `Simplify by ${g}: ${simple}`],
      misconceptions: { [wrongAdd]: 'Students often add the numerators and the denominators separately. Only the numerators are added once the denominators match.', [fmt((n1 + n2) / (d1 + d2))]: 'Students often add the numerators and the denominators separately. Only the numerators are added once the denominators match.' },
      tutor: 'Fractions describe parts of the same whole only when the denominators match. Rewrite both with a common denominator, then add the numerators.'
    };
  },
  quadratics(level) {
    let r1 = rand(1, 6), r2 = rand(1, 7);
    if (level !== 'easy') { r1 *= pick([1, -1]); r2 *= pick([1, -1]); }
    const b = -(r1 + r2), c = r1 * r2;
    const term = (v, s) => v === 0 ? '' : ` ${v > 0 ? '+' : '−'} ${Math.abs(v) === 1 && s ? '' : Math.abs(v)}${s}`;
    const expr = `x²${term(b, 'x')}${term(c, '')} = 0`;
    const sorted = [r1, r2].sort((p, q) => p - q);
    const answer = r1 === r2 ? `x = ${r1}` : `x = ${sorted[0]} or ${sorted[1]}`;
    const neg = `x = ${-sorted[1]} or ${-sorted[0]}`;
    return {
      prompt: 'Solve the quadratic equation:', expr, answer, numeric: null,
      options: uniqOptions(answer, [neg, `x = ${sorted[0] + 1} or ${sorted[1] + 1}`, `x = ${c} or ${b}`]),
      hints: [`Find two numbers that multiply to ${c} and add to ${b}.`, `They are ${-r1} and ${-r2}, so (x ${-r1 >= 0 ? '+' : '−'} ${Math.abs(r1)})(x ${-r2 >= 0 ? '+' : '−'} ${Math.abs(r2)}) = 0.`, 'Set each bracket equal to zero.'],
      steps: [`Factorise: (x ${-r1 >= 0 ? '+' : '−'} ${Math.abs(r1)})(x ${-r2 >= 0 ? '+' : '−'} ${Math.abs(r2)}) = 0`, `Either x ${-r1 >= 0 ? '+' : '−'} ${Math.abs(r1)} = 0 or x ${-r2 >= 0 ? '+' : '−'} ${Math.abs(r2)} = 0`, answer],
      misconceptions: { [neg]: 'Students often keep the sign from the bracket. If (x − 3) = 0 then x = +3, not −3.' },
      tutor: 'Factorising turns a quadratic into two brackets. If two things multiply to zero, one of them must be zero — so each bracket gives one solution.'
    };
  },
  percentages(level) {
    if (level === 'hard') {
      const old = rand(4, 20) * 10, change = pick([10, 15, 20, 25, 30, 40]);
      const now = old + old * change / 100;
      const answer = `${change}%`;
      return {
        prompt: `A price rises from $${old} to $${fmt(now)}. Find the percentage increase.`, expr: `(${fmt(now)} − ${old}) ÷ ${old} × 100`, answer, numeric: change,
        options: uniqOptions(answer, [`${fmt((now - old) / now * 100)}%`, `${fmt(now - old)}%`, `${change + 5}%`]),
        hints: ['Percentage change = change ÷ original × 100.', `The change is $${fmt(now - old)}.`, `Divide by the original price, $${old}.`],
        steps: [`Change = ${fmt(now)} − ${old} = ${fmt(now - old)}`, `${fmt(now - old)} ÷ ${old} = ${fmt(change / 100)}`, `× 100 = ${change}%`],
        misconceptions: { [`${fmt((now - old) / now * 100)}%`]: 'Students often divide by the new value. Percentage change always compares with the original value.' },
        tutor: 'Percentage change measures the change relative to where you started, so the original amount always goes on the bottom.'
      };
    }
    const p = pick(level === 'easy' ? [10, 20, 25, 50] : [12, 15, 35, 40, 75]);
    const n = rand(2, 20) * (level === 'easy' ? 10 : 20);
    const v = p * n / 100;
    const answer = fmt(v);
    return {
      prompt: `Find ${p}% of ${n}.`, expr: `${p}% × ${n}`, answer, numeric: v,
      options: uniqOptions(answer, [fmt(n / p), fmt(v * 10), fmt(n - v)]),
      hints: ['"Of" means multiply.', `Write ${p}% as ${p}/100 = ${p / 100}.`, `Multiply ${p / 100} × ${n}.`],
      steps: [`${p}% = ${p / 100}`, `${p / 100} × ${n} = ${answer}`],
      misconceptions: { [fmt(n / p)]: 'Students often divide by the percentage. Convert the percentage to a decimal and multiply.' },
      tutor: 'A percentage is a fraction out of 100. Finding p% of a number means multiplying the number by p/100.'
    };
  },
  area(level) {
    if (level === 'easy' || Math.random() < 0.5) {
      const l = rand(4, 12), w = rand(3, 9);
      const answer = `${l * w} cm²`;
      return {
        prompt: `Find the area of a rectangle ${l} cm long and ${w} cm wide.`, expr: `A = ${l} × ${w}`, answer, numeric: l * w,
        options: uniqOptions(answer, [`${2 * (l + w)} cm²`, `${l + w} cm²`, `${l * w + l} cm²`]),
        hints: ['Area of a rectangle = length × width.', `Multiply ${l} by ${w}.`, 'Remember area uses square units.'],
        steps: [`A = length × width`, `A = ${l} × ${w} = ${l * w}`, `Area = ${l * w} cm²`],
        misconceptions: { [`${2 * (l + w)} cm²`]: 'Students often mix up area and perimeter. Perimeter adds the sides; area multiplies length by width.' },
        tutor: 'Area counts how many 1 cm × 1 cm squares fit inside the shape. A rectangle holds length × width of them.'
      };
    }
    const b = rand(4, 14) * 2, h = rand(3, 10);
    const answer = `${b * h / 2} cm²`;
    return {
      prompt: `A triangle has base ${b} cm and height ${h} cm. Find its area.`, expr: `A = ½ × ${b} × ${h}`, answer, numeric: b * h / 2,
      options: uniqOptions(answer, [`${b * h} cm²`, `${b + h} cm²`, `${b * h / 2 + 4} cm²`]),
      hints: ['Area of a triangle = ½ × base × height.', `Multiply ${b} × ${h} = ${b * h}.`, 'Now halve it.'],
      steps: [`A = ½ × base × height`, `${b} × ${h} = ${b * h}`, `½ × ${b * h} = ${b * h / 2} cm²`],
      misconceptions: { [`${b * h} cm²`]: 'Students often forget the ½. A triangle is half of the rectangle with the same base and height.' },
      tutor: 'Any triangle fits exactly into half of a rectangle with the same base and height, which is why its area is ½ × base × height.'
    };
  },
  indices(level) {
    const a = pick([2, 3, 5, 'x', 'y']);
    const m = rand(2, level === 'easy' ? 5 : 9), n = rand(2, level === 'easy' ? 4 : 8);
    const div = level === 'hard' && m > n;
    const res = div ? m - n : m + n;
    const answer = `${a}^${res}`;
    const expr = div ? `${a}^${m} ÷ ${a}^${n}` : `${a}^${m} × ${a}^${n}`;
    return {
      prompt: 'Simplify, leaving your answer in index form:', expr, answer, numeric: null,
      options: uniqOptions(answer, [`${a}^${m * n}`, div ? `${a}^${m + n}` : `${a}^${Math.abs(m - n) || 1}`, `${a}^${res + 1}`]),
      hints: [div ? 'When dividing powers of the same base, subtract the indices.' : 'When multiplying powers of the same base, add the indices.', `The base stays as ${a}.`, `Work out ${m} ${div ? '−' : '+'} ${n}.`],
      steps: [div ? `Rule: aᵐ ÷ aⁿ = aᵐ⁻ⁿ` : `Rule: aᵐ × aⁿ = aᵐ⁺ⁿ`, `${m} ${div ? '−' : '+'} ${n} = ${res}`, `Answer: ${answer}`],
      misconceptions: { [`${a}^${m * n}`]: 'Students often multiply the indices. Multiply indices only when raising a power to a power, like (aᵐ)ⁿ.' },
      tutor: `${a}^${m} means ${a} multiplied by itself ${m} times. Multiplying by ${a}^${n} adds ${n} more factors, so the indices add.`
    };
  }
};

DATA.practiceTopics = [
  { id: 'linear', name: 'Algebra: Linear Equations', short: 'Algebra', count: 48, about: 'Equations where x appears to the power of 1. Solve by undoing operations on both sides.' },
  { id: 'triangles', name: 'Geometry: Triangles', short: 'Geometry', count: 36, about: 'Angle sums and Pythagoras’ theorem for right-angled triangles.' },
  { id: 'fractions', name: 'Fractions & Decimals', short: 'Fractions', count: 45, about: 'Adding fractions with different denominators and converting to decimals.' },
  { id: 'quadratics', name: 'Quadratic Equations', short: 'Quadratics', count: 32, about: 'Equations with x². Solve by factorising into two brackets.' },
  { id: 'percentages', name: 'Percentages', short: 'Percentages', count: 40, about: 'Finding percentages of amounts and percentage change.' },
  { id: 'area', name: 'Area & Perimeter', short: 'Area', count: 30, about: 'Area of rectangles and triangles in square units.' },
  { id: 'indices', name: 'Indices', short: 'Indices', count: 28, about: 'Laws of indices for multiplying and dividing powers.' }
];

// Builds one practice question. Every 4th question is open ended.
function makePracticeQuestion(topicId, level, index) {
  const q = GEN[topicId](level);
  q.topicId = topicId;
  q.level = level;
  q.type = (index % 4 === 3 && q.numeric !== null) ? 'open' : 'mcq';
  return q;
}

/* ---------- AI Lesson Companion ---------- */

DATA.lessons = [
  {
    id: 'ionic', title: 'Ionic Bonding', date: 'Today',
    summary: 'Ionic bonds are formed when atoms transfer electrons, creating a positive metal and negative non-metal. The strong electrostatic attraction between these oppositely charged ions holds them together as a stable ionic compound.',
    objectives: ['Understand atomic interactions', 'Learn about positive & negative ions', 'Identify ionic compound characteristics'],
    keyPoints: ['Involves transfer of electrons', 'Creates charged positive and negative ions', 'Examples include NaCl', 'Ionic compounds have high melting points', 'They conduct electricity when molten or dissolved'],
    slides: [
      { title: 'Slide 1', simple: 'Chlorine: Cl₂, Valency 7', bullets: ['Chlorine has 7 outer electrons', 'It needs 1 more electron to be stable'] },
      { title: 'Slide 2', simple: 'Sodium gives away 1 electron', bullets: ['Sodium has 1 outer electron', 'Losing it makes Na⁺'] },
      { title: 'Slide 3', simple: 'Opposites attract: Na⁺ + Cl⁻', bullets: ['Na⁺ and Cl⁻ attract strongly', 'They form a giant ionic lattice'] }
    ],
    scenes: [
      { emoji: '⚛️', text: 'Atoms want a full outer shell', caption: 'Atoms are most stable with a full outer shell of electrons.' },
      { emoji: '➡️', text: 'Sodium gives 1 electron to chlorine', caption: 'Sodium loses one electron and becomes Na⁺.' },
      { emoji: '🧲', text: 'Na⁺ and Cl⁻ attract', caption: 'Chlorine gains it and becomes Cl⁻. Opposite charges attract.' },
      { emoji: '🧂', text: 'The result: sodium chloride', caption: 'The ions form a lattice — table salt, NaCl.' }
    ]
  },
  {
    id: 'covalent', title: 'Covalent Bonding', date: 'Jan 10, 2026',
    summary: 'Covalent bonds form when two non-metal atoms share pairs of electrons so that each atom gets a full outer shell.',
    objectives: ['Explain electron sharing', 'Draw dot-and-cross diagrams', 'Compare simple and giant covalent structures'],
    keyPoints: ['Atoms share pairs of electrons', 'Happens between non-metals', 'Examples include H₂O and CO₂', 'Simple molecules have low melting points'],
    slides: [
      { title: 'Slide 1', simple: 'Sharing, not giving', bullets: ['Non-metals share electrons', 'Each shared pair = one bond'] },
      { title: 'Slide 2', simple: 'Water: H₂O', bullets: ['Oxygen shares with two hydrogens', 'Two single covalent bonds'] },
      { title: 'Slide 3', simple: 'Double bonds: O=C=O', bullets: ['Carbon dioxide has two double bonds', 'Each double bond shares 2 pairs'] }
    ],
    scenes: [
      { emoji: '🤝', text: 'Non-metals share electrons', caption: 'Neither atom gives an electron away — they share.' },
      { emoji: '💧', text: 'Water shares two pairs', caption: 'Oxygen forms one bond with each hydrogen atom.' },
      { emoji: '🫧', text: 'Simple molecules', caption: 'Weak forces between molecules mean low boiling points.' }
    ]
  },
  {
    id: 'reactions', title: 'Chemical Reactions', date: 'Jan 8, 2026',
    summary: 'In a chemical reaction, reactants are rearranged into new products. Atoms are not created or destroyed, so equations must balance.',
    objectives: ['Identify reactants and products', 'Balance simple equations', 'Recognise signs of a reaction'],
    keyPoints: ['Atoms are conserved in reactions', 'Balanced equations have equal atoms on both sides', 'Signs include gas, colour change and heat'],
    slides: [
      { title: 'Slide 1', simple: 'Reactants → Products', bullets: ['Left side: what you start with', 'Right side: what is made'] },
      { title: 'Slide 2', simple: 'Balancing: 2H₂ + O₂ → 2H₂O', bullets: ['Count atoms on each side', 'Change the big numbers only'] }
    ],
    scenes: [
      { emoji: '🧪', text: 'Reactants are rearranged', caption: 'Bonds break and new bonds form.' },
      { emoji: '⚖️', text: 'Atoms are conserved', caption: 'The same atoms appear on both sides of the equation.' }
    ]
  },
  {
    id: 'atomic', title: 'Atomic Structure', date: 'Jan 5, 2026',
    summary: 'Atoms have a tiny nucleus of protons and neutrons, surrounded by electrons arranged in shells.',
    objectives: ['Name the subatomic particles', 'Use atomic and mass numbers', 'Draw electron shells'],
    keyPoints: ['Protons are positive, electrons negative', 'Neutrons have no charge', 'Electrons fill shells 2, 8, 8'],
    slides: [
      { title: 'Slide 1', simple: 'Nucleus: protons + neutrons', bullets: ['Almost all the mass is in the nucleus'] },
      { title: 'Slide 2', simple: 'Electron shells: 2, 8, 8', bullets: ['Inner shell holds 2', 'Next shells hold 8'] }
    ],
    scenes: [
      { emoji: '🔬', text: 'A tiny, dense nucleus', caption: 'Protons and neutrons sit in the centre.' },
      { emoji: '🌀', text: 'Electrons in shells', caption: 'Electrons orbit in shells around the nucleus.' }
    ]
  }
];

/* ---------- AI Understanding Booster ---------- */

DATA.booster = {
  topics: [
    {
      id: 'photosynthesis', name: 'Photosynthesis',
      intro: 'The process by which plants convert light energy into chemical energy, producing glucose and oxygen from carbon dioxide and water.',
      steps: [
        { title: 'Light Absorption', from: ['☀️', 'Sunlight', '#fde68a'], to: ['🌿', 'Chlorophyll', '#bbf7d0'], text: 'Chlorophyll in the leaf absorbs light energy from the sun. This energy is captured and used to power the photosynthesis process.' },
        { title: 'Water Splitting', from: ['💧', 'Water', '#bfdbfe'], to: ['🫧', 'Oxygen', '#e0f2fe'], text: 'Light energy splits water molecules into hydrogen and oxygen. The oxygen is released into the air through the stomata.' },
        { title: 'Carbon Dioxide Fixation', from: ['🌫️', 'CO₂', '#e5e7eb'], to: ['🍃', 'Leaf', '#bbf7d0'], text: 'Carbon dioxide enters the leaf and is combined with hydrogen in the Calvin cycle, using the energy captured earlier.' },
        { title: 'Glucose Formation', from: ['⚗️', 'Calvin cycle', '#ddd6fe'], to: ['🍬', 'Glucose', '#fbcfe8'], text: 'The plant builds glucose, which it uses for energy and to make starch and cellulose for growth.' }
      ],
      nodes: [
        { id: 'light', label: ['Light', 'Energy'], x: 70, y: 120, text: 'Light energy from the sun is the power source for photosynthesis. Without it, the reaction cannot start.', points: ['Captured by chlorophyll', 'Mostly red and blue light is used', 'Converted into chemical energy'] },
        { id: 'chloro', label: ['Chlorophyll'], x: 250, y: 120, text: 'Chlorophyll is the green pigment found in plants that plays a crucial role in photosynthesis. It absorbs light energy, primarily from the blue and red portions of the light spectrum, and uses this energy to convert carbon dioxide and water into glucose.', points: ['Absorbs light energy for photosynthesis', 'Located in chloroplasts', 'Gives plants their green color'] },
        { id: 'co2', label: ['Carbon', 'Dioxide'], x: 160, y: 190, text: 'Carbon dioxide from the air diffuses into the leaf through small pores called stomata.', points: ['Enters through stomata', 'Provides the carbon in glucose', 'Higher CO₂ can speed up the rate'] },
        { id: 'oxygen', label: ['Oxygen'], x: 70, y: 260, text: 'Oxygen is released as a by-product when water molecules are split.', points: ['Comes from water, not CO₂', 'Released through stomata', 'Used by animals for respiration'] },
        { id: 'glucose', label: ['Glucose'], x: 250, y: 260, text: 'Glucose is the sugar made by photosynthesis. It stores the captured energy in chemical bonds.', points: ['Used for respiration', 'Stored as starch', 'Builds cellulose for cell walls'] }
      ]
    },
    {
      id: 'water-cycle', name: 'The Water Cycle',
      intro: 'The continuous movement of water between the oceans, the air and the land, driven by energy from the sun.',
      steps: [
        { title: 'Evaporation', from: ['☀️', 'Sun', '#fde68a'], to: ['🌊', 'Ocean', '#bfdbfe'], text: 'The sun heats water in oceans and lakes, turning it into water vapour that rises into the air.' },
        { title: 'Condensation', from: ['💨', 'Vapour', '#e5e7eb'], to: ['☁️', 'Clouds', '#f3f4f6'], text: 'As the vapour rises and cools, it condenses into tiny droplets that form clouds.' },
        { title: 'Precipitation', from: ['☁️', 'Clouds', '#f3f4f6'], to: ['🌧️', 'Rain', '#bfdbfe'], text: 'Droplets join together until they are heavy enough to fall as rain, snow or hail.' },
        { title: 'Collection', from: ['🏞️', 'Rivers', '#bbf7d0'], to: ['🌊', 'Ocean', '#bfdbfe'], text: 'Water runs off the land into rivers and back to the sea, or soaks into the ground, and the cycle repeats.' }
      ],
      nodes: [
        { id: 'sun', label: ['Sun'], x: 70, y: 120, text: 'The sun provides the heat energy that drives evaporation.', points: ['Heats surface water', 'Drives the whole cycle'] },
        { id: 'evap', label: ['Evaporation'], x: 250, y: 120, text: 'Liquid water becomes water vapour when heated.', points: ['Mostly from oceans', 'Plants add water by transpiration'] },
        { id: 'cond', label: ['Condensation'], x: 160, y: 190, text: 'Water vapour cools and becomes liquid droplets.', points: ['Forms clouds', 'Happens as air rises and cools'] },
        { id: 'precip', label: ['Rain'], x: 70, y: 260, text: 'Precipitation returns water to the ground.', points: ['Rain, snow, sleet or hail', 'Feeds rivers and groundwater'] },
        { id: 'collect', label: ['Collection'], x: 250, y: 260, text: 'Water gathers in rivers, lakes, oceans and underground.', points: ['Surface runoff', 'Groundwater storage'] }
      ]
    }
  ],
  examples: [
    { id: 'ex1', topic: 'photosynthesis', title: 'Forest Trees', level: 'Beginner', kind: 'Real-World', text: 'How trees in a forest perform photosynthesis to create oxygen for the planet.', detail: 'A single large tree can release enough oxygen for two people each year. Rainforests are sometimes called the "lungs of the Earth" because of how much photosynthesis happens there.' },
    { id: 'ex2', topic: 'photosynthesis', title: 'Indoor Plants', level: 'Beginner', kind: 'Real-World', text: 'Understanding how houseplants convert light into energy in low light conditions.', detail: 'Houseplants near a window grow towards the light (phototropism) so their leaves can absorb more light for photosynthesis.' },
    { id: 'ex3', topic: 'photosynthesis', title: 'Pondweed Experiment', level: 'Intermediate', kind: 'Lab', text: 'Counting oxygen bubbles from pondweed at different light distances.', detail: 'Moving a lamp closer increases light intensity, so the pondweed releases more oxygen bubbles per minute — evidence that light limits the rate.' },
    { id: 'ex4', topic: 'photosynthesis', title: 'Greenhouse Farming', level: 'Advanced', kind: 'Real-World', text: 'How farmers add CO₂ and heat to greenhouses to grow crops faster.', detail: 'Raising CO₂, temperature and light together removes limiting factors so crops photosynthesise at their maximum rate.' },
    { id: 'ex5', topic: 'photosynthesis', title: 'Starch Test on Leaves', level: 'Intermediate', kind: 'Lab', text: 'Using iodine to show where a leaf has made starch.', detail: 'Parts of a variegated leaf without chlorophyll stay orange-brown with iodine, showing chlorophyll is needed for photosynthesis.' },
    { id: 'ex6', topic: 'water-cycle', title: 'Morning Dew', level: 'Beginner', kind: 'Everyday', text: 'Why grass is wet on a cool morning even when it has not rained.', detail: 'Water vapour in the air condenses on cool surfaces overnight — condensation you can see.' },
    { id: 'ex7', topic: 'water-cycle', title: 'Monsoon Season', level: 'Advanced', kind: 'Real-World', text: 'How heavy seasonal rain in Southeast Asia connects to ocean evaporation.', detail: 'Warm seas evaporate large amounts of water; seasonal winds carry it inland where it falls as intense rain.' },
    { id: 'ex8', topic: 'water-cycle', title: 'Water in a Bag', level: 'Beginner', kind: 'Lab', text: 'A sealed bag of water taped to a sunny window models the cycle.', detail: 'Water evaporates, condenses on the bag and "rains" down the sides — the whole cycle in miniature.' }
  ]
};

/* ---------- Notifications & Help ---------- */

DATA.notifications = [
  { id: 'n1', cat: 'Quiz', icon: 'book', title: 'New Quiz Available', text: 'Chemistry Chapter 5 quiz is now ready to attempt', time: '5 minutes ago', unread: true, go: '/pc/weekly' },
  { id: 'n2', cat: 'Study Plan', icon: 'calendar', title: 'Study Plan Updated', text: 'Your weekly study plan has been optimized based on recent performance', time: '2 hours ago', unread: true, go: '/pc/plan' },
  { id: 'n3', cat: 'AI Suggestions', icon: 'bulb', title: 'AI Suggestion', text: 'Consider reviewing Ionic Bonding - detected as a weak area', time: '5 hours ago', unread: false, go: '/lc/preview' },
  { id: 'n4', cat: 'Quiz', icon: 'book', title: 'Quiz Reminder', text: "Don't forget to complete your weekly assessment", time: '1 day ago', unread: false, go: '/pc/weekly' },
  { id: 'n5', cat: 'Study Plan', icon: 'calendar', title: 'Study Streak Achievement', text: "Congratulations! You've maintained a 6-day study streak 🔥", time: '2 days ago', unread: false, go: '/pc/dashboard' },
  { id: 'n6', cat: 'AI Suggestions', icon: 'bulb', title: 'Practice Suggestion', text: 'Linear equations accuracy dropped to 60%. Try a Guided Tutor session.', time: '3 days ago', unread: false, go: '/pe' }
];

DATA.faqs = [
  { cat: 'Getting Started', q: 'How do I start a weekly test?', a: 'Go to Home → Progress & Confidence System → Weekly Test, then tap "Start new test" or "Upload Notes". Add your notes, choose your quiz settings and tap Generate Quiz.' },
  { cat: 'Getting Started', q: 'What file types can I upload?', a: 'PDF, JPG, PNG and HEIC files for quizzes and revision sheets. Lesson tools also accept DOC, TXT and PPTX. You can also use "Scan with Camera" for handwritten notes.' },
  { cat: 'Quizzes', q: 'What does flagging a question do?', a: 'Flagged questions are marked so you can find them quickly in the answer review after the quiz.' },
  { cat: 'Quizzes', q: 'What is instant feedback?', a: 'With instant feedback on, you see whether each answer is right straight away and can tap Explain for the reasoning. Turn it off to see everything at the end.' },
  { cat: 'Quizzes', q: 'How is my confidence level worked out?', a: 'The app estimates confidence from how quickly you answer, how often you change answers and your past results — you never need to rate yourself. After each quiz you get a Confidence Accuracy Summary.' },
  { cat: 'Study Plans', q: 'How is my study plan generated?', a: 'It looks at the quizzes you select, finds your weakest topics and splits your available study hours across them.' },
  { cat: 'Study Plans', q: 'Can I snooze a reminder?', a: 'Yes. Tap Snooze under any task to push its reminder back by one hour.' },
  { cat: 'Account', q: 'How do I change my password?', a: 'Settings → Account Management → Change Password.' },
  { cat: 'Account', q: 'Is my data private?', a: 'In this prototype everything is stored only in your browser. You can clear it any time from Settings → Privacy & Security.' }
];

DATA.achievements = [
  { icon: 'flame', title: '7-Day Streak', text: 'Study 7 days in a row', got: false },
  { icon: 'trophy', title: 'Quiz Master', text: 'Score 80% or more on a weekly test', got: true },
  { icon: 'target', title: 'Sharp Shooter', text: 'Get 10 practice questions right in a row', got: false },
  { icon: 'file-check', title: 'Organised', text: 'Save 5 revision sheets', got: false },
  { icon: 'star', title: 'First Steps', text: 'Complete your first practice session', got: true }
];
