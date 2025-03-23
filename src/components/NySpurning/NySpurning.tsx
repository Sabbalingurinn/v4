'use client';

import { useEffect, useState } from 'react';
import { QuestionsApi } from '@/api';
import { Category } from '@/types';

export function NySpurning() {
  const [text, setText] = useState('');
  const [answers, setAnswers] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [uiState, setUiState] = useState<'initial' | 'success' | 'error'>('initial');

  useEffect(() => {
    async function fetchCategories() {
      const api = new QuestionsApi();
      const result = await api.getCategories();
      if (result && 'data' in result) {
        setCategories(result.data);
      }
    }

    fetchCategories();
  }, []);

  async function handleSubmit() {
    if (
      !text.trim() ||
      answers.some((a) => a.trim().length < 3) ||
      categoryId === null ||
      correctAnswer < 0 ||
      correctAnswer >= answers.length
    ) {
      setUiState('error');
      return;
    }

    const payload = {
      text,
      categoryId,
      answers: answers.map((a, i) => ({
        text: a,
        correct: i === correctAnswer,
      })),
    };

    const api = new QuestionsApi();
    const success = await api.createQuestion(payload);

    if (success) {
      setUiState('success');
      setText('');
      setAnswers(['', '', '', '']);
      setCorrectAnswer(0);
      setCategoryId(null);
    } else {
      setUiState('error');
    }
  }

  return (
    <div>
      <h1>Búa til nýja spurningu</h1>

      <label>Spurning:</label>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Spurning"
        required
      />

      <label>Svör:</label>
      {answers.map((answer, idx) => (
        <input
          key={idx}
          value={answer}
          onChange={(e) => {
            const newAnswers = [...answers];
            newAnswers[idx] = e.target.value;
            setAnswers(newAnswers);
          }}
          placeholder={`Svar ${idx + 1}`}
          required
        />
      ))}

      <label>Rétt svar (númer 0–3):</label>
      <input
        type="number"
        min={0}
        max={answers.length - 1}
        value={correctAnswer}
        onChange={(e) => setCorrectAnswer(Number(e.target.value))}
        required
      />

      <label>Flokkur:</label>
      <select
        value={categoryId ?? ''}
        onChange={(e) => setCategoryId(Number(e.target.value))}
        required
      >
        <option value="">Veldu flokk</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      <br />
      <button onClick={handleSubmit}>Búa til</button>

      {uiState === 'success' && <p>Spurning búin til!</p>}
      {uiState === 'error' && <p>Villa: Athugaðu öll svið og reyndu aftur.</p>}
    </div>
  );
}
