import React, { useContext, useReducer, Dispatch, createContext } from 'react';
import { IDateContainer, ITodoAll } from '../types/taskListTypes';

interface ITaskListDispatch {
	type: 'SET_TASKLIST';
	todoAll: IDateContainer[];
}

const taskListReducer = (state: ITodoAll, action: ITaskListDispatch): ITodoAll => {
	switch (action.type) {
		case 'SET_TASKLIST':
			return {
				...state,
				todoAll: action.todoAll,
			};
		default:
			throw new Error('Unhandled action');
	}
};

const TaskListStateContext = createContext<ITodoAll | null>(null);
const TaskListDispatchContext = createContext<Dispatch<ITaskListDispatch> | null>(null);

export const TaskListContext = ({ children }: { children: React.ReactNode }) => {
	const [taskListState, taskListDispatch] = useReducer(taskListReducer, { todoAll: [] });
	return (
		<TaskListStateContext.Provider value={taskListState}>
			<TaskListDispatchContext.Provider value={taskListDispatch}>{children}</TaskListDispatchContext.Provider>
		</TaskListStateContext.Provider>
	);
};

export function useTaskListState(): ITodoAll {
	const state = useContext(TaskListStateContext);
	if (!state) throw new Error('Cannot find TaskListProvider');
	return state;
}

export function useTaskListDispatch(): Dispatch<ITaskListDispatch> {
	const dispatch = useContext(TaskListDispatchContext);
	if (!dispatch) throw new Error('Cannot find TaskListProvider');
	return dispatch;
}
