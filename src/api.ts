import { Category, Paginated, Question } from './types';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

export class QuestionsApi {
  async fetchFromApi<T>(url: string): Promise<T | null> {
    let response: Response | undefined;
    try {
      response = await fetch(url);
    } catch (e) {
      console.error('error fetching from api', url, e);
      return null;
    }

    if (!response.ok) {
      console.error('non 2xx status from API', url);
      return null;
    }

    if (response.status === 404) {
      console.error('404 from API', url);
      return null;
    }

    let json: unknown;
    try {
      json = await response.json();
    } catch (e) {
      console.error('error parsing json', url, e);
      return null;
    }

    return json as T;
  }

  async getCategory(slug: string): Promise<Category | null> {
    const url = BASE_URL + `/categories/${slug}`;

    const response = await this.fetchFromApi<Category | null>(url);

    return response;
  }

  async getCategories(): Promise<Paginated<Category> | null> {
    const url = BASE_URL + '/categories';

    const response = await this.fetchFromApi<Paginated<Category>>(url);

    // TODO hér gæti ég staðfest gerð gagna

    return response;
  }

  async getQuestions(
    categorySlug: string,
  ): Promise<Paginated<Question> | null> {
    const url = BASE_URL + `/questions?category=${categorySlug}`;
    // new URL()

    const response = await this.fetchFromApi<Paginated<Question>>(url);

    return response;
  }

  async createCategory(name: string): Promise<Category | null> {
    const response = await fetch(BASE_URL + '/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
  
    if (!response.ok) {
      console.error('Error creating category');
      return null;
    }
  
    return await response.json();
  }

  async updateCategory(slug: string, newName: string): Promise<Category | null> {
    const response = await fetch(BASE_URL + `/categories/${slug}`, {
      method: 'PATCH', // eða PUT ef það passar við API
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName }),
    });
  
    if (!response.ok) {
      console.error('Error updating category');
      return null;
    }
  
    return await response.json();
  }

  async deleteCategory(slug: string): Promise<boolean> {
    const response = await fetch(BASE_URL + `/categories/${slug}`, {
      method: 'DELETE',
    });
  
    return response.ok;
  }

  async createQuestion(question: {
    question: string;
    answers: string[];
    correctAnswer: number;
    category: string;
  }): Promise<Question | null> {
    const response = await fetch(BASE_URL + '/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(question),
    });
  
    if (!response.ok) {
      console.error('Error creating question');
      return null;
    }
  
    return await response.json();
  }

  async updateQuestion(
    id: number,
    question: {
      question: string;
      answers: string[];
      correctAnswer: number;
      category: string;
    }
  ): Promise<Question | null> {
    const res = await fetch(`${BASE_URL}/questions/${id}`, {
      method: 'PATCH', // eða PUT, fer eftir API
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(question),
    });
  
    if (!res.ok) return null;
    return await res.json();
  }
}
