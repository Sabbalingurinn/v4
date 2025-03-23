'use client';

import { useEffect, useState } from 'react';
import { QuestionsApi } from '@/api';
import { Category } from '@/types';

export function NySpurning() {
  const [text, setText] = useState('');
  const [answers, setAnswers] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [uiState, setUiState] = useState<'initial' | 'success' | 'error'>('initial');

  useEffect(() => {
    async function fetchCategories() {
      const api = new QuestionsApi();
      const result = await api.getCategories();
      if (result) {
        setCategories(result.data);
      }
    }

    fetchCategories();
  }, []);

  async function handleSubmit() {
    const api = new QuestionsApi();

    if (
      !text.trim() ||
      answers.some((a) => !a.trim()) ||
      !categoryId ||
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

    console.log('Senda til API:', JSON.stringify(payload, null, 2));

    const response = await api.createQuestion(payload);

    if (response?.ok) {
      setUiState('success');
      setText('');
      setAnswers(['', '', '', '']);
      setCorrectAnswer(0);
      setCategoryId('');
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

      <label>Rétt svar (númer):</label>
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
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
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

      {uiState === 'success' && <p>✅ Spurning búin til!</p>}
      {uiState === 'error' && <p>❌ Villa við að búa til spurningu.</p>}
    </div>
  );
}
