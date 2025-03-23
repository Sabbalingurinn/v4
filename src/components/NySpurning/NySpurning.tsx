'use client';

import { useState } from 'react';
import { QuestionsApi } from '@/api';

export function NySpurning() {
  const [question, setQuestion] = useState('');
  const [answers, setAnswers] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [category, setCategory] = useState('');
  const [uiState, setUiState] = useState<'initial' | 'success' | 'error'>('initial');

  async function handleSubmit() {
    const api = new QuestionsApi();

    const response = await api.createQuestion({
      question,
      answers,
      correctAnswer,
      category,
    });

    if (response) {
      setUiState('success');
      setQuestion('');
      setAnswers(['', '', '', '']);
      setCorrectAnswer(0);
      setCategory('');
    } else {
      setUiState('error');
    }
  }

  return (
    <div>
      <h1>Búa til nýja spurningu</h1>

      <label>Spurning:</label>
      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
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

      <label>Rétt svar (númer frá 0):</label>
      <input
        type="number"
        min={0}
        max={answers.length - 1}
        value={correctAnswer}
        onChange={(e) => setCorrectAnswer(Number(e.target.value))}
        required
      />

      <label>Slug flokks:</label>
      <input
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        placeholder="Slug flokks (t.d. 'stærðfræði')"
        required
      />

      <button onClick={handleSubmit}>Búa til</button>

      {uiState === 'success' && <p>✅ Spurning búin til!</p>}
      {uiState === 'error' && <p>❌ Villa við að búa til spurningu.</p>}
    </div>
  );
}
