// Page: Administrador Questions CRUD (app/admin/preguntas/page.tsx)
'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPreguntasPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [preguntas, setPreguntas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
  
  // Fields state
  const [text, setText] = useState('');
  const [category, setCategory] = useState<'ansiedad' | 'depresion' | 'tac'>('ansiedad');
  const [type, setType] = useState<'cat' | 'tac'>('cat');
  const [a, setA] = useState(1.0);
  const [b, setB] = useState(0.0);
  const [c, setC] = useState(0.0);
  const [active, setActive] = useState(true);
  
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    setMounted(true);
    const role = localStorage.getItem('demo_role');
    if (role !== 'admin') {
      router.push('/auth');
      return;
    }

    fetchPreguntas();
  }, [router]);

  const fetchPreguntas = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/questions');
      if (res.ok) {
        const data = await res.json();
        setPreguntas(data);
      }
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingQuestion(null);
    setText('');
    setCategory('ansiedad');
    setType('cat');
    setA(1.5);
    setB(0.0);
    setC(0.0);
    setActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (q: any) => {
    setEditingQuestion(q);
    setText(q.text);
    setCategory(q.category);
    setType(q.type);
    setA(q.a);
    setB(q.b);
    setC(q.c);
    setActive(q.active);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text) return;

    setSubmitting(true);
    try {
      const method = editingQuestion ? 'PUT' : 'POST';
      const body = {
        id: editingQuestion?.id,
        text, category, type,
        a: type === 'cat' ? a : 1.0,
        b: type === 'cat' ? b : 0.0,
        c: type === 'cat' ? c : 0.0,
        active
      };

      const res = await fetch('/api/admin/questions', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        setSuccessMsg(editingQuestion ? '¡Pregunta actualizada!' : '¡Pregunta creada con éxito!');
        setIsModalOpen(false);
        await fetchPreguntas();
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error('Failed to save question:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de que desea eliminar esta pregunta del banco adaptativo?')) return;
    
    try {
      const res = await fetch(`/api/admin/questions?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSuccessMsg('¡Pregunta eliminada del banco!');
        await fetchPreguntas();
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error('Failed to delete question:', err);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex-grow flex flex-col justify-start py-6 gap-8 relative">
      <div className="glow-overlay-indigo opacity-20" />
      
      {/* Title */}
      <section className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-wide uppercase">
            Banco de Preguntas & Parámetros IRT
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Configuración del cuestionario adaptativo y calibración de discriminación (a) y severidad (b).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/admin/dashboard"
            className="text-xs font-bold text-gray-400 hover:text-white transition-colors bg-white/3 hover:bg-white/5 border border-white/5 hover:border-white/10 px-4 py-2.5 rounded-xl cursor-pointer"
          >
            Volver a Estadísticas
          </a>
          
          <button
            onClick={handleOpenAddModal}
            className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors bg-purple-500/10 hover:bg-purple-500/15 border border-purple-500/20 px-4 py-2.5 rounded-xl cursor-pointer"
          >
            + Agregar Pregunta
          </button>
        </div>
      </section>

      {/* Control notification banner */}
      {successMsg && (
        <section className="relative z-10 glass-panel p-4 rounded-xl border border-emerald-500/20 text-emerald-400 font-bold text-xs animate-pulse">
          {successMsg}
        </section>
      )}

      {/* Questions catalog list */}
      <section className="relative z-10 glass-panel p-6 rounded-2xl border border-white/5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-6 h-6 rounded-full border-2 border-purple-500/20 border-t-purple-400 animate-spin" />
            <p className="text-xs text-gray-500">Recuperando parámetros IRT de base de datos...</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-gray-400 uppercase font-mono tracking-wider">
                  <th className="py-3.5 px-4 font-semibold text-center">ID</th>
                  <th className="py-3.5 px-4 font-semibold">Texto de la Pregunta</th>
                  <th className="py-3.5 px-4 font-semibold">Subescala</th>
                  <th className="py-3.5 px-4 font-semibold">Tipo</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Discrim. (a)</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Severidad (b)</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Estado</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {preguntas.map((q) => (
                  <tr key={q.id} className="hover:bg-white/2 transition-colors">
                    <td className="py-3.5 px-4 text-center font-mono text-gray-500">{q.id}</td>
                    <td className="py-3.5 px-4 text-sm font-bold text-gray-200">{q.text}</td>
                    <td className="py-3.5 px-4 uppercase text-[10px]">
                      <span className={`px-2 py-0.5 rounded border ${
                        q.category === 'ansiedad' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 
                        q.category === 'depresion' ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' : 
                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {q.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 uppercase font-mono text-[9px] text-gray-400">{q.type}</td>
                    <td className="py-3.5 px-4 text-center font-mono text-gray-300 font-bold">{q.type === 'cat' ? q.a.toFixed(1) : '--'}</td>
                    <td className="py-3.5 px-4 text-center font-mono text-gray-300 font-bold">{q.type === 'cat' ? q.b.toFixed(1) : '--'}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`w-2 h-2 rounded-full inline-block ${q.active ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(q)}
                          className="py-1 px-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded text-gray-300 hover:text-white transition-colors cursor-pointer"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(q.id)}
                          className="py-1 px-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/10 text-rose-400 rounded transition-colors cursor-pointer"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Slide-out/Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-8 rounded-3xl border border-purple-500/30 max-w-lg w-full relative z-10 animate-fade-in text-left">
            <h3 className="text-lg font-bold text-gray-100 mb-6">
              {editingQuestion ? 'Editar Pregunta Adaptativa' : 'Agregar Nueva Pregunta'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Question Text */}
              <div>
                <label htmlFor="modal-text" className="block text-[10px] font-semibold text-gray-400 mb-1.5 uppercase">
                  Texto de la Pregunta
                </label>
                <input
                  type="text"
                  id="modal-text"
                  required
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="¿Se ha sentido...?"
                  className="w-full bg-gray-900 border border-white/5 focus:border-purple-500/40 rounded-xl py-2.5 px-3 text-xs text-gray-300 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Category */}
                <div>
                  <label htmlFor="modal-cat" className="block text-[10px] font-semibold text-gray-400 mb-1.5 uppercase">
                    Subescala Clínica
                  </label>
                  <select
                    id="modal-cat"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-gray-900 border border-white/5 focus:border-purple-500/40 rounded-xl py-2.5 px-3 text-xs text-gray-300 outline-none"
                  >
                    <option value="ansiedad">Ansiedad</option>
                    <option value="depresion">Depresión</option>
                    <option value="tac">Consistency (TAC)</option>
                  </select>
                </div>

                {/* Type */}
                <div>
                  <label htmlFor="modal-type" className="block text-[10px] font-semibold text-gray-400 mb-1.5 uppercase">
                    Tipo de Pregunta
                  </label>
                  <select
                    id="modal-type"
                    value={type}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setType(val);
                      if (val === 'tac') setCategory('tac');
                    }}
                    className="w-full bg-gray-900 border border-white/5 focus:border-purple-500/40 rounded-xl py-2.5 px-3 text-xs text-gray-300 outline-none"
                  >
                    <option value="cat">Adaptativa (CAT)</option>
                    <option value="tac">Consistency (TAC)</option>
                  </select>
                </div>
              </div>

              {/* IRT Parameters Section (Only visible for CAT type) */}
              {type === 'cat' && (
                <div className="bg-black/15 p-4 rounded-xl border border-white/3 space-y-3.5">
                  <span className="text-[9px] font-mono font-bold text-gray-500 uppercase block mb-1">
                    Calibración de Parámetros IRT (Modelo 2PL)
                  </span>
                  
                  {/* Discrimination a */}
                  <div>
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                      <span>Discriminación (a)</span>
                      <span className="font-mono text-purple-400 font-bold">{a.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2.5"
                      step="0.1"
                      value={a}
                      onChange={(e) => setA(parseFloat(e.target.value))}
                      className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>

                  {/* Difficulty b */}
                  <div>
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                      <span>Severidad / Dificultad (b)</span>
                      <span className="font-mono text-purple-400 font-bold">{b.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="-2.0"
                      max="2.0"
                      step="0.1"
                      value={b}
                      onChange={(e) => setB(parseFloat(e.target.value))}
                      className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>
                </div>
              )}

              {/* Active Toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="modal-active"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 bg-gray-900 border border-white/5 rounded focus:ring-0 cursor-pointer accent-purple-500"
                />
                <label htmlFor="modal-active" className="text-xs font-semibold text-gray-400 cursor-pointer">
                  Pregunta Activa en el Banco
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-6 border-t border-white/5 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-transparent hover:bg-white/5 text-gray-400 hover:text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-500/10 hover:scale-[1.01] transition-all cursor-pointer"
                >
                  {submitting ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
