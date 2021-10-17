export interface ITodo {
	(key: number): string;
}

export interface IDateContainer {
	date: string;
	todos: ITodo[];
}

export interface ITodoAll {
	todoAll: IDateContainer[];
}
