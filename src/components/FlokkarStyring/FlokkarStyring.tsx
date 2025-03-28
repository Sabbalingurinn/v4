'use client';

import { useEffect, useState } from 'react';
import { QuestionsApi } from '@/api';
import { Category, UiState } from '@/types';

export function FlokkarStyring() {
  const [name, setName] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [uiState, setUiState] = useState<UiState>('initial');
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');

  const api = new QuestionsApi();

  async function fetchCategories() {
    setUiState('loading');
    const result = await api.getCategories();
    if (!result) return setUiState('error');

    setCategories(result.data);
    setUiState(result.data.length ? 'data' : 'empty');
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  async function handleCreate() {
    if (!name.trim()) return;
    await api.createCategory(name);
    setName('');
    await fetchCategories();
  }

  async function handleDelete(slug: string) {
    await api.deleteCategory(slug);
    await fetchCategories();
  }

  async function handleEdit(slug: string) {
    if (!editedName.trim()) return;
    await api.updateCategory(slug, { name: editedName });
    setEditingSlug(null);
    setEditedName('');
    await fetchCategories();
  }

  return (
    <div>
      <h1>Flokkastýring</h1>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nafn nýs flokks"
        required
      />
      <button onClick={handleCreate}>Búa til</button>

      {uiState === 'loading' && <p>Sæki flokka...</p>}
      {uiState === 'error' && <p>Villa við að sækja flokka</p>}
      {uiState === 'empty' && <p>Engir flokkar til</p>}

      {uiState === 'data' && (
        <ul>
          {categories.map((cat) => (
            <li key={cat.slug}>
              {editingSlug === cat.slug ? (
                <>
                  <input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                  />
                  <button onClick={() => handleEdit(cat.slug)}>Vista</button>
                  <button onClick={() => setEditingSlug(null)}>Hætta við</button>
                </>
              ) : (
                <>
                  {cat.name}{' '}
                  <button
                    onClick={() => {
                      setEditingSlug(cat.slug);
                      setEditedName(cat.name);
                    }}
                  >
                    Breyta
                  </button>{' '}
                  <button onClick={() => handleDelete(cat.slug)}>Eyða</button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
