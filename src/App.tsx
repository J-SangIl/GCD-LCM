/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator, ArrowRight, Columns, Layers, RefreshCcw, ChevronLeft } from 'lucide-react';

// Helper to get prime factors
const getPrimeFactors = (n: number): number[] => {
  const factors: number[] = [];
  let d = 2;
  let temp = n;
  while (temp >= d * d) {
    if (temp % d === 0) {
      factors.push(d);
      temp /= d;
    } else {
      d++;
    }
  }
  if (temp > 1) {
    factors.push(temp);
  }
  return factors.sort((a, b) => a - b);
};

// Helper to get color for a prime number
const getPrimeColor = (p: number): string => {
  const colors: Record<number, string> = {
    2: 'bg-rose-400',
    3: 'bg-sky-400',
    5: 'bg-emerald-400',
    7: 'bg-amber-400',
    11: 'bg-violet-400',
    13: 'bg-fuchsia-400',
    17: 'bg-orange-400',
    19: 'bg-lime-400',
  };
  return colors[p] || 'bg-slate-400';
};

interface FactorColumn {
  prime: number;
  val1: number | null;
  val2: number | null;
  id: string;
}

export default function App() {
  const [step, setStep] = useState<'input' | 'visualize'>('input');
  const [input1, setInput1] = useState<string>('');
  const [input2, setInput2] = useState<string>('');
  const [factors1, setFactors1] = useState<number[]>([]);
  const [factors2, setFactors2] = useState<number[]>([]);
  const [isAligned, setIsAligned] = useState(false);
  const [resultMode, setResultMode] = useState<'none' | 'gcd' | 'lcm'>('none');

  const handleFactorize = () => {
    const n1 = parseInt(input1);
    const n2 = parseInt(input2);
    if (isNaN(n1) || isNaN(n2) || n1 < 2 || n2 < 2) return;

    setFactors1(getPrimeFactors(n1));
    setFactors2(getPrimeFactors(n2));
    setIsAligned(false);
    setResultMode('none');
    setStep('visualize');
  };

  const handleReset = () => {
    setInput1('');
    setInput2('');
    setFactors1([]);
    setFactors2([]);
    setIsAligned(false);
    setResultMode('none');
    setStep('input');
  };

  // Alignment logic
  const alignedColumns = useMemo(() => {
    if (factors1.length === 0 && factors2.length === 0) return [];

    const counts1: Record<number, number> = {};
    factors1.forEach(f => counts1[f] = (counts1[f] || 0) + 1);
    
    const counts2: Record<number, number> = {};
    factors2.forEach(f => counts2[f] = (counts2[f] || 0) + 1);

    const allPrimes = Array.from(new Set([...Object.keys(counts1), ...Object.keys(counts2)].map(Number))).sort((a, b) => a - b);
    
    const columns: FactorColumn[] = [];
    allPrimes.forEach(p => {
      const c1 = counts1[p] || 0;
      const c2 = counts2[p] || 0;
      const maxCount = Math.max(c1, c2);
      
      for (let i = 0; i < maxCount; i++) {
        columns.push({
          prime: p,
          val1: i < c1 ? p : null,
          val2: i < c2 ? p : null,
          id: `${p}-${i}`
        });
      }
    });
    
    return columns;
  }, [factors1, factors2]);

  const resultValue = useMemo(() => {
    if (resultMode === 'none') return null;
    const cards = alignedColumns.filter(col => {
      if (resultMode === 'gcd') return col.val1 !== null && col.val2 !== null;
      return col.val1 !== null || col.val2 !== null;
    });
    if (cards.length === 0) return 1;
    return cards.reduce((acc, col) => acc * col.prime, 1);
  }, [alignedColumns, resultMode]);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-2 flex items-center justify-center gap-3">
            <Calculator className="w-10 h-10 text-stone-700" />
            소인수분해 학습 도구
          </h1>
          <p className="text-stone-500 italic serif">소인수분해를 통해 최대공약수와 최소공배수를 찾아봅시다.</p>
        </header>

        <AnimatePresence mode="wait">
          {step === 'input' ? (
            <motion.section
              key="input-screen"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-3xl shadow-xl border border-stone-200 p-12 max-w-2xl mx-auto"
            >
              <div className="flex flex-col gap-10 items-center">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full">
                  <div className="flex flex-col gap-4 items-center">
                    <label className="text-sm font-bold uppercase tracking-widest text-stone-400">첫 번째 자연수</label>
                    <input
                      type="number"
                      value={input1}
                      onChange={(e) => setInput1(e.target.value)}
                      className="w-full text-5xl font-mono border-b-4 border-stone-100 focus:border-stone-900 outline-none transition-all text-center py-4 bg-transparent"
                      placeholder="300"
                    />
                  </div>
                  <div className="flex flex-col gap-4 items-center">
                    <label className="text-sm font-bold uppercase tracking-widest text-stone-400">두 번째 자연수</label>
                    <input
                      type="number"
                      value={input2}
                      onChange={(e) => setInput2(e.target.value)}
                      className="w-full text-5xl font-mono border-b-4 border-stone-100 focus:border-stone-900 outline-none transition-all text-center py-4 bg-transparent"
                      placeholder="540"
                    />
                  </div>
                </div>
                
                <button
                  onClick={handleFactorize}
                  className="w-full md:w-auto bg-stone-900 text-white px-12 py-5 rounded-2xl font-bold text-xl hover:bg-stone-800 transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-3"
                >
                  소인수분해 시작하기
                  <ArrowRight className="w-6 h-6" />
                </button>
              </div>
            </motion.section>
          ) : (
            <motion.section
              key="visualize-screen"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-12"
            >
              <button
                onClick={() => setStep('input')}
                className="flex items-center gap-2 text-stone-400 hover:text-stone-900 transition-colors font-medium"
              >
                <ChevronLeft className="w-5 h-5" />
                다시 입력하기
              </button>

              <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-stone-100">
                {/* Factors Display Area */}
                <div className="flex flex-col gap-12 items-center">
                  {!isAligned ? (
                    /* Horizontal Layout (Side by Side) */
                    <div className="flex flex-col md:flex-row gap-16 items-start justify-center w-full">
                      <div className="flex flex-col items-center gap-6 flex-1">
                        <div className="text-3xl font-black font-mono text-stone-300">{input1}</div>
                        <div className="flex gap-3 flex-wrap justify-center">
                          {factors1.map((f, idx) => (
                            <motion.div
                              key={`f1-${idx}`}
                              initial={{ scale: 0, rotate: -10 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ delay: idx * 0.1, type: 'spring' }}
                              className={`w-12 h-16 ${getPrimeColor(f)} rounded-xl shadow-md flex items-center justify-center text-white font-bold text-2xl`}
                            >
                              {f}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                      <div className="hidden md:block h-32 w-px bg-stone-100 self-center" />
                      <div className="flex flex-col items-center gap-6 flex-1">
                        <div className="text-3xl font-black font-mono text-stone-300">{input2}</div>
                        <div className="flex gap-3 flex-wrap justify-center">
                          {factors2.map((f, idx) => (
                            <motion.div
                              key={`f2-${idx}`}
                              initial={{ scale: 0, rotate: 10 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ delay: idx * 0.1, type: 'spring' }}
                              className={`w-12 h-16 ${getPrimeColor(f)} rounded-xl shadow-md flex items-center justify-center text-white font-bold text-2xl`}
                            >
                              {f}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Aligned Vertical Layout */
                    <div className="grid grid-cols-[auto_1fr_auto] gap-x-6 w-full max-w-5xl mx-auto overflow-x-auto pb-8">
                      {/* Row 1 */}
                      <div className="h-16 flex items-center justify-end font-black text-3xl text-stone-200 font-mono shrink-0">
                        {input1}
                      </div>
                      <div className="flex gap-3">
                        {alignedColumns.map((col) => (
                          <div key={`r1-${col.id}`} className="w-12 h-16 flex items-center justify-center shrink-0">
                            {col.val1 && (
                              <motion.div
                                layoutId={`card-${col.id}-1`}
                                className={`w-12 h-16 ${getPrimeColor(col.val1)} rounded-xl shadow-md flex items-center justify-center text-white font-bold text-2xl`}
                              >
                                {col.val1}
                              </motion.div>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="w-12" />

                      {/* Row 2 */}
                      <div className="h-16 flex items-center justify-end font-black text-3xl text-stone-200 font-mono shrink-0">
                        {input2}
                      </div>
                      <div className="flex gap-3">
                        {alignedColumns.map((col) => (
                          <div key={`r2-${col.id}`} className="w-12 h-16 flex items-center justify-center shrink-0">
                            {col.val2 && (
                              <motion.div
                                layoutId={`card-${col.id}-2`}
                                className={`w-12 h-16 ${getPrimeColor(col.val2)} rounded-xl shadow-md flex items-center justify-center text-white font-bold text-2xl`}
                              >
                                {col.val2}
                              </motion.div>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="w-12" />

                      {/* Divider */}
                      <div className="col-span-3 my-8 border-t-2 border-dashed border-stone-100" />

                      {/* Result Row */}
                      <div className="h-16 flex items-center justify-end font-bold text-stone-400 text-sm uppercase tracking-tighter text-right shrink-0">
                        {resultMode === 'gcd' ? '공통 소인수' : resultMode === 'lcm' ? '모든 소인수' : ''}
                      </div>
                      <div className="flex gap-3">
                        {alignedColumns.map((col, idx) => {
                          const show = resultMode === 'gcd' 
                            ? (col.val1 !== null && col.val2 !== null)
                            : (col.val1 !== null || col.val2 !== null);
                          
                          return (
                            <div key={`res-slot-${col.id}`} className="w-12 h-16 flex items-center justify-center shrink-0">
                              <AnimatePresence>
                                {resultMode !== 'none' && show && (
                                  <motion.div
                                    key={`res-card-${col.id}`}
                                    initial={{ y: -120, opacity: 0, scale: 0.5 }}
                                    animate={{ y: 0, opacity: 1, scale: 1 }}
                                    exit={{ y: 20, opacity: 0 }}
                                    transition={{ type: 'spring', damping: 15, delay: idx * 0.05 }}
                                    className={`w-12 h-16 ${getPrimeColor(col.prime)} rounded-xl shadow-xl flex items-center justify-center text-white font-bold text-2xl ring-4 ring-white`}
                                  >
                                    {col.prime}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Result Value */}
                      <div className="flex items-center pl-8 shrink-0">
                        <AnimatePresence>
                          {resultMode !== 'none' && (
                            <motion.div 
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 10 }}
                              className="flex items-center gap-4"
                            >
                              <ArrowRight className="w-8 h-8 text-stone-300" />
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">결과값</span>
                                <span className="text-6xl font-black font-mono tracking-tighter text-stone-900 leading-none">
                                  {resultValue}
                                </span>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}
                </div>

                {/* Controls - Moved down */}
                <div className="flex flex-wrap justify-center gap-4 mt-16">
                  <button
                    onClick={() => {
                      setIsAligned(!isAligned);
                      setResultMode('none');
                    }}
                    className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all shadow-sm ${
                      isAligned ? 'bg-stone-100 text-stone-800' : 'bg-stone-900 text-white hover:bg-stone-800'
                    }`}
                  >
                    <Columns className="w-5 h-5" />
                    {isAligned ? '정렬 해제하기' : '세로로 비교하기'}
                  </button>

                  {isAligned && (
                    <>
                      <button
                        onClick={() => setResultMode(resultMode === 'gcd' ? 'none' : 'gcd')}
                        className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all shadow-sm ${
                          resultMode === 'gcd' ? 'bg-rose-500 text-white' : 'bg-white border-2 border-rose-100 text-rose-500 hover:bg-rose-50'
                        }`}
                      >
                        <Layers className="w-5 h-5" />
                        최대공약수 구하기
                      </button>
                      <button
                        onClick={() => setResultMode(resultMode === 'lcm' ? 'none' : 'lcm')}
                        className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all shadow-sm ${
                          resultMode === 'lcm' ? 'bg-sky-500 text-white' : 'bg-white border-2 border-sky-100 text-sky-500 hover:bg-sky-50'
                        }`}
                      >
                        <Layers className="w-5 h-5" />
                        최소공배수 구하기
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold bg-white border-2 border-stone-100 text-stone-400 hover:text-stone-900 hover:border-stone-200 transition-all"
                  >
                    <RefreshCcw className="w-5 h-5" />
                    처음으로
                  </button>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
