'use client';

import { useEffect, useState } from 'react';
import { QuestionsApi } from '@/api';
import { Question, UiState } from '@/types';

export function BreytaSpurningu() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selected, setSelected] = useState<Question | null>(null);
  const [uiState, setUiState] = useState<UiState>('initial');
  const [message, setMessage] = useState('');

  const api = new QuestionsApi();

  useEffect(() => {
    async function fetch() {
      setUiState('loading');
      const result = await api.getQuestions('allt'); // Þú þarft endpoint sem skilar öllum
      if (!result) return setUiState('error');
      setQuestions(result.data);
      setUiState(result.data.length ? 'data' : 'empty');
    }

    fetch();
  }, []);

  function handleAnswerChange(index: number, text: string) {
    if (!selected) return;
    const updated = [...selected.answers];
    updated[index].text = text;
    setSelected({ ...selected, answers: updated });
  }

  function handleCorrectChange(index: number) {
    if (!selected) return;
    const updated = selected.answers.map((a, i) => ({
      ...a,
      correct: i === index,
    }));
    setSelected({ ...selected, answers: updated });
  }

  async function handleUpdate() {
    if (!selected) return;

    // TODO: Þetta þarf að passa við API-ið þitt!
    const res = await api.updateQuestion(selected.id, {
      question: selected.text,
      answers: selected.answers.map((a) => a.text),
      correctAnswer: selected.answers.findIndex((a) => a.correct),
      category: selected.category.slug,
    });

    if (res) {
      setMessage('Spurning uppfærð!');
    } else {
      setMessage('Villa við uppfærslu.');
    }
  }

  if (!selected) {
    return (
      <div>
        <h1>Veldu spurningu til að breyta</h1>

        {uiState === 'loading' && <p>Sæki spurningar...</p>}
        {uiState === 'error' && <p>Villa við að sækja spurningar</p>}
        {uiState === 'empty' && <p>Engar spurningar til</p>}

        <ul>
          {questions.map((q) => (
            <li key={q.id}>
              {q.text}{' '}
              <button onClick={() => setSelected(q)}>Breyta</button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div>
      <h1>Breyta spurningu</h1>

      <label>Spurning:</label>
      <input
        value={selected.text}
        onChange={(e) => setSelected({ ...selected, text: e.target.value })}
      />

      <label>Svör:</label>
      {selected.answers.map((answer, index) => (
        <div key={answer.id}>
          <input
            value={answer.text}
            onChange={(e) => handleAnswerChange(index, e.target.value)}
          />
          <label>
            <input
              type="radio"
              name="correct"
              checked={answer.correct}
              onChange={() => handleCorrectChange(index)}
            />
            Rétt
          </label>
        </div>
      ))}

      <button onClick={handleUpdate}>Vista breytingar</button>
      <button onClick={() => setSelected(null)}>Hætta við</button>

      {message && <p>{message}</p>}
    </div>
  );
}
