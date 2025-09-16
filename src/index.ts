// Импорт стилей для всего приложения
import './scss/styles.scss';

// Импорт основных классов и модулей приложения
import { EventEmitter } from './components/base/Events';
import { AppApi } from './components/base/AppApi';
import { AppPresenter } from './components/presenter/AppPresenter';
import { API_URL, settings } from './utils/constants';
import { Api } from './components/base/Api';

// Создание экземпляра EventEmitter для управления событиями приложения
// EventEmitter служит центральной шиной событий для коммуникации между компонентами
const events = new EventEmitter();

// Создание базового API клиента для взаимодействия с сервером
// Api - низкоуровневый HTTP клиент, AppApi - высокоуровневая обертка с бизнес-логикой
const baseApi = new AppApi(new Api(API_URL, settings));

// Создание главного презентера приложения
// Презентер связывает модель, API и представление, управляя бизнес-логикой
// Он подписывается на события и координирует взаимодействие всех компонентов
new AppPresenter(baseApi, events);
