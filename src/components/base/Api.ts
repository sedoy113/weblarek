import { ApiPostMethods, IApi } from '../../types';

// Тип для ответа API, содержащего список элементов с пагинацией
export type ApiListResponse<Type> = {
	total: number; // Общее количество элементов
	items: Type[]; // Массив элементов текущей страницы
};

// Реализация класса для работы с API
export class Api implements IApi {
	readonly baseUrl: string; // Базовый URL API
	protected options: RequestInit; // Настройки запроса по умолчанию

	// Конструктор класса
	constructor(baseUrl: string, options: RequestInit = {}) {
		this.baseUrl = baseUrl;
		this.options = {
			headers: {
				'Content-Type': 'application/json', // Устанавливаем заголовок JSON по умолчанию
				...((options.headers as object) ?? {}), // Объединяем с переданными заголовками
			},
		};
	}

	// Обработчик ответа от сервера
	protected handleResponse<T>(response: Response): Promise<T> {
		// Если ответ успешный (статус 200-299), парсим JSON
		if (response.ok) return response.json();
		// Если ошибка, пытаемся получить сообщение об ошибке из JSON
		// или используем стандартный текст статуса
		else
			return response
				.json()
				.then((data) => Promise.reject(data.error ?? response.statusText));
	}

	// GET-запрос для получения данных
	get<T>(uri: string) {
		return fetch(this.baseUrl + uri, {
			...this.options, // Используем базовые настройки
			method: 'GET', // Указываем метод GET
		}).then(this.handleResponse<T>); // Обрабатываем ответ
	}

	// POST/PUT/PATCH запрос для отправки данных
	post<T>(uri: string, data: object, method: ApiPostMethods = 'POST') {
		return fetch(this.baseUrl + uri, {
			...this.options, // Используем базовые настройки
			method, // Метод запроса (POST, PUT, PATCH)
			body: JSON.stringify(data), // Преобразуем данные в JSON строку
		}).then(this.handleResponse<T>); // Обрабатываем ответ
	}
}
