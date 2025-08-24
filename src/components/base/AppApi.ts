import { IApi, ICard, IOrder, IOrderResult } from '../../types';
import { ApiListResponse } from './apit';

/**
 * Класс для взаимодействия с API приложения.
 * Обеспечивает доступ к функциональности получения карточек товаров и оформления заказов.
 */
export class AppApi {
	/**
	 * Базовый экземпляр API для выполнения HTTP-запросов.
	 * @private
	 */
	private _baseApi: IApi;
	/**
	 * Конструктор класса AppApi.
	 * @param baseApi - Экземпляр базового API для использования в запросах.
	 */
	constructor(baseApi: IApi) {
		this._baseApi = baseApi;
	}
	/**
	 * Получает список карточек товаров с сервера.
	 * Выполняет GET-запрос к эндпоинту `/product` и возвращает массив объектов ICard.
	 * @returns Промис, разрешающийся в массив карточек товаров.
	 */
	getCards(): Promise<ICard[]> {
		return this._baseApi
			.get<ApiListResponse<ICard>>(`/product`)
			.then((data: ApiListResponse<ICard>) => data.items.map((item) => item));
	}
	/**
	 * Оформляет заказ на основе переданных данных.
	 * Выполняет POST-запрос к эндпоинту `/order` с данными заказа.
	 * @param order - Объект, содержащий данные заказа (IOrder).
	 * @returns Промис, разрешающийся в результат заказа (IOrderResult).
	 */
	orderCards(order: IOrder): Promise<IOrderResult> {
		return this._baseApi
			.post<IOrderResult>(`/order`, order)
			.then((data: IOrderResult) => data);
	}
}
