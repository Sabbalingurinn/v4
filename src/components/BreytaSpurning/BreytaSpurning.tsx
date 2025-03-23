'use client';

import { useEffect, useState } from 'react';
import { QuestionsApi } from '@/api';
import { Category, Question, UiState } from '@/types';

export function BreytaSpurningu() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selected, setSelected] = useState<Question | null>(null);
  const [uiState, setUiState] = useState<UiState>('initial');
  const [message, setMessage] = useState('');

  const api = new QuestionsApi();

  useEffect(() => {
    async function fetchCategories() {
      const result = await api.getCategories();
      if (result && 'data' in result) {
        setCategories(result.data);
      }
    }

    fetchCategories();
  }, []);

  async function fetchQuestionsForCategory(slug: string) {
    setUiState('loading');
    const result = await api.getQuestions(slug);
    if (!result) return setUiState('error');
    setQuestions(result.data);
    setUiState(result.data.length ? 'data' : 'empty');
  }

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

    const payload = {
      text: selected.text,
      categoryId: parseInt(selected.category.id),
      answers: selected.answers.map((a) => ({
        text: a.text,
        correct: a.correct,
      })),
    };

    const success = await api.updateQuestion(selected.id, payload);

    if (success) {
      setMessage('Spurning uppfærð!');
      await fetchQuestionsForCategory(selected.category.slug);
    } else {
      setMessage('Villa við uppfærslu.');
    }
  }

  async function handleDelete() {
    if (!selected) return;

    const confirmed = confirm('Ertu viss um að þú viljir eyða þessari spurningu?');
    if (!confirmed) return;

    const success = await api.deleteQuestion(selected.id);

    if (success) {
      setMessage('Spurning eydd!');
      setSelected(null);
      await fetchQuestionsForCategory(selected.category.slug);
    } else {
      setMessage('Villa við að eyða spurningu.');
    }
  }

  return (
    <div>
      <h1>Breyta spurningu</h1>

      {/* Velja flokk */}
      <label>Veldu flokk:</label>
      <select
        value={selectedCategorySlug}
        onChange={(e) => {
          const slug = e.target.value;
          setSelectedCategorySlug(slug);
          setSelected(null);
          if (slug) fetchQuestionsForCategory(slug);
        }}
      >
        <option value="">-- Veldu flokk --</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.slug}>
            {cat.name}
          </option>
        ))}
      </select>

      {/* Listi af spurningum */}
      {!selected && selectedCategorySlug && (
        <div>
          <h2>Spurningar í flokknum</h2>
          {uiState === 'loading' && <p>Sæki spurningar...</p>}
          {uiState === 'error' && <p>Villa við að sækja spurningar</p>}
          {uiState === 'empty' && <p>Engar spurningar fundust</p>}
          {uiState === 'data' && (
            <ul>
              {questions.map((q) => (
                <li key={q.id}>
                  {q.text}{' '}
                  <button onClick={() => setSelected(q)}>Breyta</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Form til að breyta */}
      {selected && (
        <div>
          <h2>Breyta spurningu</h2>

          <label>Spurning:</label>
          <input
            value={selected.text}
            onChange={(e) => setSelected({ ...selected, text: e.target.value })}
          />

          <label>Svör:</label>
          {selected.answers.map((answer, index) => (
            <div key={index}>
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
          <button onClick={handleDelete}>Eyða spurningu</button>
          <button
            onClick={() => {
              setSelected(null);
              setMessage('');
            }}
          >
            Hætta við
          </button>

          {message && <p>{message}</p>}
        </div>
      )}
    </div>
  );
}
