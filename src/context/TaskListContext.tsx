import React, { useContext, useReducer, Dispatch, createContext } from 'react';

interface ITasks {
	(key: number): string;
}

interface ITaskContainer {
	date: string;
	tasks: ITasks;
}

interface ITaskListState {
	taskList: ITaskContainer[];
}

interface ITaskListDispatch {
	type: 'SET_TASKLIST';
	taskList: ITaskContainer[];
}

const taskListReducer = (state: ITaskListState, action: ITaskListDispatch): ITaskListState => {
	switch (action.type) {
		case 'SET_TASKLIST':
			return {
				...state,
				taskList: action.taskList,
			};
		default:
			throw new Error('Unhandled action');
	}
};

const TaskListStateContext = createContext<ITaskListState | null>(null);
const TaskListDispatchContext = createContext<Dispatch<ITaskListDispatch> | null>(null);

export const TaskListContext = ({ children }: { children: React.ReactNode }) => {
	const [taskListState, taskListDispatch] = useReducer(taskListReducer, { taskList: [] });
	return (
		<TaskListStateContext.Provider value={taskListState}>
			<TaskListDispatchContext.Provider value={taskListDispatch}>{children}</TaskListDispatchContext.Provider>
		</TaskListStateContext.Provider>
	);
};

export function useTaskListState(): ITaskListState {
	const state = useContext(TaskListStateContext);
	if (!state) throw new Error('Cannot find TaskListProvider');
	return state;
}

export function useTaskListDispatch(): Dispatch<ITaskListDispatch> {
	const dispatch = useContext(TaskListDispatchContext);
	if (!dispatch) throw new Error('Cannot find TaskListProvider');
	return dispatch;
}
